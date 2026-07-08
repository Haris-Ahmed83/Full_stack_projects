// DOM Elements
const tweetInput = document.getElementById('tweetInput');
const tweetButton = document.getElementById('tweetButton');
const charCount = document.getElementById('charCount');
const tweetsFeed = document.getElementById('tweetsFeed');
const maxChars = 280;

// --- Character Count Logic ---
tweetInput.addEventListener('input', () => {
    const currentLength = tweetInput.value.length;
    const remaining = maxChars - currentLength;
    charCount.textContent = remaining;

    if (remaining < 0) {
        charCount.style.color = 'red';
        tweetButton.disabled = true;
    } else if (remaining <= 20) {
        charCount.style.color = 'orange';
        tweetButton.disabled = false;
    } else {
        charCount.style.color = 'var(--secondary-text-color)'; // Assuming a CSS variable for default text color
        tweetButton.disabled = false;
    }

    if (currentLength === 0) {
        tweetButton.disabled = true;
    }
});

// Initially disable the tweet button if input is empty
tweetButton.disabled = true;

// --- Tweet Creation Logic ---
function createTweetElement(tweetText, userName = 'You', userHandle = '@you', timeAgo = 'Just now', avatarUrl = 'https://via.placeholder.com/48/0000FF/FFFFFF?text=Y') {
    const tweetCard = document.createElement('div');
    tweetCard.classList.add('tweet-card');

    tweetCard.innerHTML = `
        <div class="tweet-avatar">
            <img src="${avatarUrl}" alt="${userName}'s Avatar">
        </div>
        <div class="tweet-content">
            <div class="tweet-header">
                <span class="tweet-user-name">${userName}</span>
                <span class="tweet-user-handle">${userHandle}</span>
                <span class="tweet-time">${timeAgo}</span>
            </div>
            <div class="tweet-text">${tweetText}</div>
            <div class="tweet-actions">
                <button class="action-btn"><i class="far fa-comment"></i> 0</button>
                <button class="action-btn"><i class="fas fa-retweet"></i> 0</button>
                <button class="action-btn"><i class="far fa-heart"></i> 0</button>
                <button class="action-btn"><i class="far fa-share-square"></i></button>
            </div>
        </div>
    `;
    return tweetCard;
}

tweetButton.addEventListener('click', () => {
    const tweetText = tweetInput.value.trim();

    if (tweetText.length > 0 && tweetText.length <= maxChars) {
        const newTweet = createTweetElement(tweetText);
        tweetsFeed.prepend(newTweet); // Add new tweet to the top of the feed

        tweetInput.value = ''; // Clear input
        charCount.textContent = maxChars; // Reset character count
        charCount.style.color = 'var(--secondary-text-color)';
        tweetButton.disabled = true; // Disable button again
    }
});

// --- Initial Tweets (for demo purposes) ---
const initialTweets = [
    {
        user: 'Elon Musk',
        handle: '@elonmusk',
        time: '2h',
        text: 'Excited about the future of AI! What are your thoughts on the latest advancements?',
        avatar: 'https://via.placeholder.com/48/FF5733/FFFFFF?text=E'
    },
    {
        user: 'NASA',
        handle: '@NASA',
        time: '5h',
        text: 'Our latest images from the James Webb Space Telescope are breathtaking. Explore the cosmos with us!',
        avatar: 'https://via.placeholder.com/48/3366FF/FFFFFF?text=N'
    },
    {
        user: 'Jane Doe',
        handle: '@janedoe',
        time: '1d',
        text: 'Just finished coding Project #110! Feeling accomplished. #WebDev #TwitterClone',
        avatar: 'https://via.placeholder.com/48/33CC99/FFFFFF?text=J'
    }
];

function loadInitialTweets() {
    initialTweets.forEach(tweetData => {
        const tweetElement = createTweetElement(
            tweetData.text,
            tweetData.user,
            tweetData.handle,
            tweetData.time,
            tweetData.avatar
        );
        tweetsFeed.append(tweetElement);
    });
}

// Load tweets when the script runs
document.addEventListener('DOMContentLoaded', loadInitialTweets);

// --- Sidebar & Trends (Placeholder for dynamic content) ---
// In a full application, you might fetch user data or trending topics dynamically.
// For this UI clone, the primary focus of JavaScript is the tweet creation and feed interaction.
// The sidebar and trends list would primarily be structured in HTML/CSS.
// Example of how you might dynamically load trends:
/*
function loadTrends() {
    const trendsContainer = document.querySelector('.trends-list'); // Assuming an element with this class exists
    const dummyTrends = [
        { topic: '#WebDevelopment', tweets: '1.2M' },
        { topic: '#AIRevolution', tweets: '800K' },
        { topic: 'JavaScript', tweets: '500K' },
        { topic: '#FrontendDev', tweets: '300K' }
    ];
    trendsContainer.innerHTML = ''; // Clear existing
    dummyTrends.forEach(trend => {
        const trendItem = document.createElement('li');
        trendItem.innerHTML = `
            <span class="trend-category">Trending in Technology</span>
            <span class="trend-topic">${trend.topic}</span>
            <span class="trend-count">${trend.tweets} Tweets</span>
        `;
        trendsContainer.appendChild(trendItem);
    });
}
document.addEventListener('DOMContentLoaded', loadTrends);
*/
