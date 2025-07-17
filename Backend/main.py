from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import sys
import os
from dotenv import load_dotenv
import math
import pandas as pd

# Load environment variables from .env file
load_dotenv()

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../OrderBot/Embeddings')))

from embedding import test_embeddings_across_files
from groq import Groq

# Prompt template
PROMPT_TEMPLATE = """
You are **CrimsonBot**, a helpful and knowledgeable assistant specializing in restaurant recommendations. 
Your task is to assist users by answering their food-related queries using only the menu items provided in the context below.

🧠 STRICT INSTRUCTIONS — FOLLOW THESE RULES:
1. **Only use information from the provided context.**
2. **Do not invent or assume** anything outside the context.
3. **For recommendations**: match based on category or descriptions.
4. **For price-related queries**: use exact values.
5. **For visual-related queries**: reference image URLs.
6. **Structure clearly** with bullet points/headings.
7. **Be concise and direct**.

---
🍽️ CONTEXT MENU ITEMS:
{context}

❓ USER QUESTION:
{question}

💬 YOUR RESPONSE:
"""

app = FastAPI()

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174","http://localhost:5173" ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class PromptRequest(BaseModel):
    prompt: str

class Item(BaseModel):
    Category: str
    Name: str
    Description: str
    Price: float
    Old_Price: float = None
    Image_URL: str = ""
    similarity: float
    source_file: str = ""

class QueryResponse(BaseModel):
    matches: List[Item]
    recommendation: str

# LLM
def call_llm(prompt: str) -> str:
    client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
    chat_completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama3-70b-8192",
    )
    return chat_completion.choices[0].message.content

# Parse helper
def parse_price(value: Any) -> float:
    try:
        if isinstance(value, str):
            value = value.lower().replace("rs.", "").replace("from", "").replace(",", "").strip()
        return float(value)
    except:
        return 0.0

def clean_item(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "Category": str(item.get("Category", "")).strip(),
        "Name": str(item.get("Name", "")).strip(),
        "Description": str(item.get("Description", "")).strip() if not pd.isna(item.get("Description", "")) else "",
        "Price": parse_price(item.get("Price", 0.0)),
        "Old_Price": parse_price(item.get("Old_Price", 0.0)) if item.get("Old_Price") else 0.0,
        "Image_URL": str(item.get("Image_URL", "https://admin.broadwaypizza.com.pk/Images/ProductImages/500x500-low-res-min.jpg")),
        "similarity": float(item.get("similarity", 0.0)),
        "source_file": str(item.get("source_file", "")),
    }

# Route
@app.post("/query-items", response_model=QueryResponse)
async def query_items(req: PromptRequest) -> Dict[str, Any]:
    try:
        raw_results = test_embeddings_across_files(query=req.prompt, top_k=5)
        raw_items = raw_results.get(req.prompt, [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding search failed: {e}")

    top_matches = []
    context_lines = []


    for i, item in enumerate(raw_items, start=1):
        cleaned = clean_item(item)
        top_matches.append(cleaned)
        context_lines.append(
            f"{i}. {cleaned['Name']} ({cleaned['Category']}) — Rs.{cleaned['Price']}. {cleaned['Description']}"
        )

        
        
    full_prompt = PROMPT_TEMPLATE.format(
        context="\n".join(context_lines),
        question=req.prompt
    )

    try:
        llm_response = call_llm(full_prompt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM call failed: {e}")

    return {
        "matches": top_matches,
        "recommendation": llm_response
    }
