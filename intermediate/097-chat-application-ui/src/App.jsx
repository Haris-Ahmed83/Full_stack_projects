import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

// Assuming the backend is running on port 3001
const socket = io('http://localhost:3001');

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState('');
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null); // Ref for the emoji picker div for click outside

  // Scroll to the bottom of the messages list
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Prompt for username if not set
    if (!username) {
      let user = localStorage.getItem('chatUsername');
      if (!user) {
        user = prompt('Please enter your username:');
        while (!user || user.trim() === '') {
          user = prompt('Username cannot be empty. Please enter your username:');
        }
        localStorage.setItem('chatUsername', user);
      }
      setUsername(user);
      // Emit user-joined after setting username
      socket.emit('user-joined', user);
    }

    // Socket listeners
    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (username) {
        socket.emit('user-joined', username
