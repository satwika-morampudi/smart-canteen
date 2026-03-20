const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Canteen API is running!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log('MongoDB error:', err));

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Make io accessible in routes later
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));