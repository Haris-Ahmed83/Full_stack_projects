document.addEventListener('DOMContentLoaded', () => {
    const skillBars = document.querySelectorAll('.skill-bar');

    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of the item is visible
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target;
                const percentage = skillBar.dataset.percentage;
                if (percentage) {
                    skillBar.style.width = `${percentage}%`;
                    // Optional: Stop observing once animated
                    observer.unobserve(skillBar);

                    // Optional: Update the percentage text if there's an element for it
                    const percentageTextElement = skillBar.closest('.skill-bar-container').nextElementSibling;
                    if (percentageTextElement && percentageTextElement.classList.contains('skill-percentage')) {
                        percentageTextElement.textContent = `${percentage}%`;
                    }
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    skillBars.forEach(bar => {
        // Reset width to 0 for animation on page load or refresh
        bar.style.width = '0%';
        observer.observe(bar);
    });
});
