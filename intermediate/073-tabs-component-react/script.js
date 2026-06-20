document.addEventListener('DOMContentLoaded', () => {
    // Select all tab header buttons and content panels
    const tabHeaders = document.querySelectorAll('.tab-header');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Add a click event listener to each tab header
    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Get the data-tab-index attribute from the clicked header
            // This index links the header to its corresponding content panel
            const targetIndex = header.dataset.tabIndex;

            // --- Deactivate all tabs and panels ---
            // Remove 'active' class from all tab headers
            tabHeaders.forEach(h => {
                h.classList.remove('active');
                h.setAttribute('aria-selected', 'false'); // Update ARIA attribute
            });
            // Remove 'active' class from all tab content panels
            tabPanels.forEach(p => p.classList.remove('active'));

            // --- Activate the clicked tab and its panel ---
            // Add 'active' class to the clicked tab header
            header.classList.add('active');
            header.setAttribute('aria-selected', 'true'); // Update ARIA attribute
            
            // Find and add 'active' class to the corresponding tab content panel
            // The targetIndex is used to select the correct panel from the tabPanels NodeList
            tabPanels[targetIndex].classList.add('active');
        });
    });
});
