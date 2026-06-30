// Import Firebase modules using ES6 imports directly from CDN for no-build setup
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

// --- Firebase Configuration ---
// IMPORTANT: Replace with your actual Firebase project configuration.
// You can find this in your Firebase project settings -> Project settings -> General -> Your apps -> Web app -> Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // e.g., "AIzaSyC0R_YOUR_API_KEY_EXAMPLE"
    authDomain: "YOUR_AUTH_DOMAIN", // e.g., "your-project-id.firebaseapp.com"
    projectId: "YOUR_PROJECT_ID", // e.g., "your-project-id"
    storageBucket: "YOUR_STORAGE_BUCKET", // e.g., "your-project-id.appspot.com"
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // e.g., "1234567890"
    appId: "YOUR_APP_ID" // e.g., "1:1234567890:web:abcdef1234567890"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
// Get the Auth service instance
const auth = getAuth(app);
// Create a Google Auth provider instance
const provider = new GoogleAuthProvider();

// --- DOM Elements ---
const googleLoginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const authSection = document.getElementById('auth-section');
const profileSection = document.getElementById('profile-section');
const profilePhoto = document.getElementById('profile-photo');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const errorMessage = document.getElementById('error-message');

// --- Helper Functions ---

/**
 * Displays an error message to the user in the UI.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('visible');
    // Automatically hide the error message after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('visible');
        errorMessage.textContent = '';
    }, 5000);
}

// --- Authentication Handlers ---

/**
 * Handles Google Sign-in process using a popup window.
 */
async function handleGoogleLogin() {
    try {
        // Attempt to sign in with Google via popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User logged in:", user.displayName, user.email);
        // The `onAuthStateChanged` listener will handle UI updates upon successful login.
    } catch (error) {
        // Handle various authentication errors
        const errorCode = error.code;
        const errorMessageText = error.message;
        console.error("Google login error:", errorCode, errorMessageText, error);

        let userFriendlyMessage = "An unknown error occurred during login.";
        switch (errorCode) {
            case 'auth/popup-closed-by-user':
                userFriendlyMessage = "Login popup was closed. Please try again.";
                break;
            case 'auth/cancelled-popup-request':
                userFriendlyMessage = "Login popup was cancelled. Please try again.";
                break;
            case 'auth/operation-not-allowed':
                userFriendlyMessage = "Google sign-in is not enabled for this project. Please enable it in Firebase Console.";
                break;
            case 'auth/network-request-failed':
                userFriendlyMessage = "Network error. Please check your internet connection.";
                break;
            case 'auth/unauthorized-domain':
                userFriendlyMessage = "This domain is not authorized for Google sign-in. Add it to Firebase console.";
                break;
            default:
                userFriendlyMessage = `Login failed: ${errorMessageText}`;
                break;
        }
        displayError(userFriendlyMessage);
    }
}

/**
 * Handles user logout.
 */
async function handleLogout() {
    try {
        await signOut(auth);
        console.log("User logged out successfully.");
        // The `onAuthStateChanged` listener will handle UI updates upon successful logout.
    } catch (error) {
        console.error("Logout error:", error);
        displayError("Failed to log out. Please try again.");
    }
}

// --- UI Update Function ---

/**
 * Updates the UI based on the current user's authentication state.
 * @param {object|null} user - The current Firebase user object, or null if logged out.
 */
function updateUI(user) {
    if (user) {
        // User is signed in: show profile section, hide auth section
        authSection.classList.add('hidden');
        profileSection.classList.remove('hidden');

        // Populate profile details
        profilePhoto.src = user.photoURL || 'https://via.placeholder.com/100?text=No+Photo'; // Fallback placeholder image
        profilePhoto.alt = user.displayName ? `${user.displayName}'s profile photo` : 'User profile photo';
        profileName.textContent = user.displayName || 'No Name Provided';
        profileEmail.textContent = user.email || 'No Email Provided';

        errorMessage.classList.remove('visible'); // Clear any lingering error messages
    } else {
        // User is signed out: show auth section, hide profile section
        authSection.classList.remove('hidden');
        profileSection.classList.add('hidden');

        // Clear profile details
        profilePhoto.src = '';
        profilePhoto.alt = '';
        profileName.textContent = '';
        profileEmail.textContent = '';
    }
}

// --- Event Listeners ---
googleLoginBtn.addEventListener('click', handleGoogleLogin);
logoutBtn.addEventListener('click', handleLogout);

// --- Firebase Auth State Listener ---
// This listener observes changes in the user's sign-in state.
// It fires immediately after the listener is attached and then again whenever the user's sign-in state changes
// (e.g., after login, logout, or session restoration).
onAuthStateChanged(auth, (user) => {
    updateUI(user);
});
