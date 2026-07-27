// --- API Keys (REPLACE WITH YOUR ACTUAL KEYS) ---
// You can get these keys from the respective API providers:
// OpenWeatherMap: https://openweathermap.org/api
// OpenCageData: https://opencagedata.com/api
// Mapbox: https://docs.mapbox.com/help/getting-started/access-tokens/
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; 
const OPENCAGEDATA_API_KEY = 'YOUR_OPENCAGEDATA_API_KEY';
const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

// --- DOM Element References ---
const citySearchInput = document.getElementById('city-search-input');
const searchButton = document.getElementById('search-button');
const currentCityName = document.getElementById('current-city-name');
const currentDate = document.getElementById('current-date');
const currentWeatherIcon = document.getElementById('current-weather-icon');
const currentTemp = document.getElementById('current-temp');
const currentDescription = document.getElementById('current-description');
const currentHumidity = document.getElementById('current-humidity');
const currentWindSpeed = document.getElementById('current-wind-speed');
const forecastContainer = document.getElementById('forecast-container');
const errorMessage = document.getElementById('error-message');
const mapContainer = document.getElementById('map');

let map; // Variable to hold the Mapbox map instance
let currentMarker; // Variable to hold the Mapbox marker instance

// --- Helper Functions ---

/**
 * Formats a Unix timestamp into a readable date string.
 * @param {number} timestamp - The Unix timestamp.
 * @returns {string} Formatted date string (e.g., "Mon, Jul 29").
 */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Generates the URL for a weather icon from OpenWeatherMap.
 * @param {string} iconCode - The icon code provided by OpenWeatherMap API.
 * @returns {string} Full URL to the weather icon.
 */
function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Displays an error message to the user.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block'; // Show the error message element
}

/**
 * Hides the error message.
 */
function hideErrorMessage() {
    errorMessage.style.display = 'none'; // Hide the error message element
}

// --- API Interaction Functions ---

/**
 * Fetches coordinates (latitude, longitude) for a given city name using OpenCageData API.
 * @param {string} city - The name of the city.
 * @returns {Promise<object | null>} A promise that resolves to an object { lat, lon, city_name } or null on error.
 */
async function fetchCoordinates(city) {
    hideErrorMessage();
    if (!OPENCAGEDATA_API_KEY || OPENCAGEDATA_API_KEY === 'YOUR_OPENCAGEDATA_API_KEY') {
        displayErrorMessage('OpenCageData API key is not configured. Please replace the placeholder.');
        return null;
    }
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${OPENCAGEDATA_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry;
            const formattedCityName = data.results[0].formatted.split(',')[0]; // Get primary city name
            return { lat, lon: lng, city_name: formattedCityName };
        } else {
            displayErrorMessage(`Could not find coordinates for "${city}". Please try another city.`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
        displayErrorMessage(`Failed to get coordinates for "${city}". Check console for details.`);
        return null;
    }
}

/**
 * Fetches current weather and 5-day forecast data using OpenWeatherMap One Call API.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @returns {Promise<object | null>} A promise that resolves to the weather data object or null on error.
 */
async function fetchWeatherData(lat, lon) {
    hideErrorMessage();
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        displayErrorMessage('OpenWeatherMap API key is not configured. Please replace the placeholder.');
        return null;
    }
    // Exclude minutely and hourly data for a leaner response, units=metric for Celsius
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=${OPENWEATHER_API_KEY}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayErrorMessage('Failed to get weather data. Check console for details.');
        return null;
    }
}

// --- UI Update Functions ---

/**
 * Updates the current weather section of the dashboard.
 * @param {object} data - Current weather data from OpenWeatherMap API.
 * @param {string} city - The name of the city.
 */
function displayCurrentWeather(data, city) {
    if (!data) return;

    currentCityName.textContent = city;
    currentDate.textContent = formatDate(data.dt);
    currentWeatherIcon.src = getWeatherIconUrl(data.weather[0].icon);
    currentWeatherIcon.alt = data.weather[0].description;
    currentTemp.textContent = `${Math.round(data.temp)}°C`;
    currentDescription.textContent = data.weather[0].description;
    currentHumidity.textContent = `${data.humidity}%`;
    currentWindSpeed.textContent = `${data.wind_speed.toFixed(1)} m/s`;
}

/**
 * Updates the 5-day forecast section of the dashboard.
 * @param {Array<object>} dailyForecast - Array of daily forecast data from OpenWeatherMap API.
 */
function displayForecast(dailyForecast) {
    forecastContainer.innerHTML = ''; // Clear previous forecast cards
    if (!dailyForecast || dailyForecast.length === 0) {
        forecastContainer.innerHTML = '<p class="loading-text">No forecast data available.</p>';
        return;
    }

    // Take the next 5 days, excluding the current day which is usually the first element
    // OpenWeatherMap daily forecast includes the current day as index 0, so we slice from index 1 to 6 for next 5 days.
    dailyForecast.slice(1, 6).forEach(day => {
        const forecastCard = document.createElement('div');
        forecastCard.classList.add('forecast-card');

        forecastCard.innerHTML = `
            <p class="forecast-date">${formatDate(day.dt)}</p>
            <img src="${getWeatherIconUrl(day.weather[0].icon)}" alt="${day.weather[0].description}" class="weather-icon">
            <p class="forecast-temp">${Math.round(day.temp.day)}°C</p>
            <p class="forecast-description">${day.weather[0].description}</p>
            <p class="forecast-humidity">Hum: ${day.humidity}%</p>
            <p class="forecast-wind">Wind: ${day.wind_speed.toFixed(1)} m/s</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

/**
 * Initializes or updates the Mapbox map with a given location.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} cityName - Name of the city for marker popup.
 */
function updateMap(lat, lon, cityName) {
    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN') {
        displayErrorMessage('Mapbox API token is not configured. Map will not display.');
        mapContainer.innerHTML = '<p style="text-align: center; padding: 20px;">Mapbox token missing. Cannot display map.</p>';
        return;
    }
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN; // Set Mapbox access token

    if (!map) {
        // Initialize map if it doesn't exist
        map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: [lon, lat], // starting position [lng, lat]
            zoom: 10 // starting zoom
        });
        map.addControl(new mapboxgl.NavigationControl(), 'top-left'); // Add navigation controls
    } else {
        // Otherwise, just fly to the new location
        map.flyTo({ center: [lon, lat], zoom: 10 });
    }

    // Remove existing marker if any
    if (currentMarker) {
        currentMarker.remove();
    }

    // Add a new marker
    currentMarker = new mapboxgl.Marker()
        .setLngLat([lon, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>${cityName}</h3><p>Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}</p>`)) // Add popup
        .addTo(map);
}

// --- Main Logic Flow ---

/**
 * Handles the weather data fetching and UI updating process.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 * @param {string} cityName - Name of the city.
 */
async function getWeatherAndDisplay(lat, lon, cityName) {
    forecastContainer.innerHTML = '<p class="loading-text">Loading forecast...</p>'; // Show loading state
    const weatherData = await fetchWeatherData(lat, lon);

    if (weatherData) {
        displayCurrentWeather(weatherData.current, cityName);
        displayForecast(weatherData.daily);
        updateMap(lat, lon, cityName);
    } else {
        // Reset UI or show a more specific error if weather data fails
        currentCityName.textContent = 'N/A';
        currentDate.textContent = '';
        currentWeatherIcon.src = '';
        currentWeatherIcon.alt = 'No weather data';
        currentTemp.textContent = '--°C';
        currentDescription.textContent = 'Failed to load weather data.';
        currentHumidity.textContent = '--%';
        currentWindSpeed.textContent = '-- m/s';
        forecastContainer.innerHTML = '<p class="loading-text">Failed to load forecast.</p>';
    }
}

/**
 * Initiates the search for weather data based on user input.
 */
async function handleSearch() {
    const city = citySearchInput.value.trim();
    if (!city) {
        displayErrorMessage('Please enter a city name.');
        return;
    }
    citySearchInput.value = ''; // Clear input field

    const coords = await fetchCoordinates(city);
    if (coords) {
        getWeatherAndDisplay(coords.lat, coords.lon, coords.city_name);
    }
}

/**
 * Initializes the dashboard on page load.
 * Tries to get user's current location, otherwise defaults to a city.
 */
function init() {
    // Default location if geolocation fails or is denied
    const defaultCity = 'London';

    // Try to get current position using Geolocation API
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Reverse geocode to get city name for display
                const coords = await fetchCoordinates(`${latitude},${longitude}`);
                if (coords) {
                    getWeatherAndDisplay(coords.lat, coords.lon, coords.city_name);
                } else {
                    // Fallback to default city if reverse geocoding fails
                    console.warn('Could not reverse geocode current location, falling back to default city.');
                    const defaultCoords = await fetchCoordinates(defaultCity);
                    if (defaultCoords) {
                        getWeatherAndDisplay(defaultCoords.lat, defaultCoords.lon, defaultCoords.city_name);
                    }
                }
            },
            async (error) => {
                console.warn('Geolocation denied or failed:', error);
                displayErrorMessage(`Geolocation failed: ${error.message || 'Permission denied'}. Loading default city.`);
                // Fallback to default city if geolocation fails
                const defaultCoords = await fetchCoordinates(defaultCity);
                if (defaultCoords) {
                    getWeatherAndDisplay(defaultCoords.lat, defaultCoords.lon, defaultCoords.city_name);
                }
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Geolocation options
        );
    } else {
        console.warn('Geolocation is not supported by this browser.');
        displayErrorMessage('Geolocation is not supported. Loading default city.');
        // Fallback to default city if geolocation is not supported
        (async () => {
            const defaultCoords = await fetchCoordinates(defaultCity);
            if (defaultCoords) {
                getWeatherAndDisplay(defaultCoords.lat, defaultCoords.lon, defaultCoords.city_name);
            }
        })();
    }
}

// --- Event Listeners ---
searchButton.addEventListener('click', handleSearch);
citySearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Initialize the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
