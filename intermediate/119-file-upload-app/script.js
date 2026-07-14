// Get DOM elements
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const progressBarFill = document.getElementById('progressBarFill');
const progressText = document.getElementById('progressText');
const messagesDiv = document.getElementById('messages');
const fileNameSpan = document.getElementById('fileName');
const fileInfoDiv = document.getElementById('fileInfo');

// Disable upload button initially
uploadButton.disabled = true;

// Event listener for file input change
fileInput.addEventListener('change', () => {
    messagesDiv.innerHTML = ''; // Clear previous messages
    fileInfoDiv.innerHTML = ''; // Clear previous file info

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameSpan.textContent = file.name;
        uploadButton.disabled = false;

        // Display basic file info
        fileInfoDiv.innerHTML = `
            <p><strong>Name:</strong> ${file.name}</p>
            <p><strong>Type:</strong> ${file.type || 'N/A'}</p>
            <p><strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
        `;

        // Client-side validation (basic example)
        const MAX_FILE_SIZE_MB = 10; // Example: 10 MB limit
        const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4']; // Example types

        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            displayMessage(`Error: File size exceeds ${MAX_FILE_SIZE_MB} MB.`, 'error');
            uploadButton.disabled = true;
            return;
        }

        if (ALLOWED_FILE_TYPES.length > 0 && !ALLOWED_FILE_TYPES.includes(file.type)) {
            displayMessage(`Error: Invalid file type. Allowed types: ${ALLOWED_FILE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}.`, 'error');
            uploadButton.disabled = true;
            return;
        }

    } else {
        fileNameSpan.textContent = 'No file chosen';
        uploadButton.disabled = true;
    }
    resetProgressBar();
});

// Event listener for upload button click
uploadButton.addEventListener('click', uploadFile);

function uploadFile() {
    if (fileInput.files.length === 0) {
        displayMessage('Please select a file first.', 'error');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('myFile', file); // 'myFile' should match the field name expected by Multer on the server (e.g., `upload.single('myFile')`)

    const xhr = new XMLHttpRequest();

    xhr.open('POST', '/upload', true); // Endpoint for file upload on your Express server

    // Progress event listener
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = (event.loaded / event.total) * 100;
            updateProgressBar(percent);
        }
    };

    // Load event listener (upload complete)
    xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) { // 200 OK or 201 Created
            const response = JSON.parse(xhr.responseText);
            displayMessage(`Upload successful! ${response.message || ''}`, 'success');
            if (response.fileUrl
