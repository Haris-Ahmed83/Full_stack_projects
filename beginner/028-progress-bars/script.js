document.addEventListener('DOMContentLoaded', () => {
    const progressBars = document.querySelectorAll('.progress-bar');

    const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    };

    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            const progressBar = entry.target;
            if (entry.isIntersecting) {
                // Element is in view, animate it to its target width
                const targetWidth = progressBar.dataset.target || '0%'; // Get target percentage from data-target attribute
                progressBar.style.width = targetWidth;

                // Optionally, stop observing this element if it only needs to animate once
                // observer.unobserve(progressBar);
            } else {
                // Element is out of view, reset its width
                // This allows the animation to re-trigger if it scrolls back into view
                progressBar.style.width = '0%';
            }
        });
    };

    const progressObserver = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe each progress bar
    progressBars.forEach(bar => {
        progressObserver.observe(bar);
    });
});
