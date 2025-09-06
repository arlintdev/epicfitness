// Simple Express server for serving the built React app
// This handles client-side routing properly

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use('/epicfitness', express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all routes
app.get('/epicfitness/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Redirect root to /epicfitness
app.get('/', (req, res) => {
  res.redirect('/epicfitness');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/epicfitness in your browser`);
});