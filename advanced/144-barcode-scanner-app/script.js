document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const video = document.getElementById('video');
    const startScanBtn = document.getElementById('start-scan-btn');
    const stopScanBtn = document.getElementById('stop-scan-btn');
    const statusMessage = document.getElementById('status-message');
    const barcodeDetectorSupport = document.getElementById('barcode-detector-support');
    const productInfoDiv = document.getElementById('product-info');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const scanFeedback = document.getElementById('scan-feedback');

    let stream = null; // Holds the camera video stream
    let barcodeDetector = null;
    let scanInterval = null; // Stores the interval ID for continuous scanning
    let isScanning = false;
    const SCAN_INTERVAL_MS = 500; // Time in milliseconds between barcode detection attempts
    const SCAN_COOLDOWN_MS = 3000; // Time in milliseconds to pause scanning after a barcode is found

    const HISTORY_KEY = 'barcodeScanHistory'; // Key for localStorage

    // --- Feature Detection and Initialization --- 
    function init() {
        // Check for BarcodeDetector API support in the browser
        if ('BarcodeDetector' in window) {
            barcodeDetectorSupport.textContent = 'Barcode Detection API is supported!';
            // Style the support message positively
            barcodeDetectorSupport.style.backgroundColor = '#d4edda'; 
            barcodeDetectorSupport.style.borderColor = '#28a745'; 
            barcodeDetectorSupport.style.color = '#155724'; 

            // Get supported barcode formats and initialize BarcodeDetector
            BarcodeDetector.getSupportedFormats()
                .then(supportedFormats => {
                    // Filter for commonly used product barcode formats and QR codes
                    const formats = ['ean_13', 'upc_a', 'ean_8', 'codabar', 'code_39', 'code_93', 'code_128', 'itf', 'qr_code'].filter(f => supportedFormats.includes(f));
                    if (formats.length > 0) {
                        barcodeDetector = new BarcodeDetector({ formats: formats });
                        console.log('BarcodeDetector initialized with formats:', formats);
                    } else {
                        statusMessage.textContent = 'No suitable barcode formats found for BarcodeDetector.';
                        startScanBtn.disabled = true; // Disable scan if no formats can be detected
                    }
                })
                .catch(err => {
                    statusMessage.textContent = `Error initializing BarcodeDetector: ${err.message}`;
                    startScanBtn.disabled = true;
                });
        } else {
            // Display an error if BarcodeDetector API is not supported
            barcodeDetectorSupport.textContent = 'Barcode Detection API is NOT supported in this browser. Try Chrome or Edge.';
            // Style the support message negatively
            barcodeDetectorSupport.style.backgroundColor = '#f8d7da'; 
            barcodeDetectorSupport.style.borderColor = '#dc3545'; 
            barcodeDetectorSupport.style.color = '#721c24'; 
            startScanBtn.disabled = true; // Disable scan button if API is not available
        }

        // Check for MediaDevices API (camera access) support
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            statusMessage.textContent = 'MediaDevices API (camera access) is NOT supported in this browser.';
            startScanBtn.disabled = true; // Disable scan if camera access is not possible
        }

        loadHistory(); // Load scan history from localStorage on page load
    }

    // --- Camera Control Functions --- 
    async function startCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            statusMessage.textContent = 'Camera access not supported.';
            return;
        }

        try {
            // Request camera access, preferring the environment (back) camera for scanning
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use the back camera
                    width: { ideal: 1280 }, // Request ideal video resolution for better detection
                    height: { ideal: 720 }
                }
            });
            video.srcObject = stream; // Assign the camera stream to the video element
            video.play(); // Start playing the video stream
            statusMessage.textContent = 'Camera started. Ready to scan.';
            startScanBtn.disabled = true; // Disable start button once camera is on
            stopScanBtn.disabled = false; // Enable stop button
            scanFeedback.classList.add('active'); // Show scanning feedback overlay
            startBarcodeScan(); // Begin the continuous barcode detection loop
        } catch (err) {
            console.error('Error accessing camera:', err);
            statusMessage.textContent = `Error accessing camera: ${err.name} - ${err.message}`;
            startScanBtn.disabled = false;
            stopScanBtn.disabled = true;
            scanFeedback.classList.remove('active');
        }
    }

    function stopCamera() {
        if (stream) {
            // Stop all tracks (video, audio) in the stream to release camera resources
            stream.getTracks().forEach(track => track.stop()); 
            stream = null;
        }
        video.srcObject = null; // Disconnect the stream from the video element
        stopBarcodeScan(); // Halt barcode detection
        statusMessage.textContent = 'Camera stopped.';
        startScanBtn.disabled = false; // Re-enable start button
        stopScanBtn.disabled = true; // Disable stop button
        scanFeedback.classList.remove('active'); // Hide scanning feedback
    }

    // --- Barcode Scanning Logic --- 
    function startBarcodeScan() {
        // Only start if BarcodeDetector is initialized and not already scanning
        if (!barcodeDetector || isScanning) return;

        isScanning = true;
        scanFeedback.textContent = 'Scanning...';
        scanFeedback.classList.add('active');

        // Set up an interval to continuously detect barcodes from the video feed
        scanInterval = setInterval(async () => {
            // Only attempt detection if video has enough data and detector is ready
            if (video.readyState !== video.HAVE_ENOUGH_DATA || !barcodeDetector || !isScanning) {
                return;
            }

            try {
                const barcodes = await barcodeDetector.detect(video); // Detect barcodes in the current video frame
                if (barcodes.length > 0) {
                    const latestBarcode = barcodes[0]; // Process the first detected barcode
                    console.log('Barcode detected:', latestBarcode.rawValue, latestBarcode.format);
                    statusMessage.textContent = `Barcode found: ${latestBarcode.rawValue}`;
                    scanFeedback.textContent = 'Barcode found!';
                    scanFeedback.classList.add('found'); // Add a visual cue for found barcode
                    
                    stopBarcodeScan(); // Temporarily stop scanning to avoid multiple detections of the same barcode
                    
                    // Resume scanning after a cooldown period
                    setTimeout(() => {
                        scanFeedback.classList.remove('found');
                        startBarcodeScan(); 
                    }, SCAN_COOLDOWN_MS);

                    lookupProduct(latestBarcode.rawValue); // Initiate product lookup for the detected barcode
                }
            } catch (err) {
                console.error('Error detecting barcode:', err);
                statusMessage.textContent = `Error detecting barcode: ${err.message}`;
            }
        }, SCAN_INTERVAL_MS);
    }

    function stopBarcodeScan() {
        if (scanInterval) {
            clearInterval(scanInterval); // Stop the interval for barcode detection
            scanInterval = null;
        }
        isScanning = false;
        scanFeedback.textContent = 'Scan paused.';
        scanFeedback.classList.remove('active');
        scanFeedback.classList.remove('found');
    }

    // --- Product Lookup Function (using Open Food Facts API) --- 
    async function lookupProduct(barcode) {
        // Clear previous product information display
        productInfoDiv.innerHTML = '<p>Looking up product...</p>';

        // Open Food Facts API endpoint for product lookup
        const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === 1 && data.product) { // Check if product was found successfully
                const product = data.product;
                const productName = product.product_name || 'Unknown Product';
                const productBrand = product.brands || 'N/A';
                const productImage = product.image_url || 'https://via.placeholder.com/150?text=No+Image';

                // Update the product info display with retrieved data
                productInfoDiv.innerHTML = `
                    <p><span class="product-name">${productName}</span></p>
                    <p><strong>Brand:</strong> ${productBrand}</p>
                    <p><strong>Barcode:</strong> ${barcode}</p>
                    ${productImage ? `<img src="${productImage}" alt="${productName}" class="product-image">` : ''}
                `;
                saveToHistory(barcode, productName, productImage); // Save the successful lookup to history
            } else { // Product not found in the API
                productInfoDiv.innerHTML = `
                    <p>No product found for barcode: ${barcode}</p>
                `;
                saveToHistory(barcode, 'Product not found', null); // Save to history even if not found
            }
        } catch (error) {
            console.error('Product lookup failed:', error);
            productInfoDiv.innerHTML = `
                <p>Failed to lookup product for barcode: ${barcode}</p>
                <p>Error: ${error.message}</p>
            `;
            saveToHistory(barcode, 'Lookup failed', null); // Save to history on lookup error
        }
    }

    // --- History Management Functions --- 
    function loadHistory() {
        // Retrieve history from localStorage, parse JSON, or default to an empty array
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        historyList.innerHTML = ''; // Clear current list in the DOM
        if (history.length === 0) {
            historyList.innerHTML = '<li>No scan history yet.</li>';
        } else {
            // Add each history item to the DOM, appending them as they are loaded
            history.forEach(item => addHistoryItemToDOM(item, true)); 
        }
        // Enable/disable clear history button based on history presence
        clearHistoryBtn.disabled = history.length === 0;
    }

    function saveToHistory(barcode, productName, imageUrl) {
        const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        const newItem = {
            barcode: barcode,
            name: productName,
            imageUrl: imageUrl,
            timestamp: new Date().toLocaleString() // Record scan time
        };
        history.unshift(newItem); // Add new item to the beginning of the array (most recent first)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); // Save updated history to localStorage
        addHistoryItemToDOM(newItem, false); // Add the new item to the DOM, prepending it
        clearHistoryBtn.disabled = false; // Ensure clear history button is enabled
    }

    function addHistoryItemToDOM(item, append = false) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span class="barcode-value">${item.barcode}</span>
            <span class="product-summary">${item.name}</span>
            <span class="scan-timestamp">${item.timestamp}</span>
        `;
        if (append) {
            historyList.appendChild(listItem); // For loading existing history
        } else {
            // If "No scan history yet." message is present, remove it
            if (historyList.firstElementChild && historyList.firstElementChild.textContent === 'No scan history yet.') {
                historyList.innerHTML = '';
            }
            historyList.prepend(listItem); // Add new items to the top of the list
        }
    }

    function clearHistory() {
        localStorage.removeItem(HISTORY_KEY); // Remove history from localStorage
        loadHistory(); // Reload history, which will now show the empty message
    }

    // --- Event Listeners --- 
    startScanBtn.addEventListener('click', startCamera);
    stopScanBtn.addEventListener('click', stopCamera);
    clearHistoryBtn.addEventListener('click', clearHistory);

    // Initialize the application when the DOM is fully loaded
    init();
});
