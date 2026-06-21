// DOM Elements
const formSteps = document.querySelectorAll('.form-step'); // Each step container div
const progressBar = document.querySelector('.progress-bar'); // The progress bar inner element (e.g., a div inside a progress container)
const progressText = document.querySelector('.progress-text'); // Optional: for text like "Step 1 of 3"
const multiStepForm = document.getElementById('multi-step-form'); // The main form element containing all steps

// State Management
let currentStep = 0;
const totalSteps = formSteps.length;
const formData = {}; // Object to store all collected form data

// --- Helper Functions ---

/**
 * Displays the specified step and hides all others.
 * Also updates the progress indicator.
 * @param {number} stepIndex The index of the step to display (0-based).
 */
