// Configuration
const API_BASE_URL = 'http://localhost:5000/api'; // Replace with your actual backend URL

// --- Utility Functions for API Calls ---
async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Authentication required, but no token found.');
            // Optionally redirect to login page
            // window.location.href = '/login.html';
            throw new Error('No authentication token.');
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong with the API request.');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// --- Authentication Functions ---
const auth = {
    async register(name, email, password) {
        return apiRequest('/auth/register', 'POST', { name, email, password });
    },
    async login(email, password) {
        const data = await apiRequest('/auth/login', 'POST', { email, password });
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user info
        }
        return data;
    },
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('User logged out.');
        // Optionally redirect
        // window.location.href = '/';
    },
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    isLoggedIn() {
        return !!localStorage.getItem('token');
    },
};

// --- Product Functions ---
const products = {
    async getAllProducts(queryParams = '') {
        return apiRequest(`/products${queryParams}`);
    },
    async getProductById(id) {
        return apiRequest(`/products/${id}`);
    },
    // Admin only:
    async createProduct(productData) {
        return apiRequest('/products', 'POST', productData, true);
    },
    async updateProduct(id, productData) {
        return apiRequest(`/products/${id}`, 'PUT', productData, true);
    },
    async deleteProduct(id) {
        return apiRequest(`/products/${id}`, 'DELETE', null
