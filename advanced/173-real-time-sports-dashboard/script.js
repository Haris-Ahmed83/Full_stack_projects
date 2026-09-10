// Configuration
const WS_URL = 'ws://localhost:8080'; // Placeholder WebSocket server URL
const API_BASE_URL = 'https://api.sportsdata.com/v1'; // Placeholder REST API URL
const API_KEY = 'YOUR_API_KEY'; // Placeholder API Key

// DOM Elements
const matchesContainer = document.getElementById('matches-container');
const sportFilter = document.getElementById('sport-filter');
const leagueFilter = document.getElementById('league-filter');
const statusFilter = document.getElementById('status-filter');
const searchInput = document.getElementById('search-input');
const notificationContainer = document.getElementById('notification-container');

// Application State
let allMatches = [];
let sports = new Set();
let leagues = new Set();
let ws;

// --- WebSocket Connection ---
function initWebSocket() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
        showNotification('Live updates connected!', 'success');
        // Optionally send a message to subscribe to specific updates
        // ws.send(JSON.stringify({ type: 'subscribe', channels: ['live_scores'] }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
    };

    ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        showNotification('WebSocket error. Some features might be unavailable.', 'error');
    };

    ws.onclose = (event) => {
        console.log('Disconnected from WebSocket server:', event.code, event.reason);
        showNotification('Disconnected from live updates. Reconnecting...', 'warning');
        // Attempt to reconnect after a delay
        setTimeout(initWebSocket, 5000);
    };
}

function handleWebSocketMessage(message) {
    switch (message.type) {
        case 'scoreUpdate':
            updateMatchScore(message.payload);
            break;
        case 'statusChange':
            updateMatchStatus(message.payload);
            break;
        case 'newMatch':
            addNewMatch(message.payload);
            break;
        case 'fullUpdate': // A full list of matches, useful for initial sync or major refresh
            allMatches = message.payload;
            updateFilterOptions();
            applyFilters();
            break;
        default:
            console.warn('Unknown WebSocket message type:', message.type);
    }
}

function updateMatchScore(payload) {
    const matchIndex = allMatches.findIndex(m => m.id === payload.matchId);
    if (matchIndex > -1) {
        const oldMatch = { ...allMatches[matchIndex] };
        allMatches[matchIndex].homeScore = payload.homeScore;
        allMatches[matchIndex].awayScore = payload.awayScore;
        allMatches[matchIndex].timeElapsed = payload.timeElapsed;

        // Trigger notification if score changed
        if (oldMatch.homeScore !== payload.homeScore || oldMatch.awayScore !== payload.awayScore) {
            showNotification(`${allMatches[matchIndex].homeTeam} ${payload.homeScore} - ${payload.awayScore} ${allMatches[matchIndex].awayTeam} (Live)`, 'info');
        }
        applyFilters(); // Re-render to update scores
    }
}

function updateMatchStatus(payload) {
    const matchIndex = allMatches.findIndex(m => m.id === payload.matchId);
    if (matchIndex > -1) {
        allMatches[matchIndex].status = payload.status;
        showNotification(`${allMatches[matchIndex].homeTeam} vs ${allMatches[matchIndex].awayTeam} is now ${payload.status}!`, 'info');
        applyFilters(); // Re-render to update status
    }
}

function addNewMatch(match) {
    allMatches.push(match);
    updateFilterOptions();
    showNotification(`New match added: ${match.homeTeam} vs ${match.awayTeam}`, 'success');
    applyFilters(); // Re-render to show new match
}

// --- API Integration (Initial Data Fetch) ---
async function fetchInitialMatches() {
    try {
        // In a real scenario, this would hit a specific endpoint, e.g., /matches?status=live,scheduled
        // For demonstration, we'll use mock data. Ensure you have a 'mock-matches.json' file in your project root.
        const response = await fetch('/mock-matches.json'); 
        // const response = await fetch(`${API_BASE_URL}/matches?apiKey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allMatches = data;
        updateFilterOptions();
        applyFilters();
    } catch (error) {
        console.error('Error fetching initial matches:', error);
        showNotification('Failed to load initial match data.', 'error');
        // Fallback to empty state or default mock data if API fails
        allMatches = [];
        updateFilterOptions();
        applyFilters();
    }
}

// --- Rendering & Filtering ---
function updateFilterOptions() {
    sports.clear();
    leagues.clear();

    allMatches.forEach(match => {
        sports.add(match.sport);
        leagues.add(match.league);
    });

    // Populate Sport Filter
    sportFilter.innerHTML = '<option value="">All Sports</option>';
    Array.from(sports).sort().forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport;
        sportFilter.appendChild(option);
    });

    // Populate League Filter
    leagueFilter.innerHTML = '<option value="">All Leagues</option>';
    Array.from(leagues).sort().forEach(league => {
        const option = document.createElement('option');
        option.value = league;
        option.textContent = league;
        leagueFilter.appendChild(option);
    });
}

function applyFilters() {
    const selectedSport = sportFilter.value;
    const selectedLeague = leagueFilter.value;
    const selectedStatus = statusFilter.value;
    const searchTerm = searchInput.value.toLowerCase();

    const filteredMatches = allMatches.filter(match => {
        const matchesSport = !selectedSport || match.sport === selectedSport;
