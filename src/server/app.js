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
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
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

// Socket.io chat and video call functionality
const onlineVideoUsers = new Map(); // Track users in video call lobby

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

  // Video call: Join video lobby
  socket.on('video-join', (userData) => {
    socket.videoUserData = userData;
    onlineVideoUsers.set(socket.id, {
      id: userData.id,
      name: userData.name,
      socketId: socket.id
    });
    
    console.log(`${userData.name} joined video lobby`);
    
    // Send updated user list to all clients
    const userList = Array.from(onlineVideoUsers.values()).map(user => ({
      id: user.id,
      name: user.name
    }));
    io.emit('online-users', userList);
  });

  // Video call: Offer
  socket.on('video-offer', ({ to, offer }) => {
    const targetUser = Array.from(onlineVideoUsers.values()).find(user => user.id === to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('video-offer', {
        from: socket.videoUserData?.id,
        fromName: socket.videoUserData?.name,
        offer
      });
    }
  });

  // Video call: Answer
  socket.on('video-answer', ({ to, answer }) => {
    const targetUser = Array.from(onlineVideoUsers.values()).find(user => user.id === to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('video-answer', {
        from: socket.videoUserData?.id,
        answer
      });
    }
  });

  // Video call: ICE candidate
  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetUser = Array.from(onlineVideoUsers.values()).find(user => user.id === to);
    if (targetUser) {
      io.to(targetUser.socketId).emit('ice-candidate', {
        from: socket.videoUserData?.id,
        candidate
      });
    }
  });

  // Video call: Leave
  socket.on('leave-video', () => {
    if (socket.videoUserData) {
      console.log(`${socket.videoUserData.name} left video call`);
      io.emit('user-left-video', {
        userId: socket.videoUserData.id
      });
    }
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
    // Remove from video users
    if (socket.videoUserData) {
      onlineVideoUsers.delete(socket.id);
      const userList = Array.from(onlineVideoUsers.values()).map(user => ({
        id: user.id,
        name: user.name
      }));
      io.emit('online-users', userList);
      io.emit('user-left-video', {
        userId: socket.videoUserData.id
      });
    }
    
    // Handle chat disconnect
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
