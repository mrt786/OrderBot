// App.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './index.css'

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/query-items', 
      {
        prompt: prompt,
      });
      

      setItems(response.data.matches || []);
      console.log(response.data.matches);
    } catch (err) {
      setError('Failed to fetch items.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#9B0D2B] p-4">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">OrderBot Recommendations</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full border border-[#9B0D2B] rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#9B0D2B]"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-white ${
              loading ? 'bg-gray-400' : 'bg-[#9B0D2B] hover:bg-[#7a0a22]'
            }`}
          >
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </div>

        {loading && <p className="text-[#9B0D2B]">Loading recommendations...</p>}
        {error && <p className="text-red-600">{error}</p>}

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(item.Image_URL)}
              className="cursor-pointer border border-[#9B0D2B] rounded-xl p-4 shadow-md hover:bg-[#9b0d2b0d]"
            >
              <div className="text-sm text-white bg-[#9B0D2B] inline-block px-2 py-1 rounded-full mb-2">
                {item.Category}
              </div>
              <h2 className="text-xl font-semibold">{item.Name}</h2>
              <p className="text-md font-medium text-[#9B0D2B]">Rs. {item.Price}</p>
              <p className="text-sm text-gray-700 mt-1">{item.Description}</p>
            </div>
          ))}
        </div>



        {selectedImage && (  
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-4 rounded-xl relative max-w-md">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 text-[#9B0D2B] font-bold"
              >
                ×
              </button>
              <img
                src={selectedImage}
                alt="Selected"
                className="w-full h-auto rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
