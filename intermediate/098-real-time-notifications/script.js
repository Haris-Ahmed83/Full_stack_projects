// --- Configuration ---
const WEBSOCKET_URL = 'ws://localhost:8080/ws'; // Replace with your WebSocket server URL
const SSE_URL = 'http://localhost:8080/events'; // Replace with your SSE server URL

// DOM Elements (assumed to exist in index.html, e.g., <div id="notification-area"></div>, <span id="badge-count">0</span>, <button id="clear-notifications-btn">)
const notificationArea = document.getElementById('notification-area');
const badgeCountSpan = document.getElementById('badge-count
