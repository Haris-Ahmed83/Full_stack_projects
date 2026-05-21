document.addEventListener('DOMContentLoaded', () => {
    const accordionContainer = document.querySelector('.accordion-container');

    if (accordionContainer) {
        accordionContainer.addEventListener('click', (event) => {
            // Use event delegation to check if the clicked element or its parent is an accordion-header
            const header = event.target.closest('.accordion-header');

            if (header) {
                // Find the parent accordion item of the clicked header
                const accordionItem = header.closest('.accordion-item');

                if (accordionItem) {
                    // Toggle the 'active' class on the accordion item
                    // This class will be used by CSS to show/hide the content and apply transitions
                    accordionItem.classList.toggle('active');

                    // Update the aria-expanded attribute for accessibility
                    // Screen readers will announce whether the section is expanded or collapsed
                    const isExpanded = accordionItem.classList.contains('active');
                    header.setAttribute('aria-expanded', isExpanded);

                    // Optional: If you have an icon (e.g., a plus/minus or chevron)
                    // inside the header that needs to rotate or change, you can
                    // target it here and toggle a class.
                    // Example:
                    // const icon = header.querySelector('.accordion-icon');
