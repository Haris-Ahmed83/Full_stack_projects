import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Establish socket connection. For a real app, you might want to manage this
// with more robustness (e.g., context, memoization, or a dedicated service).
// Assuming your Socket.io server is running on http://localhost:3001
const socket = io('http://localhost:3001');

function App() {
  const [username, setUsername] = useState('');
  const [currentRoom, setCurrentRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]); // Users in the current room
  const [typingUsers, setTypingUsers] = useState([]); // Users currently typing in the current room
  const [roomList, setRoomList] = useState(['General', 'Tech', 'Random', 'Gaming']); // Example rooms

  const messagesEndRef = useRef(null); // For auto-scrolling chat

  // Auto-scroll to the bottom of the messages container
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('roomUsers', (users) => {
      // Filter out the current user from the list if the backend includes them
      // This is a simple way to update the online users list for the current room
      setOnlineUsers(users);
    });

    socket.on('typing', ({ username: typingUsername, room: typingRoom }) => {
      if (typingRoom === currentRoom && typingUsername !== username && !typingUsers.includes(typingUsername)) {
        setTypingUsers((prev) => [...prev, typingUsername]);
      }
    });

    socket.on('stopTyping', ({ username: typingUsername, room: typingRoom }) => {
      if (typingRoom === currentRoom) {
        setTypingUsers((prev) => prev.filter((u) => u !== typingUsername));
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Clean up socket listeners on component unmount
    return () => {
      socket.off('connect');
      socket.off('message');
      socket.off('roomUsers');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('disconnect');
    };
  }, [currentRoom, username, typingUsers]); // Dependencies for useEffect

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Username is set, now user can select a room.
      // No explicit socket emit for username here; it's passed when joining a room.
    } else {
      alert('Please enter a username.');
    }
  };

  const handleJoinRoom = (roomName) => {
    if (username.trim() && roomName) {
      if (currentRoom) {
        socket.emit('leaveRoom', { username, room: currentRoom });
      }
      setCurrentRoom(roomName);
      setMessages([]); // Clear messages when entering a new room
      setTypingUsers([]); // Clear typing indicator
      socket.emit('joinRoom', { username, room: roomName });
    } else {
      alert('Please enter a username first.');
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && username.trim() && currentRoom) {
      const msgData = {
        username: username,
        room: currentRoom,
        text: message,
        timestamp: new Date().toLocaleTimeString(),
      };
      socket.emit('chatMessage', msgData);
      setMessage('');
      socket.emit('stopTyping', { username, room: currentRoom }); // Stop typing after sending a message
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (e.target.value.trim() && username.trim() && currentRoom) {
      socket.emit('typing', { username, room: currentRoom });
    } else {
      socket.emit('stopTyping', { username, room: currentRoom });
    }
  };

  // Render username input screen if username is not set
  if (!username) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <h2>Welcome to Real-Time Chat</h2>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>Start Chatting</button>
          </form>
        </div>
      </div>
    );
  }

  // Main chat application UI
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Real-Time Chat App</h1>
        <p>Logged in as: <strong>{username}</strong></p>
      </header>

      <div style={styles.main}>
        <div style={styles
