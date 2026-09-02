// script.js

// --- Configuration ---
const API_BASE_URL = 'https://api.example.com/stock'; // Placeholder for a real stock API (e.g., Alpha Vantage, Finnhub)
const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const REFRESH_INTERVAL_MS = 60000; // Refresh data every 60 seconds (1 minute)

// --- Data Storage (using localStorage for client-side persistence) ---
let portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
let alerts = JSON.parse(localStorage.getItem('alerts')) || [];
let historicalPortfolioValues = JSON.parse(localStorage.getItem('historicalPortfolioValues')) || [];

// --- DOM Elements ---
const portfolioSummaryEl = document.getElementById('portfolio-summary');
const holdingsTableBodyEl = document.getElementById('holdings-table-body');
const allocationChartCanvas = document.getElementById('
