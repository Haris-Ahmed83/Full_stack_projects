const starRatingWidget = document.getElementById('star-rating-widget');
const ratingDisplay = document.getElementById('rating-display');

const numStars = 5;
let currentRating = 0; // Stores the permanently selected rating

// --- Initial setup: Create stars ---
for (let i = 1; i <= numStars; i++) {
    const
