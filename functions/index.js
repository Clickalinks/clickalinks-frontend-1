const functions = require('firebase-functions');
const express = require('express');
const app = express();

// Enable JSON parsing
app.use(express.json());

// Your API routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Add your purchase route from purchase.js
app.post('/purchase', (req, res) => {
  // Your purchase logic here
  res.json({ status: 'success', message: 'Purchase completed' });
});

// Export as a Firebase Function
exports.api = functions.https.onRequest(app);