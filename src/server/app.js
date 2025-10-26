const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://devlogbyharshith.netlify.app'
    ],
    credentials: true
  }
});

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

// Socket.io chat functionality
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a chat room
  socket.on('join', (userData) => {
    socket.userData = userData;
    console.log(`${userData.name} joined the chat`);
    
    // Broadcast to all clients that a user joined
    io.emit('user-joined', {
      name: userData.name,
      message: `${userData.name} joined the chat`
    });
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    const messageData = {
      id: Date.now(),
      userId: data.userId,
      userName: data.userName,
      message: data.message,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast message to all connected clients
    io.emit('receive-message', messageData);
  });

  // Handle user typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('user-typing', {
      userName: data.userName,
      isTyping: data.isTyping
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userData) {
      console.log(`${socket.userData.name} disconnected`);
      io.emit('user-left', {
        name: socket.userData.name,
        message: `${socket.userData.name} left the chat`
      });
    }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
