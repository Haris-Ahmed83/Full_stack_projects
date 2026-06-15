document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const userCardsContainer = document.getElementById('userCardsContainer');
    const statusMessage = document.getElementById('statusMessage');

    // State variables (manual equivalent of useState)
    // These variables hold the current state of the application.
    let searchTerm = '';
    let users = [];
    let isLoading = false;
    let error = null;

    // GitHub API base URL for user search
    const GITHUB_API_URL = 'https://api.github.com/search/users';

    // Function to update the UI based on the current state variables.
    // This acts as a 'render' function, similar to how frameworks update the DOM.
    function renderUI() {
        // Clear previous content and reset status message classes
        userCardsContainer.innerHTML = '';
        statusMessage.innerHTML = '';
        statusMessage.className = 'status-message'; // Reset classes for new state

        if (isLoading) {
            statusMessage.textContent = 'Loading users...';
            statusMessage.classList.add('loading');
            return; // Exit early to only show loading state
        }

        if (error) {
            statusMessage.textContent = `Error: ${error}`;
            statusMessage.classList.add('error');
            return; // Exit early to only show error state
        }

        if (users.length === 0 && searchTerm) {
            // If a search was performed but no users were found
            statusMessage.textContent = `No users found for "${searchTerm}". Please try a different name.`;
            statusMessage.classList.add('info');
            return;
        }
        
        // If there are users to display, create and append their cards
        if (users.length > 0) {
            users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';

                userCard.innerHTML = `
                    <img src="${user.avatar_url}" alt="${user.login}'s avatar">
                    <h3>${user.login}</h3>
                    <a href="${user.html_url}" target="_blank" rel="noopener noreferrer">View Profile</a>
                `;
                userCardsContainer.appendChild(userCard);
            });
        }
    }

    // Function to fetch users from GitHub API asynchronously
    async function fetchUsers(query) {
        // Do not search for empty queries
        if (!query) {
            users = []; // Clear current users
            error = null;
            renderUI(); // Update UI to show empty state
            return;
        }

        // Set loading state and clear previous errors/users
        isLoading = true;
        error = null;
        renderUI(); // Show loading message

        try {
            const response = await fetch(`${GITHUB_API_URL}?q=${query}`);
            
            // Handle HTTP errors (e.g., 404, 500, or rate limiting)
            if (!response.ok) {
                // Specific check for GitHub API rate limit exceeded (status 403, 'X-RateLimit-Remaining' header)
                if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
                    throw new Error('API rate limit exceeded. Please try again later.');
                }
                const errorData = await response.json(); // Attempt to parse error message from response body
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            users = data.items; // GitHub API returns search results in the 'items' array

            // If no users found, the 'no users found' info message will be handled by renderUI() logic.
            // No need to set 'error' here.

        } catch (err) {
            error = err.message; // Store the error message
            users = []; // Clear users on error to prevent displaying stale data
        } finally {
            isLoading = false; // Always clear loading state
            renderUI(); // Update UI with fetched results or error message
        }
    }

    // Event listener for the search button click
    searchButton.addEventListener('click', () => {
        searchTerm = searchInput.value.trim(); // Get current input value and remove leading/trailing whitespace
        fetchUsers(searchTerm);
    });

    // Event listener for the Enter key press on the input field
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchTerm = searchInput.value.trim();
            fetchUsers(searchTerm);
        }
    });

    // Initial render when the page loads to display the default empty state or instructions
    // This ensures the UI is correctly initialized with the default state variables.
    renderUI();
});
