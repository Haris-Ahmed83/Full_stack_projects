const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement; // Target the <html> element for data-theme

const STORAGE_KEY = 'theme-preference';

/**
 * Retrieves the user's theme preference from localStorage.
 * @returns {string|null} The theme ('light' or 'dark') or null if
