(function() {
    const THEME_KEY = 'theme';
    const THEME_LIGHT = 'light';
    const THEME_DARK = 'dark';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    function toggleTheme() {
        const currentTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? THEME_DARK : THEME_LIGHT);
        const newTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
        applyTheme(newTheme);
    }

    // Initialize theme on page load
    const savedTheme = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme(THEME_DARK);
    } else {
        applyTheme(THEME_LIGHT);
    }

    // Attach event listener to a theme toggle button once the DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        const themeToggleButton = document.getElementById('theme-toggle');
        if (themeToggleButton) {
            themeToggleButton.addEventListener('click', toggleTheme);
        }

        // Listen for system theme changes and update if no explicit preference is set
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) { // Only update if user hasn't set a preference
                applyTheme(e.matches ? THEME_DARK : THEME_LIGHT);
            }
        });
    });
})();
