// script.js

// --- Configuration ---
const MAX_HISTORY_POINTS = 60; // Max data points for the chart (e.g., 1 minute of data if updating every second)
const UPDATE_INTERVAL_MS = 1000; // Simulate data update every 1 second
const ALERT_DISPLAY_DURATION_MS = 5000; // How long alerts stay visible

// --- DOM Elements ---
const addStockInput = document.getElementById('add-stock-input');
const addStockBtn = document.getElementById('add-stock-btn');
const watchlistUl = document.getElementById('watchlist');
const alertsContainer = document.getElementById('alerts-container');
const selectedStockTitle = document.getElementById('selected-stock-title');
const currentPriceDisplay = document.getElementById('current-price');
const stockChartCanvas = document.getElementById('stockChart');
const alertStockSymbolSpan = document.getElementById('alert-stock-symbol');
const alertPriceInput = document.getElementById('alert-price');
const alertConditionSelect = document.getElementById('alert-condition');
const setAlertBtn = document.getElementById('set-alert-btn');
const currentAlertsForStockDiv = document.getElementById('current-alerts-for-stock');

// --- Global State ---
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || []; // Store watchlist in localStorage
let stockData = {}; // { 'AAPL': { currentPrice: 150.23, history: [{time: Date, price: 150.23}, ...] } }
let alerts = JSON.parse(localStorage.getItem('alerts')) || {}; // { 'AAPL': [{ id: 'uuid', condition: 'above', price: 155, triggered: false }, ...] }
let chartInstance;
let selectedStockSymbol = null;
let dataStreamInterval;

// --- Chart Initialization ---
function initChart() {
    chartInstance = new Chart(stockChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Price',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0 // Disable animation for real-time updates
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'second',
                        displayFormats: {
                            second: 'HH:mm:ss'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price'
                    }
                }
            }
        }
    });
}

// --- Data Management ---
function addPriceToHistory(symbol, price) {
    if (!stockData[symbol]) {
        stockData[symbol] = { currentPrice: price, history: [] };
    }
    stockData[symbol].currentPrice = price;
    stockData[symbol].history.push({ time: new Date(), price: price });

    // Keep history limited
    if (stockData[symbol].history.length > MAX_HISTORY_POINTS) {
        stockData[symbol].history.shift(); // Remove oldest point
    }

    // If this is the selected stock, update the chart
    if (selectedStockSymbol === symbol) {
        updateChart(symbol);
        currentPriceDisplay.textContent = `$${price.toFixed(2)}`;
    }

    checkAlerts(symbol, price);
}

function updateChart(symbol) {
    if (!chartInstance || !stockData[symbol]) return;

    const history = stockData[symbol].history;
    chartInstance.data.labels = history.map(item => item.time);
    chartInstance.data.datasets[0].data = history.map(item => item.price);
    chartInstance.update();
}

// --- Watchlist Management ---
function renderWatchlist() {
    watchlistUl.innerHTML = '';
    watchlist.forEach(symbol => {
        const li = document.createElement('li');
        li.dataset.symbol = symbol;

        const symbolText = document.createElement('span');
        symbolText.textContent = symbol;
        symbolText.className = 'watchlist-symbol';
        li.appendChild(symbolText);

        const priceSpan = document.createElement('span');
        priceSpan.className = 'watchlist-price';
        priceSpan.textContent = stockData[symbol] ? `$${stockData[symbol].currentPrice.toFixed(2)}` : '--.--';
        li.appendChild(priceSpan);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.className = 'remove-stock';
        removeBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent selecting the stock when removing
            removeStockFromWatchlist(symbol);
        };
        li.appendChild(removeBtn);

        li.onclick = () => selectStock(symbol);
        watchlistUl.appendChild(li);

        if (symbol === selectedStockSymbol) {
            li.classList.add('selected');
        }
    });
}

function addStockToWatchlist(symbol) {
    symbol = symbol.toUpperCase().trim();
    if (!symbol || watchlist.includes(symbol)) {
        alert('Stock already in watchlist or invalid symbol.');
        return;
    }

    watchlist.push(symbol);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    stockData[symbol] = { currentPrice: 0, history: [] }; // Initialize data
    renderWatchlist();
    selectStock(symbol); // Automatically select the new stock
    addStockInput.value = '';
}

function removeStockFromWatchlist(symbol) {
    watchlist = watchlist.filter(s => s !== symbol);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));

    // Remove from stockData and alerts
    delete stockData[symbol];
    delete alerts[symbol];
    localStorage.setItem('alerts', JSON.stringify(alerts));

    renderWatchlist();

    if (selectedStockSymbol === symbol) {
        selectedStockSymbol = null;
        selectedStockTitle.textContent = 'Select a stock from watchlist';
        currentPriceDisplay.textContent = '--.--';
        chartInstance.data.labels = [];
        chartInstance.data.datasets[0].data = [];
        chartInstance.update();
        alertStockSymbolSpan.textContent = '';
        currentAlertsForStockDiv.innerHTML = '';
        document.getElementById('alert-settings').style.display = 'none';
    }
}

function selectStock(symbol) {
    if (selectedStockSymbol === symbol) return; // Already selected

    // Deselect previous
    const prevSelected = watchlistUl.querySelector('.selected');
    if (prevSelected) {
        prevSelected.classList.remove('selected');
    }

    selectedStockSymbol = symbol;
    const currentSelected = watchlistUl.querySelector(`[data-symbol="${symbol}"]`);
    if (currentSelected) {
        currentSelected.classList.add('selected');
    }

    selectedStockTitle.textContent = symbol;
    currentPriceDisplay.textContent = stockData[symbol] ? `$${stockData[symbol].currentPrice.toFixed(2)}` : '--.--';
    updateChart(symbol);
    renderAlertSettings(symbol);
    document.getElementById('alert-settings').style.display = 'block';
}

// --- Alerts Management ---
function renderAlertSettings(symbol) {
    alertStockSymbolSpan.textContent = symbol;
    currentAlertsForStockDiv.innerHTML = '';

    if (alerts[symbol] && alerts[symbol].length > 0) {
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        alerts[symbol].forEach(alert => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.borderBottom = '1px solid #eee';
            li.style.padding = '0.5em 0';

            li.textContent = `Alert: ${symbol} ${alert.condition} $${alert.price.toFixed(2)}`;
            if (alert.triggered) {
                li.style.fontWeight = 'bold';
                li.style.color = 'orange';
                li.textContent += ' (TRIGGERED)';
            }

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'x';
            removeBtn.style.marginLeft = '10px';
            removeBtn.style.backgroundColor = 'transparent';
            removeBtn.style.border = 'none';
            removeBtn.style.color = 'red';
            removeBtn.style.cursor = 'pointer';
            removeBtn.onclick = () => removeAlert(symbol, alert.id);
            li.appendChild(removeBtn);
            ul.appendChild(li);
        });
        currentAlertsForStockDiv.appendChild(ul);
    } else {
        currentAlertsForStockDiv.textContent = 'No alerts set for this stock.';
    }
}

function setAlert(symbol, condition, price) {
    price = parseFloat(price);
    if (isNaN(price) || price <= 0) {
        alert('Please enter a valid price for the alert.');
        return;
    }

    if (!alerts[symbol]) {
        alerts[symbol] = [];
    }

    // Generate a unique ID for the alert
    const alertId = Date.now().toString(36) + Math.random().toString(36).substring(2);

    alerts[symbol].push({ id: alertId, condition, price, triggered: false });
    localStorage.setItem('alerts', JSON.stringify(alerts));
    renderAlertSettings(symbol);
    alertPriceInput.value = '';
    displayAlert(`Alert set for ${symbol}: ${condition} $${price.toFixed(2)}`);
}

function removeAlert(symbol, alertId) {
    if (alerts[symbol]) {
        alerts[symbol] = alerts[symbol].filter(alert => alert.id !== alertId);
        if (alerts[symbol].length === 0) {
            delete alerts[symbol];
        }
        localStorage.setItem('alerts', JSON.stringify(alerts));
        renderAlertSettings(symbol);
    }
}

function checkAlerts(symbol, newPrice) {
    if (!alerts[symbol]) return;

    alerts[symbol].forEach(alert => {
        if (alert.triggered) return; // Don't re-trigger the same alert

        let shouldTrigger = false;
        if (alert.condition === 'above' && newPrice > alert.price) {
            shouldTrigger = true;
        } else if (alert.condition === 'below' && newPrice < alert.price) {
            shouldTrigger = true;
        }

        if (shouldTrigger) {
            alert.triggered = true;
            displayAlert(`🔥 ALERT for ${symbol}: Price is now $${newPrice.toFixed(2)} (${alert.condition} $${alert.price.toFixed(2)})`);
            renderAlertSettings(symbol); // Update UI to show alert as triggered
            localStorage.setItem('alerts', JSON.stringify(alerts));
        }
    });
}

function displayAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.textContent = message;
    alertsContainer.prepend(alertDiv); // Add to the top

    setTimeout(() => {
        alertDiv.remove();
    }, ALERT_DISPLAY_DURATION_MS);
}

// --- WebSocket Simulation (for demonstration) ---
function simulateStockDataStream() {
    // This function simulates a backend sending real-time data
    // In a real application, you'd connect to a WebSocket server here:
    // const ws = new WebSocket('ws://localhost:8080/stock-data');
    // ws.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     addPriceToHistory(data.symbol, data.price);
    // };

    dataStreamInterval = setInterval(() => {
        watchlist.forEach(symbol => {
            if (!stockData[symbol] || stockData[symbol].currentPrice === 0) {
                // Initialize with a random price if not set
                stockData[symbol] = { currentPrice: 100 + Math.random() * 50, history: [] };
            }
            const currentPrice = stockData[symbol].currentPrice;
            const change = (Math.random() - 0.5) * 2; // -1 to 1
            const newPrice = Math.max(1, currentPrice + change).toFixed(2); // Ensure price > 0

            addPriceToHistory(symbol, parseFloat(newPrice));

            // Update watchlist price display
            const priceSpan = watchlistUl.querySelector(`li[data-symbol="${symbol}"] .watchlist-price`);
            if (priceSpan) {
                priceSpan.textContent = `$${parseFloat(newPrice).toFixed(2)}`;
            }
        });
    }, UPDATE_INTERVAL_MS);
}

// --- Event Listeners ---
addStockBtn.addEventListener('click', () => {
    addStockToWatchlist(addStockInput.value);
});

addStockInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addStockToWatchlist(addStockInput.value);
    }
});

setAlertBtn.addEventListener('click', () => {
    if (selectedStockSymbol) {
        setAlert(selectedStockSymbol, alertConditionSelect.value, alertPriceInput.value);
    } else {
        displayAlert('Please select a stock to set an alert.');
    }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    renderWatchlist();
    if (watchlist.length > 0) {
        selectStock(watchlist[0]); // Select the first stock by default
    } else {
        document.getElementById('alert-settings').style.display = 'none';
    }
    simulateStockDataStream();
});
