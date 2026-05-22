const parallaxLayers = document.querySelectorAll('.parallax-layer');

window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY;

    parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed) || 0.5; // Default speed if not specified

        // Calculate the translation amount.
