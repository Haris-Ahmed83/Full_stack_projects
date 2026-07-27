// --- Global State ---
let newsSources = [];
let allArticles = [];
let bookmarkedArticles = [];
let currentFilter = { category: 'All', searchTerm: '', view: 'all' }; // 'all' or 'bookmarks'

// Public RSS-to-JSON proxy service. Note: This service is external and its availability/reliability is not guaranteed.
// For production use, consider implementing your own server-side proxy to avoid CORS issues and have more control.
const RSS_PROXY_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';

// --- DOM Elements ---
const newsFeedContainer = document.getElementById('news-feed');
const sourceListContainer = document.getElementById('source-list');
const categoryFilterContainer = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');
const addSourceForm = document.getElementById('add-source-form');
const addSourceUrl
