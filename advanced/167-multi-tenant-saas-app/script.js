// script.js

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3000/api'; // Replace with your actual backend URL
const TOKEN_KEY = 'saas_auth_token';
const TENANT_KEY = 'saas_tenant_id'; // Stored after login if backend returns it

// --- Helper Functions ---
function getSubdomain() {
    const hostnameParts = window.location.hostname.split('.');
    // Assuming format like 'tenant.mydomain.com' or 'www.mydomain.com'
    if (hostnameParts.length > 2 && hostnameParts[0] !== 'www') {
        return hostnameParts[0];
    }
    // For local development or main marketing site, might return 'public' or 'localhost'
    return 'public'; // Default for main domain or local dev
}

function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function setAuthToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
}

function removeAuthToken() {
    localStorage.removeItem(TOKEN_KEY);
}

function getTenantIdFromStorage() {
    return localStorage.getItem(TENANT_KEY);
}

function setTenantIdInStorage(tenantId) {
    localStorage.setItem(TENANT_KEY, tenantId);
}

function removeTenantIdFromStorage() {
    localStorage.removeItem(TENANT_KEY);
}

async function apiRequest(endpoint, method = 'GET', data = null, needsAuth = true) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (needsAuth) {
        const token = getAuthToken();
        if (!token) {
            console.error('Authentication required, but no token found.');
            window.location.hash = '#login'; // Redirect to login
            return null;
        }
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        body: data ? JSON.stringify(data) : null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.warn('Unauthorized or Forbidden access. Redirecting to login.');
                logoutUser();
                window.location.hash = '#login';
            }
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
            throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        alert(error.message || 'An error occurred during the API request.');
        return null;
    }
}

// --- Authentication Logic ---
async function loginUser(email, password) {
    const tenantIdentifier = getSubdomain(); // Backend will use this to find the correct tenant's user
    try {
        const response = await apiRequest('auth/login', 'POST', { email, password, tenantIdentifier }, false);
        if (response && response.token && response.tenantId) {
            setAuthToken(response.token);
            setTenantIdInStorage(response.tenantId); // Store tenant ID returned from backend
            console.log('Login successful for tenant:', response.tenantId);
            window.location.hash = '#dashboard';
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

function logoutUser() {
    removeAuthToken();
    removeTenantIdFromStorage();
    console.log('User logged out.');
    window.location.hash = '#login';
}

function checkAuthStatus() {
    return !!getAuthToken() && !!getTenantIdFromStorage();
}

// --- UI Rendering Functions ---
function renderLoginPage() {
    document.getElementById('app').innerHTML = `
        <div class="auth-container">
            <h2>Login to ${getSubdomain() === 'public' ? 'Your Account' : getSubdomain()}</h2>
            <form id="loginForm">
                <input type="email" id="email" placeholder="Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="#signup">Sign Up</a></p>
        </div>
    `;
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        if (await loginUser(email, password)) {
            // Router will handle re-rendering to dashboard
        } else {
            alert('Login failed. Please check your credentials.');
        }
    });
}

function renderSignupPage() {
    const subdomain = getSubdomain();
    const isPublicSignup = subdomain === 'public';

    document.getElementById('app').innerHTML = `
        <div class="auth-container">
            <h2>Sign Up ${isPublicSignup ? 'for a New Tenant' : `to ${subdomain}`}</h2>
            <form id="signupForm">
                ${isPublicSignup ? '<input type="text" id="tenantName" placeholder="Your Company Name" required>' : ''}
                <input type="email" id="email" placeholder="Your Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <a href="#login">Login</a></p>
        </div>
    `;
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const tenantName = isPublicSignup ? document.getElementById('tenantName').value : subdomain;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!tenantName || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        try {
            const response = await apiRequest('auth/signup', 'POST', { tenantName, email, password, subdomain: isPublicSignup ? null : subdomain }, false);
            if (response && response.message) {
                alert(response.message);
                if (response.message.includes('successful')) {
                    window.location.hash = '#login';
                }
            } else {
                alert('Sign up failed.');
            }
        } catch (error) {
            console.error('Sign up error:', error);
            alert('An error occurred during sign up.');
        }
    });
}


async function renderDashboard() {
    const tenantId = getTenantIdFromStorage();
    const subdomain = getSubdomain();
    let tenantInfo = { name: 'Loading...', plan: '...' };

    if (tenantId) {
        // Fetch tenant-specific data (e.g., tenant name, plan)
        const data = await apiRequest(`tenants/${tenantId}/info`);
        if (data) {
            tenantInfo = data;
        }
    }

    document.getElementById('app').innerHTML = `
        <div class="dashboard-container">
            <h1>Welcome to ${tenantInfo.name || 'Your Dashboard'}</h1>
            <p>Tenant Identifier: <strong>${subdomain}</strong></p>
            <p>Your Plan: <strong>${tenantInfo.plan || 'Free'}</strong></p>
            <nav>
                <ul>
                    <li><a href="#settings">Settings</a></li>
                    <li><a href="#data">My Data</a></li>
                    ${tenantInfo.isAdmin ? `<li><a href="#admin">Global Admin Dashboard</a></li>` : ''}
                    <li><a href="#billing">Billing & Subscriptions</a></li>
                    <li><button id="logoutBtn">Logout</button></li>
                </ul>
            </nav>
            <div id="dashboardContent">
                <p>This is your personalized dashboard content.</p>
                <p>Access tenant-specific features here.</p>
            </div>
        </div>
    `;
    document.getElementById('logoutBtn').addEventListener('click', logoutUser);
}

// Placeholder for other pages
function renderSettingsPage() {
    document.getElementById('app').innerHTML = `
        <div class="page-container">
            <h2>Tenant Settings for ${getTenantIdFromStorage()}</h2>
            <p>Manage your tenant's settings
