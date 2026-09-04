const podcastFeedUrlInput = document.getElementById('podcastFeedUrl');
const subscribeButton = document.getElementById('subscribeButton');
const podcastListContainer = document.getElementById('podcastList');
const currentPodcastTitle = document.getElementById('currentPodcastTitle');
const currentPodcastDescription = document.getElementById('currentPodcastDescription');
const episodeListContainer = document.getElementById('episodeList');
const audioPlayer = document.getElementById('audioPlayer');
const playPauseButton = document.getElementById('playPauseButton');
const seekSlider = document.getElementById('seekSlider');
const volumeSlider = document.getElementById('volumeSlider');
const speedSelect = document.getElementById('speedSelect');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const nextButton = document.getElementById('nextButton');
const prevButton = document.getElementById('prevButton');

let subscribedPodcasts = []; // Array of { id, url, title, description, imageUrl, episodes }
let currentPodcast = null;   // The currently selected podcast object
let currentEpisodeIndex = -1; // Index of the currently playing episode within currentPodcast.episodes

const LOCAL_STORAGE_KEY = 'podcastPlayerSubscriptions';
const CORS_PROXY = 'https://api.allorigins.win/get?url='; // Public CORS proxy for demonstration

// --- Utility Functions ---
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

// --- Subscription Management ---
function loadSubscriptions() {
    const storedSubscriptions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSubscriptions) {
        subscribedPodcasts = JSON.parse(storedSubscriptions);
        renderPodcastList();
        if (subscribedPodcasts.length > 0) {
            selectPodcast(subscribedPodcasts[0]);
        }
    }
}

function saveSubscriptions() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(subscribedPodcasts));
}

async function addPodcast(feedUrl) {
    if (!feedUrl) {
        alert('Please enter an RSS feed URL.');
        return;
    }

    if (subscribedPodcasts.some(p => p.url === feedUrl)) {
        alert('You are already subscribed to this podcast.');
        return;
    }

    try {
        // Basic URL validation
        new URL(feedUrl);
    } catch (e) {
        alert('Invalid URL format
