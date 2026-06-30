// Firebase configuration (REPLACE WITH YOUR ACTUAL CONFIGURATION)
// You can find this in your Firebase project settings:
// Project settings -> General -> Your apps -> Firebase SDK snippet -> Config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
// Ensure Firebase SDK scripts (firebase-app.js and firebase-auth.js) are loaded
// in index.html before this script runs.
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth(); // Get the Firebase Auth service instance

// --- DOM Elements --- 
// Get references to all necessary HTML elements by their IDs.
const authSection = document.getElementById('auth-section');
const protectedSection = document.getElementById('protected-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signUpBtn = document.getElementById('signup-btn');
const signInBtn = document.getElementById('signin-btn');
const logoutBtn = document.getElementById('logout-btn');
const userEmailDisplay = document.getElementById('user-email');
const userUidDisplay = document.getElementById('user-uid');
const errorMessage = document.getElementById('error-message');
const authToggleLink = document.getElementById('auth-toggle-link');
const authFormTitle = document.getElementById('auth-form-title');

// --- State Variables ---
// Controls whether the authentication form is currently in 'Sign Up' or 'Sign In' mode.
let isSigningUp = true;

// --- Functions ---

/**
 * Handles user authentication (Sign Up or Sign In) based on the current `isSigningUp` mode.
 * It reads email and password from inputs, attempts the Firebase auth operation,
 * and displays any errors.
 */
const handleAuth = async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMessage.textContent = ''; // Clear any previous error messages

    // Basic client-side validation to ensure inputs are not empty.
    if (!email || !password) {
        errorMessage.textContent = 'Email and password cannot be empty.';
        return;
    }

    try {
        if (isSigningUp) {
            // Attempt to create a new user with the provided email and password.
            await auth.createUserWithEmailAndPassword(email, password);
            console.log('User signed up successfully!');
        } else {
            // Attempt to sign in an existing user with the provided email and password.
            await auth.signInWithEmailAndPassword(email, password);
            console.log('User signed in successfully!');
        }
        // Clear input fields after a successful authentication.
        emailInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        // Catch and display any errors returned by Firebase (e.g., invalid email, weak password).
        errorMessage.textContent = error.message;
        console.error('Authentication error:', error);
    }
};

/**
 * Handles user logout.
 * Calls Firebase's signOut method and logs the outcome.
 */
const handleLogout = async () => {
    try {
        // Sign out the current user.
        await auth.signOut();
        console.log('User signed out successfully!');
    } catch (error) {
        // Display any errors that occur during the logout process.
        errorMessage.textContent = error.message;
        console.error('Logout error:', error);
    }
};

/**
 * Toggles the authentication form between 'Sign Up' and 'Sign In' modes.
 * Updates the form title, button visibility, and the instructional toggle link.
 */
const toggleAuthMode = () => {
    isSigningUp = !isSigningUp; // Flip the boolean state of the mode.

    if (isSigningUp) {
        // Configure UI elements for 'Sign Up' mode.
        authFormTitle.textContent = 'Sign Up';
        signUpBtn.style.display = 'block'; // Show the Sign Up button.
        signInBtn.style.display = 'none';  // Hide the Sign In button.
        authToggleLink.innerHTML = 'Already have an account? <a href="#">Sign In</a>';
    } else {
        // Configure UI elements for 'Sign In' mode.
        authFormTitle.textContent = 'Sign In';
        signUpBtn.style.display = 'none';  // Hide the Sign Up button.
        signInBtn.style.display = 'block'; // Show the Sign In button.
        authToggleLink.innerHTML = 'Don\'t have an account? <a href="#">Sign Up</a>';
    }
    errorMessage.textContent = ''; // Clear any errors when switching modes.
    emailInput.value = ''; // Clear inputs to prevent credentials from carrying over.
    passwordInput.value = '';
};

// --- Event Listeners ---
// Attach event listeners to buttons and the auth mode toggle link.
signUpBtn.addEventListener('click', handleAuth);
signInBtn.addEventListener('click', handleAuth);
logoutBtn.addEventListener('click', handleLogout);

authToggleLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent the default link behavior (page reload).
    toggleAuthMode(); // Call the function to switch the auth form mode.
});

// --- Firebase Auth State Listener ---
// This listener is crucial. It fires whenever the user's sign-in state changes
// (e.g., after successful sign-in, sign-out, or page refresh if user was logged in).
auth.onAuthStateChanged((user) => {
    if (user) {
        // If a user object exists, the user is signed in.
        protectedSection.style.display = 'block'; // Show the protected content.
        authSection.style.display = 'none';      // Hide the authentication form.
        userEmailDisplay.textContent = user.email; // Display user's email.
        userUidDisplay.textContent = user.uid;     // Display user's UID.
        errorMessage.textContent = '';             // Clear any previous errors.
        console.log('User logged in:', user.email, user.uid);
    } else {
        // If user is null, the user is signed out.
        protectedSection.style.display = 'none'; // Hide the protected content.
        authSection.style.display = 'block';     // Show the authentication form.
        errorMessage.textContent = '';           // Clear any previous errors.
        console.log('User logged out.');
    }
});

// --- Initial Setup ---
// Call toggleAuthMode once to set the initial UI state (default to Sign Up mode).
toggleAuthMode();
