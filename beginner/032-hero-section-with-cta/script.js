document.addEventListener('DOMContentLoaded', () => {
    // Select the Call-to-Action button
    const ctaButton = document.querySelector('.hero-cta-button');

    // Add a click event listener to the button
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            console.log('Hero CTA button clicked! Time to take action.');
            // For a beginner project, a simple console log demonstrates interactivity.
            // In a real application, this might trigger:
            // - Navigation to another page: window.location.href = 'your-link.html';
            // - Opening a modal: document.getElementById('myModal').style.display = 'block';
            // - Sending analytics data: sendAnalyticsEvent('cta_click');
        });
    }

    // You could add other JavaScript functionalities here if needed,
    // for example, dynamic text changes, form submissions, or more complex animations
    // that CSS alone cannot handle easily.
    // However, for a beginner project focused on CSS concepts like gradients, animations,
    // typography, and button styling, minimal JavaScript is often sufficient
    // or sometimes not even strictly necessary beyond basic interaction.
});
