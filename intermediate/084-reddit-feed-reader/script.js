// DOM Elements
const subredditInput = document.getElementById('subreddit-input');
const fetchButton = document.getElementById('fetch-button');
const postsContainer = document.getElementById('posts-container');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');

// State
let currentSubreddit = subredditInput.value;

// --- Helper Functions ---

/**
 * Shows the loading indicator and clears previous content/errors.
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    postsContainer.innerHTML = ''; // Clear previous posts
}

/**
 * Hides the loading indicator.
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

/**
 * Hides the error message.
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Creates a DOM element (card) for a given Reddit post.
 * @param {object} post - The post object from the Reddit API.
 * @returns {HTMLElement} The created post card element.
 */
function createPostCard(post) {
    const data = post.data;

    const card = document.createElement('div');
    card.classList.add('post-card');

    const title = document.createElement('h2');
    const titleLink = document.createElement('a');
    titleLink.href = `https://www.reddit.com${data.permalink}`; // Link to Reddit post page
    titleLink.target = '_blank';
    titleLink.rel = 'noopener noreferrer';
    titleLink.textContent = data.title;
    title.appendChild(titleLink);
    card.appendChild(title);

    const author = document.createElement('p');
    author.classList.add('post-author');
    author.textContent = `Posted by u/${data.author}`;
    card.appendChild(author);

    // Add thumbnail if available and not a generic placeholder
    if (data.thumbnail && data.thumbnail !== 'self' && data.thumbnail !== 'default' && data.thumbnail !== 'nsfw' && data.thumbnail.startsWith('http')) {
        const thumbnail = document.createElement('img');
        thumbnail.src = data.thumbnail;
        thumbnail.alt = 'Post thumbnail';
        thumbnail.classList.add('post-thumbnail');
        card.appendChild(thumbnail);
    }

    const externalLinkContainer = document.createElement('p');
    const externalLink = document.createElement('a');
    externalLink.href = data.url; // Link to external content or Reddit post if self-post
    externalLink.target = '_blank';
    externalLink.rel = 'noopener noreferrer';
    externalLink.textContent = `View original content`;
    externalLinkContainer.appendChild(externalLink);
    card.appendChild(externalLinkContainer);

    return card;
}

// --- Main Fetch Function ---

/**
 * Fetches posts from the specified subreddit and displays them.
 * Handles loading states and errors.
 * @param {string} subreddit - The name of the subreddit to fetch posts from.
 */
async function fetchRedditPosts(subreddit) {
    showLoading();
    hideError();

    try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`); // Fetch top 25 hot posts

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Subreddit 'r/${subreddit}' not found. Please check the name.`);
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data.children || data.data.children.length === 0) {
            postsContainer.innerHTML = '<p>No posts found for this subreddit, or the subreddit is empty.</p>';
            return;
        }

        data.data.children.forEach(post => {
            const postCard = createPostCard(post);
            postsContainer.appendChild(postCard);
        });

    } catch (error) {
        console.error('Failed to fetch posts:', error);
        showError(`Failed to load posts: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// --- Event Listeners ---

// Initial load: Fetch posts for the default subreddit when the DOM is ready.
document.addEventListener('DOMContentLoaded', () => {
    fetchRedditPosts(currentSubreddit);
});

// Fetch posts when the "Go" button is clicked.
fetchButton.addEventListener('click', () => {
    const newSubreddit = subredditInput.value.trim();
    if (newSubreddit && newSubreddit.toLowerCase() !== currentSubreddit.toLowerCase()) {
        currentSubreddit = newSubreddit;
        fetchRedditPosts(currentSubreddit);
    } else if (!newSubreddit) {
        showError("Subreddit name cannot be empty.");
    }
});

// Allow pressing Enter key in the input field to trigger fetching.
subredditInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        fetchButton.click();
    }
});
