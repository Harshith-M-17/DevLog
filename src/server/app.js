const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// CORS middleware FIRST
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://devlogbyharshith.netlify.app'
  ],
  credentials: true
}));

// CORS preflight handler for all OPTIONS requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://devlogbyharshith.netlify.app'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Connect to MongoDB Atlas
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/entries', require('./routes/entry'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
