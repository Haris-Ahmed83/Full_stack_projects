const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const server = http.createServer(app);
// Initialize Socket.io server with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in development
        methods: ["GET", "POST"]
    }
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Basic Express Route
app.get('/', (req, res) => {
    res.send('Real-Time Chat App Server is running!');
});

// Store online users and their socket IDs
// Format: { socketId: { userId, username } }
const onlineUsers = {}; 
// Store which room each socket is currently in
// Format: { socketId: roomName }
const userRooms = {}; 

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user going online
    socket.on('goOnline', ({ userId, username }) => {
        onlineUsers[socket.id] = { userId, username };
        // Notify all clients that a user has come online
        io.emit('userOnline', { userId, username, socketId: socket.id });
        console.log(`${username} (${userId}) is online.`);
    });

    // Handle joining a room
    socket.on('joinRoom', ({ roomName, userId }) => {
        // If the user was in another room, make them leave it first
        if (userRooms[socket.id] && userRooms[socket.id] !== roomName) {
            const oldRoom = userRooms[socket.id];
            socket.leave(oldRoom);
            console.log(`${onlineUsers[socket.id]?.username || userId} left room: ${oldRoom}`);
            // Optional: Notify old room that user left
            // io.to(oldRoom).emit('userLeftRoom', { username: onlineUsers[socket.id]?.username || userId });
        }
        
        socket.join(roomName);
        userRooms[socket.id] = roomName; // Store the room the socket is in
        console.log(`${onlineUsers[socket.id]?.username || userId} joined room: ${roomName}`);
        
        // Confirm to the user that they joined the room
        socket.emit('roomJoined', { roomName });
        // Optional: Notify others in the room that a user joined
        // socket.to(roomName).emit('userJoinedRoom', { username: onlineUsers[socket.id]?.username || userId });
    });

    // Handle sending a message
    socket.on('sendMessage', ({ roomName, message, senderId, senderUsername }) => {
        console.log(`Message in room ${roomName} from ${senderUsername}: ${message}`);
        // In a real app, you would save this message to MongoDB here.
        // Example:
        // const Message = mongoose.model('Message', new mongoose.Schema({
        //     roomName: String,
        //     senderId: String,
        //     senderUsername: String,
        //     message: String,
        //     timestamp: { type: Date, default: Date.now }
        // }));
        // const newMessage = new Message({ roomName, senderId, senderUsername, message });
        // newMessage.save().then(savedMessage => {
        //     io.to(roomName).emit('receiveMessage', savedMessage);
        // }).catch(err => console.error('Error saving message:', err));

        // For now, just broadcast directly
        io.to(roomName).emit('receiveMessage', { 
            roomName, 
            message, 
            senderId, 
            senderUsername, 
            timestamp: new Date() 
        });
    });

    // Handle typing indicator
    socket.on('typing', ({ roomName, username }) => {
        // Broadcast to all clients in the room except the sender
        socket.to(roomName).emit('userTyping', { roomName, username });
    });

    // Handle stop typing indicator
    socket.on('stopTyping', ({ roomName, username }) => {
        // Broadcast to all clients in the room except the sender
        socket.to(roomName).emit('userStopTyping', { roomName, username });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const disconnectedUser = onlineUsers[socket.id];
        if (disconnectedUser) {
            delete onlineUsers[socket.id];
            // Notify all clients that a user has gone offline
            io.emit('userOffline', { userId: disconnectedUser.userId, socketId: socket.id });
            console.log(`${disconnectedUser.username} (${disconnectedUser.userId}) went offline.`);
        }
        
        // If the user was in a room, remove them from tracking
        if (userRooms[socket.id]) {
            const roomLeft = userRooms[socket.id];
            socket.leave(roomLeft);
            delete userRooms[socket.id];
            console.log(`User ${socket.id} left room ${roomLeft} on disconnect.`);
            // Optional: Notify room that user left
            // io.to(roomLeft).emit('userLeftRoom', { username: disconnectedUser?.username || 'Unknown User' });
        }
        
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Optional: Graceful shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed.');
        server.close(() => {
            console.log('HTTP server closed.');
            process.exit(0);
        });
    });
});
