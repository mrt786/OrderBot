import React, { useState } from 'react';
import axios from 'axios';
import {
  Container, Typography, Card, CardContent, TextField, Button,
  Grid, Modal, Box, Chip, Alert, Fade, IconButton, CardMedia
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import DiningIcon from '@mui/icons-material/Restaurant';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress'
import './index.css';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/query-items', 
      {
        prompt: prompt,
      });
      console.log(response.data.matches);
      setItems(response.data.matches || []);

    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const getCategoryColor = (category) => {
  switch (category.toLowerCase()) {
    case 'cake': return '#9B0D2B';
    case 'pizza': return '#7A0A22';
    default: return '#999';
  }
};
   return (
    <div className="min-h-screen bg-primary-gradient">
      <Container maxWidth="lg" className="py-5">
        {/* Header */}
        <div className="text-center mb-5">
          <Typography 
            variant="h2" 
            component="h1" 
            className="text-white font-bold mb-3"
            sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            🤖 Food Chatbot
          </Typography>
          <Typography 
            variant="h5" 
            component="h2" 
            className="text-white opacity-90"
          >
            Ask me for cake or pizza recommendations!
          </Typography>
        </div>

        {/* Input Form */}
        <Card className="mb-5 shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3 align-items-end">
                <div className="col-md-9">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="What are you craving today?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., I want something sweet, or Show me some pizza options"
                    disabled={loading}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#9B0D2B',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#9B0D2B',
                      },
                    }}
                  />
                </div>
                <div className="col-md-3">
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !prompt.trim()}
                    className="btn-primary-custom h-100"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      backgroundColor: '#9B0D2B',
                      '&:hover': {
                        backgroundColor: '#7A0A22',
                      },
                      height: '56px'
                    }}
                  >
                    {loading ? 'Getting...' : 'Get Recommendations'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Results */}
        {items.length > 0 && (
          <Fade in={true}>
            <div>
              <Typography 
                variant="h4" 
                component="h3" 
                className="text-white mb-4 text-center"
                sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}
              >
                🍽️ Here are your recommendations:
              </Typography>
              
              <Grid 
                  container 
                  spacing={4} 
                  sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)'
                    },
                    gap: 4
                  }}
                >

                {items.map((item, index) => (
                  <Grid 
                      key={index}
                      sx={{ 
                        gridColumn: {
                          xs: 'span 12',
                          sm: 'span 6',
                          lg: 'span 4'
                        } 
                      }}
                    >

                    <Card 
                      className="card-hover shadow-lg h-100 fade-in"
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        animation: `fadeIn 0.5s ease-in ${index * 0.1}s both`
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={item.Image_URL}
                        alt={item.Name}
                        onClick={() => handleImageClick(item.Image_URL)}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Typography variant="h6" component="h4" className="fw-bold">
                            {item.Name}
                          </Typography>
                          <Chip 
                            label={item.Category.toUpperCase()}
                            size="small"
                            sx={{ 
                              backgroundColor: getCategoryColor(item.Category),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            icon={<DiningIcon />}
                          />
                        </div>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          className="mb-3 flex-grow-1"
                        >
                          {item.Description}
                        </Typography>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <Typography 
                              variant="h6" 
                              component="span" 
                              className="fw-bold"
                              sx={{ color: '#9B0D2B' }}
                            >
                              Rs: {item.Price.toFixed(2)}
                            </Typography>
                          </div>
                          <Button 
                            variant="outlined" 
                            size="small"
                            onClick={() => handleImageClick(item.Image_URL)}
                            sx={{
                              borderColor: '#9B0D2B',
                              color: '#9B0D2B',
                              '&:hover': {
                                borderColor: '#7A0A22',
                                backgroundColor: 'rgba(155, 13, 43, 0.1)'
                              }
                            }}
                          >
                            View Image
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </div>
          </Fade>
        )}

        {/* Image Modal */}
        <Modal
          open={modalOpen}
          onClose={handleCloseModal}
          aria-labelledby="image-modal"
          className="d-flex align-items-center justify-content-center"
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              outline: 'none',
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(155, 13, 43, 0.8)',
                color: 'white',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: 'rgba(155, 13, 43, 1)',
                }
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Food item"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }}
              />
            )}
          </Box>
        </Modal>

        {/* Footer */}
        <div className="text-center mt-5">
          <Typography 
            variant="body2" 
            className="text-white opacity-75"
          >
            Made with ❤️ using React, Material-UI, Tailwind CSS & Bootstrap
          </Typography>
        </div>
      </Container>
    </div>
  );

}







// Old Frontend Code


  // return (
  //   <div className="min-h-screen bg-white text-[#9B0D2B] p-4">
  //     <div className="max-w-3xl mx-auto text-center">
  //       <h1 className="text-4xl font-bold mb-6">OrderBot Recommendations</h1>
  //       <div className="flex items-center justify-center gap-2 mb-4">
  //         <input
  //           type="text"
  //           placeholder="Ask me anything..."
  //           value={prompt}
  //           onChange={(e) => setPrompt(e.target.value)}
  //           className="w-full border border-[#9B0D2B] rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-[#9B0D2B]"
  //         />
  //         <button
  //           onClick={handleSubmit}
  //           disabled={loading}
  //           className={`px-4 py-2 rounded-xl text-white ${
  //             loading ? 'bg-gray-400' : 'bg-[#9B0D2B] hover:bg-[#7a0a22]'
  //           }`}
  //         >
  //           {loading ? 'Loading...' : 'Submit'}
  //         </button>
  //       </div>

  //       {loading && <p className="text-[#9B0D2B]">Loading recommendations...</p>}
  //       {error && <p className="text-red-600">{error}</p>}

  //       <div className="grid md:grid-cols-2 gap-4 mt-6">
  //         {items.map((item, idx) => (
  //           <div
  //             key={idx}
  //             onClick={() => setSelectedImage(item.Image_URL)}
  //             className="cursor-pointer border border-[#9B0D2B] rounded-xl p-4 shadow-md hover:bg-[#9b0d2b0d]"
  //           >
  //             <div className="text-sm text-white bg-[#9B0D2B] inline-block px-2 py-1 rounded-full mb-2">
  //               {item.Category}
  //             </div>
  //             <h2 className="text-xl font-semibold">{item.Name}</h2>
  //             <p className="text-md font-medium text-[#9B0D2B]">Rs. {item.Price}</p>
  //             <p className="text-sm text-gray-700 mt-1">{item.Description}</p>
  //           </div>
  //         ))}
  //       </div>



  //       {selectedImage && (  
  //         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
  //           <div className="bg-white p-4 rounded-xl relative max-w-md">
  //             <button
  //               onClick={() => setSelectedImage(null)}
  //               className="absolute top-2 right-2 text-[#9B0D2B] font-bold"
  //             >
  //               ×
  //             </button>
  //             <img
  //               src={selectedImage}
  //               alt="Selected"
  //               className="w-full h-auto rounded-xl"
  //             />
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
