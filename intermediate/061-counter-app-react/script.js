document.addEventListener('DOMContentLoaded', () => {
    // Initialize the counter state
    let count = 0; // This variable holds our "component state"

    // Get references to DOM elements
    const countDisplay = document.getElementById('count');
    const incrementBtn = document.getElementById('incrementBtn');
    const decrementBtn = document.getElementById('decrementBtn');
    const resetBtn = document.getElementById('resetBtn');

    /**
     * Updates the UI to reflect the current `count` state.
     * This function mimics the re-rendering phase after a state change in frameworks
     * and demonstrates conditional rendering based on state.
     */
    function updateUI() {
        // Update the displayed counter value
        countDisplay.textContent = count;

        // Apply conditional styling based on the count value
        countDisplay.classList.remove('positive', 'negative', 'zero'); // Clear existing classes
        if (count > 0) {
            countDisplay.classList.add('positive');
        } else if (count < 0) {
            countDisplay.classList.add('negative');
        } else {
            countDisplay.classList.add('zero');
        }

        // Example of conditional button disabling (currently commented out to allow negative numbers)
        // decrementBtn.disabled = count === 0;
    }

    // Event Handlers for buttons
    incrementBtn.addEventListener('click', () => {
        count++; // Update state
        updateUI(); // Re-render UI
    });

    decrementBtn.addEventListener('click', () => {
        count--; // Update state
        updateUI(); // Re-render UI
    });

    resetBtn.addEventListener('click', () => {
        count = 0; // Reset state
        updateUI(); // Re-render UI
    });

    // Initial UI update when the page loads to display the default state (0)
    updateUI();
});
