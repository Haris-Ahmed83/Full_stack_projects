document.addEventListener('DOMContentLoaded', () => {
    // 1. Add a class to the body or a main container to trigger initial CSS animations
    // This allows CSS to animate elements only after the DOM is fully loaded.
    document.body.classList.add('page-loaded');

    // 2. Handle the "Go Home" button click
    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
        homeButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
