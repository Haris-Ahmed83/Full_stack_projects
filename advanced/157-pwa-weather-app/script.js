// IMPORTANT: For full PWA functionality (caching, offline support, installability),
// you MUST create two additional files in the root directory:
// 1. `sw.js`: Contains the Service Worker logic (provided below in comments).
// 2. `manifest.json`: Contains app metadata (example provided in index.html comments).

// --- Service Worker Registration (for PWA features) ---
// This part registers the service worker file `sw.js`.
// The actual content of `sw.js` is provided below as a multi-line comment.
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker Registered!', reg))
            .catch(err => console.error('Service Worker registration failed:', err));
    });
}

/*
// --- Content for `sw.js` (CREATE THIS FILE IN YOUR ROOT DIRECTORY) ---
const CACHE_NAME = 'weather-app-cache-v1';
const API_CACHE_NAME = 'weather-api-cache-v1';
const OFFLINE_URL = '/index.html'; // Fallback for navigation requests

// Files to cache on install (app shell assets)
const FILES_TO_CACHE = [
    OFFLINE_URL,
    '/style.css',
    '/script.js',
    // Add other assets like manifest.json and icons if you have them
    // '/manifest.json',
    // '/icons/icon-192x192.png',
    // '/icons/icon-512x512.png'
];

// 'install' event: Caches specified app shell assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching all app shell content');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => self.skipWaiting()) // Force the waiting service worker to become the active service worker
    );
});

// 'activate' event: Cleans up old caches to save space and avoid conflicts
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return null;
                })
            );
        }).then(() => self.clients.claim()) // Take control of un-controlled clients immediately
    );
});

// 'fetch' event: Intercepts network requests and applies caching strategies
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);

    // Check if the request is for the OpenWeatherMap API
    const isApiRequest = requestUrl.hostname === 'api.openweathermap.org' &&
                         requestUrl.pathname.startsWith('/data/2.5/weather');

    if (isApiRequest) {
        // Strategy for API requests: Cache-then-network (serve cached if available, update cache from network)
        event.respondWith(
            caches.open(API_CACHE_NAME).then(async (cache) => {
                const cachedResponse = await cache.match(event.request); // Try to get from cache first
                
                // Attempt to fetch from network to get fresh data and update cache
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    // Only cache successful responses (status 200) to avoid caching errors
                    if (networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone()); // Cache the new response
                    }
                    return networkResponse;
                }).catch(error => {
                    console.error('[Service Worker] API network fetch failed:', error);
                    // If network fails and there's no cached response, indicate offline
                    if (!cachedResponse) {
                        return new Response(JSON.stringify({ message: 'Offline. Could not fetch new weather data.' }), {
                            headers: { 'Content-Type': 'application/json' },
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    }
                    // If network fails but a cached response exists, we'll return the cached one below
                });

                return cachedResponse || fetchPromise; // Return cached data immediately if available, otherwise wait for network fetch
            })
        );
    } else {
        // Strategy for other assets (app shell): Cache-first, falling back to network, then offline page
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request).catch(() => {
                    // If both cache and network fail for navigation requests, serve the offline page
                    if (event.request.mode === 'navigate') {
                        return caches.match(OFFLINE_URL);
                    }
                });
            })
        );
    }
});
*/

// --- Main Weather App Logic ---
// Replace 'YOUR_OPENWEATHER_API_KEY' with your actual API key from OpenWeatherMap.
// Get one here: https://openweathermap.org/api
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; 
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const DEFAULT_CITY = 'London';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const weatherDisplay = document.getElementById('weather-display');

/**
 * Fetches weather data for a given city from OpenWeatherMap API.
 * Displays loading/error messages in the UI.
 * @param {string} city - The name of the city.
 * @returns {Promise<object|null>} Weather data object or null if an error occurs.
 */
async function fetchWeatherData(city) {
    // Validate API key presence
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_OPENWEATHER_API_KEY') {
        displayError('Please replace YOUR_OPENWEATHER_API_KEY in script.js with a valid API key from OpenWeatherMap.');
        return null;
    }

    const url = `${OPENWEATHER_BASE_URL}?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
        weatherDisplay.innerHTML = '<p class="loading-message">Fetching weather data...</p>'; // Show loading state
        const response = await fetch(url);

        if (!response.ok) {
            // Attempt to parse API-specific error messages
            const errorData = await response.json();
            throw new Error(errorData.message || `City not found or API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayError(`Failed to fetch weather data: ${error.message}. Please try again.`);
        return null;
    }
}

/**
 * Updates the UI with the fetched weather data.
 * @param {object} data - Weather data object from OpenWeatherMap API.
 */
function updateUI(data) {
    if (!data) {
        weatherDisplay.innerHTML = '<p class="error-message">No weather data available.</p>';
        return;
    }

    // Extract relevant data from the API response
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`; // Construct icon URL

    // Update the weather display element's inner HTML
    weatherDisplay.innerHTML = `
        <h2>${cityName}</h2>
        <img src="${iconUrl}" alt="${description}" class="weather-icon">
        <p class="temperature">${temperature}°C</p>
        <p class="description">${description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
    `;
}

/**
 * Displays an error message in the weather display area.
 * @param {string} message - The error message to display.
 */
function displayError(message) {
    weatherDisplay.innerHTML = `<p class="error-message">${message}</p>`;
}

/**
 * Handles the search action when the button is clicked or Enter is pressed.
 * Fetches and displays weather for the entered city.
 */
async function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        localStorage.setItem('lastCity', city); // Save the last searched city for persistence
        const data = await fetchWeatherData(city);
        if (data) {
            updateUI(data);
        }
    } else {
        displayError('Please enter a city name.');
    }
}

// --- Event Listeners ---
searchButton.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', (event) => {
    // Trigger search when 'Enter' key is pressed in the input field
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load the last searched city from localStorage or use the default city
    const lastCity = localStorage.getItem('lastCity') || DEFAULT_CITY;
    cityInput.value = lastCity;
    handleSearch(); // Fetch and display weather for the initial/last city
});
