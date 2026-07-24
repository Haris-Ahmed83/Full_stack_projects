// script.js

// --- Configuration ---
// IMPORTANT: For production, NEVER expose your API key directly in client-side code.
// Use a secure backend proxy to handle API requests.
// Replace 'YOUR_OPENAI_API_KEY' with your actual key or, better,
// replace 'YOUR_BACKEND_PROXY_URL' with your proxy endpoint.

// Option 1: Direct OpenAI API access (NOT RECOMMENDED for client-side production)
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const API_KEY = 'YOUR_OPENAI_API_KEY'; // Replace with your actual key or environment variable

// Option 2: Backend Proxy (RECOMMENDED for production)
// If you use a backend proxy, your proxy will handle the API key securely.
// Uncomment and configure these lines instead:
// const API_ENDPOINT = '/api/chat'; // Your proxy endpoint (e.g., a serverless
