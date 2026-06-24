// Get references to DOM elements
const quoteContainer = document.getElementById('quote-container');
const quoteText = document.getElementById('quote');
const authorText = document.getElementById('author');
const newQuoteBtn = document.getElementById('new-quote');
const twitterBtn = document.getElementById('twitter');
const copyBtn = document.getElementById('copy-quote');
const loader = document.getElementById('loader');

// Global state for the currently displayed quote
let currentQuote = { text: '', author: '' };

// Helper function to show the loading spinner and hide the quote container
function showLoadingSpinner() {
    loader.style.display = 'block'; // Display the spinner
    quoteContainer.classList.add('hidden'); // Add 'hidden' class to trigger fade-out animation
}

// Helper function to hide the loading spinner and show the quote container
function hideLoadingSpinner() {
    // Only hide the spinner if the quote container is no longer hidden (i.e., it has faded in)
    if (!quoteContainer.classList.contains('hidden')) {
        loader.style.display = 'none'; // Hide the spinner
    }
}

// Function to update the UI with the current quote data
// This simulates a 'render' function in a reactive framework (like React's component render)
function displayQuote() {
    // First, hide the quote container to animate the transition
    quoteContainer.classList.add('hidden');
    showLoadingSpinner(); // Show spinner while content is transitioning

    // After a short delay (matching CSS transition duration), update content and fade in
    setTimeout(() => {
        // Check if author field is blank or 'Unknown' and replace it
        if (currentQuote.author === 'Unknown' || !currentQuote.author) {
            authorText.textContent = 'Unknown';
        } else {
            authorText.textContent = currentQuote.author;
        }

        // Dynamically adjust font size for longer quotes to ensure readability
        if (currentQuote.text.length > 120) {
            quoteText.classList.add('long-quote');
        } else {
            quoteText.classList.remove('long-quote');
        }
        
        quoteText.textContent = currentQuote.text; // Update the quote text
        
        // Remove 'hidden' class to trigger fade-in animation
        quoteContainer.classList.remove('hidden');
        hideLoadingSpinner(); // Hide spinner after content is visible
    }, 300); // This delay should match the 'transition' duration in style.css for '.quote-container'
}

// Function to fetch a random quote from an API
// This simulates a 'useEffect' hook with data fetching logic
async function getQuotes() {
    showLoadingSpinner(); // Show loader before starting the fetch operation
    const apiUrl = 'https://api.quotable.io/random'; // Public API for random quotes
    try {
        const response = await fetch(apiUrl);
        // Check if the response is OK (status code 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Update the currentQuote state with fetched data
        currentQuote = {
            text: data.content,
            author: data.author
        };
        displayQuote(); // Trigger UI update with the new quote
    } catch (error) {
        console.error('Error fetching quote:', error); // Log any fetching errors
        // Display a fallback error message if API call fails
        currentQuote = {
            text: 'An error occurred while fetching a quote. Please try again.',
            author: 'API Error'
        };
        displayQuote(); // Display the error message as a quote
    }
}

// Function to tweet the current quote
function tweetQuote() {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${currentQuote.text} - ${currentQuote.author}`;
    window.open(twitterUrl, '_blank'); // Open Twitter web intent in a new tab
}

// Function to copy the current quote to the clipboard
async function copyQuote() {
    try {
        const quoteToCopy = `${currentQuote.text} - ${currentQuote.author}`;
        await navigator.clipboard.writeText(quoteToCopy); // Use modern Clipboard API
        alert('Quote copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy quote: ', err); // Log any copying errors
        alert('Failed to copy quote. Please try manually.'); // Fallback alert
    }
}

// Event Listeners for buttons
newQuoteBtn.addEventListener('click', getQuotes);
twitterBtn.addEventListener('click', tweetQuote);
copyBtn.addEventListener('click', copyQuote);

// On Load: Fetch a quote when the page first loads
// This simulates 'useEffect' with an empty dependency array (runs once on mount)
getQuotes();
