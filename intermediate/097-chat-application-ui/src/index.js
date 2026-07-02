import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { io } from 'socket.io-client';

// Initialize Socket.io client
// Replace with your backend URL where the Socket.io server is running
const socket = io('http://localhost:3001'); // Example: Your backend server URL

// Create a React Context to provide the socket instance to all components
export const SocketContext = React.createContext();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SocketContext.Provider value={socket}>
      <App />
    </SocketContext.Provider>
  </React.StrictMode>
);

// Optional: Basic socket event listeners for demonstration/debugging
socket.on('connect', () => {
  console.log('Connected to socket server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('Disconnected from socket server');
});

socket.on('connect_error', (err) => {
  console.log('Socket connection error:', err.message);
});
