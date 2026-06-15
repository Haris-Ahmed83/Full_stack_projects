// API Key and Base URL (replace with your actual API key from OpenWeatherMap)
// IMPORTANT: For a real-world application, storing API keys directly in client-side code
// is not secure. It's done here for simplicity in a self-contained project.
// A proxy server or environment variables would be better practice.
const API_KEY = 'YOUR_API_KEY_HERE'; // !!! Replace with your OpenWeatherMap API key !!!
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

// Get DOM elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const loadingSpinner = document.getElementById('loading-spinner');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');

const cityNameElem = document.getElementById('city-name');
const weatherIconElem = document.getElementById('weather-icon');
const temperatureElem = document.getElementById('temperature');
const descriptionElem = document.getElementById('description');
const humidityElem = document.getElementById('humidity');
const windSpeedElem = document.getElementById('wind-speed');
const pressureElem = document.getElementById('pressure');
const feelsLikeElem = document.getElementById('feels-like');

// Helper function to show an element by removing 'hidden' class
const showElement = (element) => element.classList.remove('hidden');
// Helper function to hide an element by adding 'hidden' class
const hideElement = (element) => element.classList.add('hidden');

// Function to clear previous weather data and error messages from the UI
const clearDisplay = () => {
    hideElement(weatherDisplay);
    hideElement(errorMessage);
    // Reset content of all display elements
    cityNameElem.textContent = '';
    weatherIconElem.src = '';
    weatherIconElem.alt = '';
    temperatureElem.textContent = '';
    descriptionElem.textContent = '';
    humidityElem.textContent = '';
    windSpeedElem.textContent = '';
    pressureElem.textContent = '';
    feelsLikeElem.textContent = '';
};

// Function to display an error message on the UI
const displayError = (message) => {
    clearDisplay(); // Clear any previous weather data before showing error
    errorMessage.textContent = message;
    showElement(errorMessage);
};

// Main function to fetch weather data from the OpenWeatherMap API
const fetchWeatherData = async (city) => {
    clearDisplay(); // Clear previous content before starting a new fetch
    showElement(loadingSpinner); // Show loading spinner while data is being fetched

    // Check if API key is properly configured
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('API Key is missing or default. Please replace YOUR_API_KEY_HERE with your OpenWeatherMap API key.');
        displayError('Weather data cannot be fetched. Please configure your API key.');
        hideElement(loadingSpinner);
        return;
    }

    try {
        // Construct the API URL with city, API key, and metric units for Celsius
        const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url); // Perform the API request

        // Check if the HTTP response was successful
        if (!response.ok) {
            // Handle specific HTTP error codes for better user feedback
            if (response.status === 404) {
                throw new Error(`City "${city}" not found. Please try again.`);
            } else if (response.status === 401) {
                throw new Error('Unauthorized: Invalid API key. Please check your API key.');
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        }

        const data = await response.json(); // Parse the JSON response body
        displayWeatherData(data); // Update the UI with the fetched data
    } catch (error) {
        // Catch any network errors or errors thrown during response processing
        console.error('Failed to fetch weather data:', error);
        displayError(`Failed to get weather data: ${error.message}`);
    } finally {
        hideElement(loadingSpinner); // Always hide the loading spinner once the operation completes (success or failure)
    }
};

// Function to update the DOM with the fetched weather data
const displayWeatherData = (data) => {
    // Update text content and image source with data from the API response
    cityNameElem.textContent = data.name;
    weatherIconElem.src = `${ICON_BASE_URL}${data.weather[0].icon}@2x.png`; // Construct icon URL
    weatherIconElem.alt = data.weather[0].description; // Set alt text for accessibility
    temperatureElem.textContent = Math.round(data.main.temp); // Round temperature to nearest integer
    descriptionElem.textContent = data.weather[0].description;
    humidityElem.textContent = `${data.main.humidity}%`;
    windSpeedElem.textContent = `${data.wind.speed} m/s`; // OpenWeatherMap provides wind speed in m/s
    pressureElem.textContent = `${data.main.pressure} hPa`;
    feelsLikeElem.textContent = `${Math.round(data.main.feels_like)}°C`;

    showElement(weatherDisplay); // Make the weather display visible
};

// Event listener for the search button click
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim(); // Get city name from input and remove leading/trailing whitespace
    if (city) { // Only proceed if the city input is not empty
        fetchWeatherData(city);
    } else {
        displayError('Please enter a city name.');
    }
});

// Event listener for 'Enter' key press in the city input field
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click(); // Programmatically click the search button when Enter is pressed
    }
});

// Initial load: Fetch weather for a default city when the page first loads
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherData('London'); // Default city to display on startup
});
