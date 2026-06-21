document.addEventListener('DOMContentLoaded', () => {
    const starRatingContainer = document.querySelector('.star-rating');
    const currentRatingValueSpan = document.getElementById('current-rating-value');
    const NUM_STARS = 5;

    // State variables: currentRating holds the user's selected rating, hoverRating holds the rating currently moused over.
    let currentRating = 0; 
    let hoverRating = 0;   

    // Function to update the visual representation of stars and the display text based on current state.
    function updateStars() {
        const stars = starRatingContainer.querySelectorAll('.star');
        // Determine the rating value that should visually be 'active'. Hover takes precedence over selected.
        const activeRating = hoverRating > 0 ? hoverRating : currentRating;

        stars.forEach((star, index) => {
            const starValue = index + 1;
            // Toggle 'active' class for stars up to the activeRating (for both hover and selected visual feedback).
            star.classList.toggle('active', starValue <= activeRating);
            // Toggle 'selected' class for stars up to the currentRating (for persistent visual feedback after a click).
            star.classList.toggle('selected', starValue <= currentRating);

            // Accessibility: Update 'aria-checked' for screen readers to indicate which star is currently selected.
            star.setAttribute('aria-checked', starValue === currentRating ? 'true' : 'false');

            // Accessibility: Manage 'tabindex' for keyboard navigation.
            // If no star is selected, the first star is tabbable (0). If a star is selected, only that star is tabbable.
            // Other stars are programmatically focusable (-1).
            if (currentRating === 0) {
                star.setAttribute('tabindex', index === 0 ? '0' : '-1');
            } else {
                star.setAttribute('tabindex', starValue === currentRating ? '0' : '-1');
            }
        });

        // Update the textual display of the current rating.
        currentRatingValueSpan.textContent = currentRating;
    }

    // Event handler for when the mouse pointer enters a star.
    function handleMouseOver(event) {
        const value = parseInt(event.target.dataset.value); // Get the rating value from the star's data attribute.
        if (!isNaN(value)) {
            hoverRating = value; // Update the hover state.
            updateStars();       // Re-render stars to show hover effect.
        }
    }

    // Event handler for when the mouse pointer leaves the entire star rating container.
    function handleMouseOut() {
        hoverRating = 0; // Reset hover rating to clear hover effect.
        updateStars();   // Re-render stars to reflect only the selected rating.
    }

    // Event handler for when a star is clicked.
    function handleClick(event) {
        const value = parseInt(event.target.dataset.value); // Get the rating value from the clicked star.
        if (!isNaN(value)) {
            currentRating = value; // Update the selected rating state.
            hoverRating = 0;       // Clear any lingering hover state after selection.
            updateStars();         // Re-render stars to show the new selected rating.
        }
    }

    // Event handler for keyboard navigation (ArrowLeft, ArrowRight) and selection (Enter, Space).
    function handleKeyDown(event) {
        const targetStar = event.target;
        const currentStarValue = parseInt(targetStar.dataset.value);

        switch (event.key) {
            case 'ArrowRight':
                event.preventDefault(); // Prevent default browser scroll behavior.
                if (currentStarValue < NUM_STARS) {
                    // Focus the next star in the sequence.
                    starRatingContainer.children[currentStarValue].focus();
                    // Update hover state to visually indicate the focused star.
                    hoverRating = currentStarValue + 1;
                    updateStars();
                }
                break;
            case 'ArrowLeft':
                event.preventDefault(); // Prevent default browser scroll behavior.
                if (currentStarValue > 1) {
                    // Focus the previous star.
                    starRatingContainer.children[currentStarValue - 2].focus();
                    // Update hover state to visually indicate the focused star.
                    hoverRating = currentStarValue - 1;
                    updateStars();
                }
                break;
            case 'Enter':
            case ' ': // Spacebar also triggers selection.
                event.preventDefault(); // Prevent default browser behavior (e.g., spacebar scrolling).
                currentRating = currentStarValue; // Select the rating corresponding to the focused star.
                hoverRating = 0; // Clear hover state after selection.
                updateStars();
                break;
            case 'Escape': // Optional: allow clearing the rating with Escape key.
                event.preventDefault();
                currentRating = 0;
                hoverRating = 0;
                updateStars();
                // Optionally refocus the first star after clearing.
                starRatingContainer.children[0].focus();
                break;
            default:
                return; // Do nothing for other keys.
        }
    }

    // Function to initialize the star elements in the DOM and attach initial event listeners.
    function initStars() {
        for (let i = 0; i < NUM_STARS; i++) {
            const star = document.createElement('span');
            star.classList.add('star');
            star.textContent = '★'; // Use a Unicode star character for visual representation.
            star.dataset.value = i + 1; // Store the star's corresponding rating value.
            star.setAttribute('role', 'radio'); // ARIA role to indicate it's part of a radio group.
            star.setAttribute('aria-label', `${i + 1} star${i === 0 ? '' : 's'}`); // Accessible label for screen readers.
            star.setAttribute('tabindex', '-1'); // Initially not keyboard tabbable; managed dynamically by updateStars.

            // Attach event listeners to each individual star.
            star.addEventListener('mouseover', handleMouseOver);
            star.addEventListener('click', handleClick);
            star.addEventListener('keydown', handleKeyDown);
            
            starRatingContainer.appendChild(star);
        }
        // Attach a single mouseout listener to the container to handle leaving all stars.
        starRatingContainer.addEventListener('mouseout', handleMouseOut);

        // Perform an initial update to set up the default visual state and accessibility attributes.
        updateStars();
    }

    // Start the star rating widget initialization when the DOM is ready.
    initStars();
});
