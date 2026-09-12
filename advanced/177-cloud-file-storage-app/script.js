const API_BASE_URL = '/api'; // Assuming a proxy or direct API calls
let currentPath = '/';
let authToken = 'YOUR_AUTH_TOKEN'; // In a real app, this would come from login/session

// --- Utility Functions ---

async function fetchApi(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        return await response.json();
    } catch (error
