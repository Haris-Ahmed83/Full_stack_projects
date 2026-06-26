// IMPORTANT: Replace 'YOUR_ALPHA_VANTAGE_API_KEY' with your actual Alpha Vantage API key.
// You can get one for free at https://www.alphavantage.co/support/#api-key
const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';
const BASE_URL = 'https://www.alphavantage.co/query?';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

const stockSymbolDisplay = document.getElementById('stockSymbol');
const companyNameDisplay = document
