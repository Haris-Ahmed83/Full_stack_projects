document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const textField = document.getElementById('textField');
    const currentCountSpan = document.getElementById('currentCount');
    const characterLimitDisplay = document.getElementById('characterLimitDisplay');
    const messageParagraph = document.getElementById('message');

    // Define the character limit and a threshold for warning
    const CHARACTER_LIMIT = 200; // Set a default character limit
    const WARNING_THRESHOLD = 0.8; // Warn when 80% of the limit is reached

    // Set the character limit display initially
    characterLimitDisplay.textContent = CHARACTER_LIMIT;

    /**
     * Updates the character count, remaining count, and applies styling based on limits.
     */
    function updateCounter() {
        const currentLength = textField.value.length;
        currentCountSpan.textContent = currentLength;

        // Calculate remaining characters
        const remaining = CHARACTER_LIMIT - currentLength;

        // Remove any existing styling classes from the current count and message
        currentCountSpan.classList.remove('warning', 'error');

        // Apply styling and update message based on character count relative to the limit
        if (currentLength > CHARACTER_LIMIT) {
            // If over the limit, show error state
            currentCountSpan.classList.add('error');
            messageParagraph.innerHTML = `Limit exceeded! <span class="error-message">-${Math.abs(remaining)}</span>`;
        } else if (currentLength >= CHARACTER_LIMIT * WARNING_THRESHOLD) {
            // If near the limit, show warning state
            currentCountSpan.classList.add('warning');
            messageParagraph.innerHTML = `Characters remaining: <span class="warning-message">${remaining}</span>`;
        } else {
            // Otherwise, show default state
            messageParagraph.innerHTML = `Characters remaining: <span>${remaining}</span>`;
        }
    }

    // Add event listener for real-time updates as the user types
    textField.addEventListener('input', updateCounter);

    // Initial call to set the counter state when the page loads
    updateCounter();
});
