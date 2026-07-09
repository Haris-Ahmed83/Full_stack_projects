// 1. Sidebar Toggle Logic
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content'); // Assuming a main content area to adjust

if (menuBtn && sidebar && mainContent) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('sidebar-collapsed');
    });
}

// 2. Category Chips Logic
const categoryChipsContainer = document.querySelector('.category-chips-container');

if (categoryChipsContainer) {
    const categoryChips = categoryChipsContainer.querySelectorAll('.category-chip');

    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove 'active' class from all chips
            categoryChips.forEach(c => c.classList.remove('active'));
            // Add 'active' class to the clicked chip
            chip.classList.add('active');

            // In a full application, you would typically filter videos here
            console.log('Category selected:', chip.textContent.trim());
        });
    });

    // Optional: Set the first chip as active on initial load if none are
    const activeChipExists = categoryChipsContainer.querySelector('.category-chip.active');
    if (!activeChipExists && categoryChips.length > 0) {
        categoryChips[0].classList.add('active');
    }
}
