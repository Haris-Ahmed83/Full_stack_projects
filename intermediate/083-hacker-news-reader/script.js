document.addEventListener('DOMContentLoaded', () => {
    // --- Constants and Configuration --- //
    const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';
    const STORIES_PER_PAGE = 20;
    const CATEGORY_IDS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

    // --- DOM Elements --- //
    const storyList = document.querySelector('.story-list');
    const categoryButtons = document.querySelectorAll('.category-nav button');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfoSpan = document.getElementById('pageInfo');
    const loadingIndicator = document.querySelector('.loading-indicator');
    const errorMessage = document.querySelector('.error-message');

    // --- State Variables --- //
    let currentCategory = 'topstories';
    let currentPage = 1;
    let storyIds = []; // Stores IDs for the currently selected category

    // --- Caching Mechanisms (Mimicking 'Custom Hooks' for data management) --- //
    // Cache for story IDs per category, with a timestamp for invalidation.
    const categoryStoryIdsCache = {}; // { category: { ids: [...], timestamp: Date.now() } }
    // Cache for individual story details.
    const storyDetailsCache = {}; // { id: { ...storyObject } }

    /**
     * 'Custom Hook' equivalent: Fetches story IDs for a given category, utilizing a cache.
     * @param {string} category - The Hacker News category (e.g., 'topstories').
     * @returns {Promise<Array<number>>} A promise that resolves to an array of story IDs.
     */
    async function useFetchStoryIds(category) {
        const cached = categoryStoryIdsCache[category];
        // Check if cached data exists and is still valid (not expired)
        if (cached && (Date.now() - cached.timestamp < CATEGORY_IDS_CACHE_DURATION)) {
            return cached.ids; // Return cached IDs
        }

        try {
            const response = await fetch(`${API_BASE_URL}/${category}.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${category} IDs: ${response.statusText}`);
            }
            const ids = await response.json();
            // Cache the newly fetched IDs with a timestamp
            categoryStoryIdsCache[category] = { ids, timestamp: Date.now() };
            return ids;
        } catch (error) {
            console.error("Error fetching story IDs:", error);
            throw error; // Re-throw to be handled by the caller
        }
    }

    /**
     * 'Custom Hook' equivalent: Fetches details for a single story ID, utilizing a cache.
     * @param {number} id - The ID of the story.
     * @returns {Promise<Object|null>} A promise that resolves to the story object or null if not found/deleted.
     */
    async function useFetchStoryDetails(id) {
        // Check if story details are already in cache
        if (storyDetailsCache[id]) {
            return storyDetailsCache[id];
        }

        try {
            const response = await fetch(`${API_BASE_URL}/item/${id}.json`);
            if (!response.ok) {
                // Log and return null for specific story fetch errors rather than failing the whole page
                console.warn(`Failed to fetch details for story ${id}: ${response.statusText}`);
                return null;
            }
            const story = await response.json();
            // Cache the fetched story details
            storyDetailsCache[id] = story;
            return story;
        } catch (error) {
            console.error(`Error fetching story ${id} details:`, error);
            return null; // Return null on error
        }
    }

    // --- UI Utility Functions --- //

    /**
     * Toggles the visibility of the loading indicator.
     * @param {boolean} isLoading - True to show, false to hide.
     */
    function showLoading(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
        storyList.classList.toggle('hidden', isLoading); // Hide stories when loading
        paginationControls.classList.toggle('hidden', isLoading && storyIds.length === 0); // Hide pagination only if no stories yet
    }

    /**
     * Displays an error message to the user.
     * @param {string} message - The error message to display.
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.toggle('hidden', !message);
    }

    /**
     * Formats a timestamp into a human-readable string (e.g., 'X hours ago').
     * @param {number} timestamp - Unix timestamp in seconds.
     * @returns {string}
     */
    function formatTime(timestamp) {
        const now = Date.now() / 1000; // current time in seconds
        const seconds = Math.floor(now - timestamp);

        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    }

    /**
     * Renders a list of story objects into the DOM.
     * @param {Array<Object>} stories - An array of story objects.
     */
    function renderStories(stories) {
        storyList.innerHTML = ''; // Clear previous stories

        if (stories.length === 0) {
            storyList.innerHTML = '<p class="loading-indicator">No stories found for this category or page.</p>';
            return;
        }

        stories.forEach(story => {
            // Skip deleted or malformed stories
            if (!story || story.deleted || story.dead) return;

            const storyItem = document.createElement('article');
            storyItem.classList.add('story-item');

            const titleElement = document.createElement('h2');
            titleElement.classList.add('story-title');
            const titleLink = document.createElement('a');
            titleLink.href = story.url || `https://news.ycombinator.com/item?id=${story.id}`; // Link to story URL or HN comments
            titleLink.target = '_blank';
            titleLink.rel = 'noopener noreferrer';
            titleLink.textContent = story.title;
            titleElement.appendChild(titleLink);

            const metaElement = document.createElement('p');
            metaElement.classList.add('story-meta');
            metaElement.innerHTML = `
                <span>${story.score || 0} points by <a href="https://news.ycombinator.com/user?id=${story.by}" target="_blank" rel="noopener noreferrer">${story.by}</a></span>
                <span>${formatTime(story.time)}</span>
                <span><a href="https://news.ycombinator.com/item?id=${story.id}" target="_blank" rel="noopener noreferrer">${story.descendants || 0} comments</a></span>
            `;

            storyItem.appendChild(titleElement);
            storyItem.appendChild(metaElement);
            storyList.appendChild(storyItem);
        });
    }

    /**
     * Updates the pagination controls (page info, button enabled/disabled states).
     */
    function updatePaginationControls() {
        const totalPages = Math.ceil(storyIds.length / STORIES_PER_PAGE);
        pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages || 1}`;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    /**
     * Main function to fetch and render stories for a given category and page.
     * Orchestrates data fetching, UI updates, and error handling.
     * @param {string} category - The Hacker News category.
     * @param {number} page - The current page number.
     */
    async function fetchAndRenderStories(category, page = 1) {
        showLoading(true);
        showError('');
        storyList.innerHTML = ''; // Clear content before loading new stories

        currentCategory = category;
        currentPage = page;

        try {
            // Fetch story IDs for the selected category
            storyIds = await useFetchStoryIds(currentCategory);

            if (storyIds.length === 0) {
                renderStories([]); // Render empty state
                updatePaginationControls();
                return;
            }

            // Calculate the range of stories for the current page
            const startIndex = (currentPage - 1) * STORIES_PER_PAGE;
            const endIndex = Math.min(startIndex + STORIES_PER_PAGE, storyIds.length);
            const idsForPage = storyIds.slice(startIndex, endIndex);

            // Fetch details for all stories on the current page concurrently
            const storyDetailsPromises = idsForPage.map(id => useFetchStoryDetails(id));
            const stories = (await Promise.all(storyDetailsPromises)).filter(Boolean); // Filter out nulls (deleted/error stories)

            renderStories(stories);
            updatePaginationControls();

        } catch (error) {
            showError(`Failed to load stories: ${error.message}. Please try again later.`);
            renderStories([]); // Clear any partial stories
            storyIds = []; // Reset story IDs on error
            updatePaginationControls(); // Update pagination to reflect no stories
            console.error('Full error during fetchAndRenderStories:', error);
        } finally {
            showLoading(false);
        }
    }

    // --- Event Listeners --- //

    // Category navigation buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' class to the clicked button
            button.classList.add('active');
            // Fetch and render stories for the new category, starting from page 1
            fetchAndRenderStories(button.dataset.category, 1);
        });
    });

    // Pagination buttons
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            fetchAndRenderStories(currentCategory, currentPage - 1);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(storyIds.length / STORIES_PER_PAGE);
        if (currentPage < totalPages) {
            fetchAndRenderStories(currentCategory, currentPage + 1);
        }
    });

    // --- Initialization --- //
    // Initial load of 'topstories' when the page loads
    fetchAndRenderStories(currentCategory, 1);
});
