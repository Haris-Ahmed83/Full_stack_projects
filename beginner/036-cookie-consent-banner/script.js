document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptButton = document.getElementById('accept-cookies');
    const declineButton = document.getElementById('decline-cookies');

    // Check if the user has previously made a choice
    const userConsent = localStorage.getItem('cookieConsent');

    // If no choice has been made, display the banner
    if (!userConsent) {
        cookieBanner.style.display = 'block';
    }

    // Add event listener for the Accept button
    if (acceptButton) {
        acceptButton.addEventListener('click', () => {
            // Store the user's acceptance in localStorage
            localStorage.setItem('cookieConsent', 'accepted');
            // Hide the banner
            cookieBanner.style.display = 'none';
            // In a real application, you would now enable analytics scripts,
            // load third-party content, or set actual cookies here.
        });
    }

    // Add event listener for the Decline button
    if (declineButton) {
        declineButton.addEventListener('click', () => {
            // Store the user's decline in localStorage
            localStorage.setItem('cookieConsent', 'declined');
            // Hide the banner
            cookieBanner.style.display = 'none';
            // In a real application, you would ensure no non-essential cookies
            //
