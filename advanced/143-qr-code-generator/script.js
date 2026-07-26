// Get DOM elements
const qrDataInput = document.getElementById('qrData');
const qrSizeInput = document.getElementById('qrSize');
const qrColorInput = document.getElementById('qrColor');
const qrBgColorInput = document.getElementById('qrBgColor');
const qrLogoInput = document.getElementById('qrLogo');
const generateBtn = document.getElementById('generateBtn');
const qrOutputDiv = document.getElementById('qrOutput');

let logoImage = null; // Variable to store the loaded logo image

// Event listener for logo file input: loads the selected image into memory
qrLogoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            logoImage = new Image(); // Create a new Image object
            logoImage.onload = () => {
                // Logo image loaded successfully, ready to be drawn
                console.log('Logo image loaded.');
            };
            logoImage.onerror = () => {
                console.error('Error loading logo image.');
                logoImage = null; // Reset logo if loading fails
                alert('Failed to load logo image. Please try another file.');
            };
            logoImage.src = e.target.result; // Set the image source to the Data URL
        };
        reader.readAsDataURL(file); // Read the file as a Data URL
    } else {
        logoImage = null; // No file selected, clear logo
        console.log('No logo file selected.');
    }
});

// Event listener for the generate button
generateBtn.addEventListener('click', generateQRCodes);

/**
 * Generates QR codes based on the current input values.
 * Supports batch generation if multiple lines are entered in the data textarea.
 */
function generateQRCodes() {
    qrOutputDiv.innerHTML = ''; // Clear previous QR codes from the output area
    qrOutputDiv.classList.remove('placeholder'); // Remove the placeholder text class

    // Get and sanitize input values
    const dataLines = qrDataInput.value.split('\n').filter(line => line.trim() !== ''); // Split by newline, filter out empty lines
    const qrSize = parseInt(qrSizeInput.value); // Convert size to integer
    const qrColor = qrColorInput.value;
    const qrBgColor = qrBgColorInput.value;

    // Validate inputs
    if (dataLines.length === 0) {
        qrOutputDiv.innerHTML = '<p class="placeholder">Please enter some text or URL to generate QR codes.</p>';
        return;
    }
    if (isNaN(qrSize) || qrSize < 50 || qrSize > 1000) {
        alert('Please enter a valid QR code size between 50 and 1000 pixels.');
        qrOutputDiv.innerHTML = '<p class="placeholder">Invalid QR code size. Please correct it.</p>';
        return;
    }

    // Loop through each line of data for batch generation
    dataLines.forEach((data, index) => {
        // Create a container for each QR code item
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-item';

        // Create a canvas element for the QR code
        const canvas = document.createElement('canvas');
        canvas.width = qrSize;
        canvas.height = qrSize;
        qrContainer.appendChild(canvas);

        // Create a download link for the QR code
        const downloadLink = document.createElement('a');
        downloadLink.textContent = 'Download QR Code';
        downloadLink.href = '#'; // Placeholder href, will be set on click
        downloadLink.className = 'download-btn';
        // Attach click listener to download the specific QR code generated on this canvas
        downloadLink.addEventListener('click', (e) => downloadQRCode(e, canvas, data));
        qrContainer.appendChild(downloadLink);

        qrOutputDiv.appendChild(qrContainer);

        // Initialize QRious instance to draw the QR code on the canvas
        // QRious is a client-side library that draws QR codes directly to a canvas element.
        const qr = new QRious({
            element: canvas, // The canvas element to draw on
            value: data,     // The data to encode in the QR code
            size: qrSize,    // The size of the QR code (width and height)
            foreground: qrColor, // Foreground color of the QR code modules
            background: qrBgColor // Background color of the QR code
        });

        // If a logo image is loaded, draw it on top of the generated QR code
        if (logoImage && logoImage.complete) { // Ensure image is fully loaded
            const ctx = canvas.getContext('2d');
            // Calculate logo size relative to QR code size (e.g., 25% of QR code size)
            const logoSize = qrSize * 0.25; 
            // Calculate position to center the logo
            const x = (qrSize - logoSize) / 2;
            const y = (qrSize - logoSize) / 2;

            // Draw a solid background rectangle behind the logo to make it stand out
            // This helps prevent QR code data from showing through the logo
            ctx.fillStyle = qrBgColor;
            ctx.fillRect(x, y, logoSize, logoSize);

            // Draw the logo image onto the canvas
            ctx.drawImage(logoImage, x, y, logoSize, logoSize);
        } else if (logoImage && !logoImage.complete) {
            // If logo is still loading, try drawing it once it's ready
            logoImage.onload = () => {
                const ctx = canvas.getContext('2d');
                const logoSize = qrSize * 0.25;
                const x = (qrSize - logoSize) / 2;
                const y = (qrSize - logoSize) / 2;
                ctx.fillStyle = qrBgColor;
                ctx.fillRect(x, y, logoSize, logoSize);
                ctx.drawImage(logoImage, x, y, logoSize, logoSize);
            };
        }
    });
}

/**
 * Downloads the QR code from the given canvas.
 * @param {Event} event - The click event from the download button.
 * @param {HTMLCanvasElement} canvas - The canvas element containing the QR code.
 * @param {string} filenameData - The data used to generate the QR code, for filename sanitization.
 */
function downloadQRCode(event, canvas, filenameData) {
    event.preventDefault(); // Prevent the default link navigation

    // Convert the canvas content to a PNG data URL
    const dataURL = canvas.toDataURL('image/png');

    // Create a temporary anchor element for downloading
    const link = document.createElement('a');
    link.href = dataURL;
    
    // Sanitize the filename to be URL-friendly and readable
    // Replace non-alphanumeric characters with underscores, convert to lowercase, and truncate if too long
    const safeFilename = filenameData
        .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters except spaces and hyphens
        .trim()
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase()
        .substring(0, 30); // Truncate to avoid excessively long filenames

    link.download = `qrcode_${safeFilename || 'generated'}.png`; // Set the download filename

    // Programmatically click the link to trigger the download
    document.body.appendChild(link); // Append to body is necessary for Firefox
    link.click(); 
    document.body.removeChild(link); // Remove the temporary link element
}

// Initial display of placeholder text when the page loads
qrOutputDiv.innerHTML = '<p class="placeholder">Your QR codes will appear here.</p>';
