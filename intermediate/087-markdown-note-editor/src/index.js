import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Assuming you have a basic CSS file for global styles
import App from './App'; // Your main application component

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
