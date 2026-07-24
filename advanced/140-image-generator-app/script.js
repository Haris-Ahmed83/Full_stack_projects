document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const imageSizeSelect = document.getElementById('image-size');
    const generateBtn = document.getElementById('generate-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');
    const imageGallery = document.getElementById('image-gallery');

    // --- Configuration for API Simulation --- 
    // IMPORTANT: For a real DALL-E/Stable Diffusion API, you would need an API key
    // and typically a backend server to handle requests securely.
    // This frontend project simulates the API call and uses placeholder images
    // to allow it to be fully functional without a build step or actual API key.
    // To integrate a real API:
    // 1. Replace `simulateApiCall` with an actual `fetch` call to your API endpoint.
    // 2. Ensure your API key is handled securely (e.g., via a backend, not directly in frontend JS).
    // 3. Adjust the response parsing to match your API's output (e.g., array of image URLs).
    const API_SIMULATION_DELAY = 2000; // Simulate network latency (2 seconds)
    const MAX_IMAGES_TO_GENERATE = 4; // Number of placeholder images to show per generation
    const PLACEHOLDER_IMAGE_BASE_URL = 'https://picsum.photos/seed/'; // Using Lorem Picsum for varied images

    // Array to store generated image data (e.g., URL, prompt) in memory
    let generatedImages = [];

    // Event listener for the Generate button click
    generateBtn.addEventListener('click', generateImages);

    // Allows generating images by pressing Enter in the prompt input
    promptInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) { // Shift+Enter for new line, plain Enter to generate
            event.preventDefault(); // Prevent default Enter behavior (new line)
            generateImages();
        }
    });

    /**
     * Handles the image generation process.
     * Fetches prompt and size, simulates API call, and updates the UI.
     */
    async function generateImages() {
        const prompt = promptInput.value.trim();
        const imageSize = imageSizeSelect.value;

        // Basic validation for prompt input
        if (!prompt) {
            displayError('Please enter a prompt to generate images.');
            return;
        }

        // Clear any previous error message
        clearError();
        
        // Disable input elements and button, show loading indicator to provide feedback
        generateBtn.disabled = true;
        promptInput.disabled = true;
        imageSizeSelect.disabled = true;
        loadingIndicator.classList.remove('hidden');

        try {
            // Simulate the API call to get image URLs
            const imageUrls = await simulateApiCall(prompt, imageSize);
            
            // Process and display each generated image
            imageUrls.forEach(url => {
                const imageData = {
                    id: crypto.randomUUID(), // Generate a unique ID for each image
                    prompt: prompt,
                    url: url,
                    size: imageSize,
                    timestamp: new Date().toISOString()
                };
                generatedImages.unshift(imageData); // Add new image data to the beginning of the array
                displayImage(imageData); // Render the image card in the gallery
            });

        } catch (error) {
            console.error('Image generation failed:', error);
            displayError('Failed to generate images. Please try again. ' + error.message);
        } finally {
            // Re-enable input elements and button, hide loading indicator
            generateBtn.disabled = false;
            promptInput.disabled = false;
            imageSizeSelect.disabled = false;
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Simulates an API call to an image generation service.
     * In a real application, this would be an `fetch` call to a DALL-E/Stable Diffusion API.
     * @param {string} prompt - The text prompt for image generation.
     * @param {string} size - The desired image size (e.g., "1024x1024").
     * @returns {Promise<string[]>} A promise that resolves with an array of image URLs.
     */
    function simulateApiCall(prompt, size) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate a small chance of API failure for testing error handling
                if (Math.random() < 0.1) { // 10% chance of failure
                    reject(new Error('API simulation error: Could not process prompt.'));
                    return;
                }

                const [width, height] = size.split('x').map(Number);
                const urls = [];
                // Generate a few random placeholder images based on a seed derived from the prompt.
                // Note: Lorem Picsum doesn't actually use the prompt content for image generation,
                // but the seed ensures some consistency for the same prompt.
                const seed = generateSeedFromString(prompt);

                for (let i = 0; i < MAX_IMAGES_TO_GENERATE; i++) {
                    urls.push(`${PLACEHOLDER_IMAGE_BASE_URL}${seed + i}/${width}/${height}`);
                }
                resolve(urls);
            }, API_SIMULATION_DELAY);
        });
    }

    /**
     * Generates a simple numeric hash from a string to be used as a seed for placeholder images.
     * This helps in getting somewhat consistent images for the same prompt.
     * @param {string} str - The input string.
     * @returns {number} A numeric hash.
     */
    function generateSeedFromString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    /**
     * Creates and displays an image card in the gallery section.
     * @param {object} imageData - Object containing image data (id, prompt, url, size, timestamp).
     */
    function displayImage(imageData) {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.setAttribute('data-id', imageData.id);

        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = imageData.prompt; // Use prompt as alt text for accessibility
        img.loading = 'lazy'; // Enable lazy loading for images

        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions';

        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        // Attach event listener for downloading the specific image
        downloadBtn.addEventListener('click', () => downloadImage(imageData.url, imageData.prompt));

        cardActions.appendChild(downloadBtn);
        imageCard.appendChild(img);
        imageCard.appendChild(cardActions);
        imageGallery.prepend(imageCard); // Add new images to the top of the gallery
    }

    /**
     * Initiates the download of an image by creating and programmatically clicking a temporary anchor tag.
     * @param {string} imageUrl - The URL of the image to download.
     * @param {string} prompt - The prompt associated with the image, used for generating a filename.
     */
    function downloadImage(imageUrl, prompt) {
        const a = document.createElement('a'); // Create a temporary anchor element
        a.href = imageUrl;
        // Sanitize prompt for filename and add a timestamp for uniqueness
        const filename = `ai-image-${prompt.substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')}-${Date.now()}.jpg`;
        a.download = filename;
        document.body.appendChild(a); // Append to body to make it clickable in all browsers
        a.click(); // Programmatically click the anchor to trigger download
        document.body.removeChild(a); // Remove the temporary anchor element
    }

    /**
     * Displays an error message to the user.
     * @param {string} message - The error message to display.
     */
    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    /**
     * Clears any displayed error message.
     */
    function clearError() {
        errorMessage.classList.add('hidden');
        errorMessage.textContent = '';
    }
});
