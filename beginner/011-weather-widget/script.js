// Constants
const API_KEY = 'YOUR_API_KEY'; // Replace with your OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const weatherDisplay = document.getElementById('weather-display');
const cityNameElement = document.getElementById('city-name');
const temperatureElement = document.getElementById('temperature');
const descriptionElement = document.getElementById('description');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const errorMessageElement = document.getElementById('error-message');
const loadingIndicator = document.getElementById('loading-indicator');

// Function to display error message
function displayError(message) {
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
    weatherDisplay.style.display = 'none';
    loadingIndicator.style.display = 'none';
}

// Function to clear error message
function clearError() {
    errorMessageElement.textContent = '';
    errorMessageElement.style.display = 'none';
}

// Function to show loading state
function showLoading() {
    loadingIndicator.style.display = 'block';
    weatherDisplay.style.display = 'none';
    clearError();
}

// Function to hide loading state
function hideLoading() {
    loadingIndicator.style.display = 'none';
}

// Function to display weather data
function displayWeather(data) {
    cityName
