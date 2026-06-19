document.addEventListener('DOMContentLoaded', () => {
    // Select all accordion header buttons
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        // Add a click event listener to each header
        header.addEventListener('click', () => {
            // Get the parent accordion item element
            const accordionItem = header.closest('.accordion-item');
            // Get the content panel associated with this header
            const accordionContent = accordionItem.querySelector('.accordion-content');

            // Check the current expanded state using the aria-expanded attribute
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                // If currently expanded, collapse it
                header.setAttribute('aria-expanded', 'false');
                accordionContent.setAttribute('aria-hidden', 'true');
                // Set max-height to 0 to trigger the CSS transition for collapsing
                accordionContent.style.maxHeight = '0';
            } else {
                // If currently collapsed, expand it
                header.setAttribute('aria-expanded', 'true');
                accordionContent.setAttribute('aria-hidden', 'false');

                // Set max-height to the scrollHeight to allow CSS transition to expand to full content height.
                // We use scrollHeight of the inner content div (accordion-content-inner) to ensure correct height calculation
                // even if there's padding on the outer accordion-content div itself, preventing content jump.
                const contentInner = accordionContent.querySelector('.accordion-content-inner');
                accordionContent.style.maxHeight = `${contentInner.scrollHeight}px`;

                /*
                // Optional: Uncomment the following block to implement 'single item open at a time' behavior.
                // This will close any other open accordion items when a new one is opened.
                accordionHeaders.forEach(otherHeader => {
                    if (otherHeader !== header && otherHeader.getAttribute('aria-expanded') === 'true') {
                        const otherAccordionItem = otherHeader.closest('.accordion-item');
                        const otherAccordionContent = otherAccordionItem.querySelector('.accordion-content');

                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherAccordionContent.setAttribute('aria-hidden', 'true');
                        otherAccordionContent.style.maxHeight = '0';
                    }
                });
                */
            }
        });

        // Add a 'transitionend' listener to the content element.
        // This is important for cleanup: once expanded, we remove the explicit max-height
        // to allow the content to naturally adjust to dynamic changes (e.g., window resize).
        const accordionContent = header.closest('.accordion-item').querySelector('.accordion-content');
        accordionContent.addEventListener('transitionend', () => {
            // Only perform cleanup if the accordion is currently expanded
            if (header.getAttribute('aria-expanded') === 'true') {
                // Remove max-height style to allow content to take its natural height.
                // This is crucial for responsiveness if the content changes or the viewport resizes.
                accordionContent.style.maxHeight = 'none';
            }
            // When collapsing (max-height: 0), we keep it at 0, no cleanup needed.
        });
    });
});
