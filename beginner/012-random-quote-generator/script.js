/**
 * Array of quote objects, each containing a quote and its author.
 * This serves as our sample data for the quote generator.
 */
const quotes = [
    { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { quote: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
    { quote: "The mind is everything. What you think you become.", author: "Buddha" },
    { quote: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { quote: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
    { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { quote: "Get busy living or get busy dying.", author: "Stephen King" },
    { quote: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", author: "Mark Twain" },
    { quote: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
];

// Get references to DOM elements where content will be displayed or interacted with
const quoteDisplay = document.getElementById('quote-display');
const authorDisplay = document.getElementById('author-display');
const newQuoteBtn = document.getElementById('new-quote-btn');

/**
 * Selects a random quote object from the 'quotes' array.
 * @returns {object} A quote object with 'quote' and 'author' properties.
 */
function getRandomQuote() {
    // Generate a random index based on the length of the quotes array
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex]; // Return the quote object at the random index
}

/**
 * Updates the DOM to display a new random quote and its author.
 */
function displayQuote() {
    const { quote, author } = getRandomQuote(); // Get a random quote object and destructure it

    // Update the text content of the quote and author display elements
    quoteDisplay.textContent = `"${quote}"`;
    authorDisplay.textContent = `- ${author}`;
}

// Add an event listener to the 'New Quote' button.
// When the button is clicked, the displayQuote function will be called.
newQuoteBtn.addEventListener('click', displayQuote);

// Display an initial quote immediately when the script loads (and DOM is ready due to 'defer').
displayQuote();
