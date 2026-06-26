// --- Constants ---
const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/ws/';
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false';
const CHART_MAX_POINTS = 60; // Max data points to display on the chart (approx 1 minute if updates are ~1s)

// --- Global Variables
