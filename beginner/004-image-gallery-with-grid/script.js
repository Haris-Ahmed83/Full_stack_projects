document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');

    let currentIndex = 0;
    let galleryImagesData = []; // To store src, alt, and caption for each image

    // Populate galleryImagesData array and add click listeners to gallery items
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        galleryImagesData.push({
            src: img.src,
            alt: img.alt,
            caption: img.dataset.caption || img.alt // Use data-caption if available, else alt
        });

        item.addEventListener('click', () => {
            currentIndex = index;
            openLightbox(currentIndex);
        });
    });

    function openLightbox(index) {
        if (index < 0) {
            currentIndex = galleryImagesData.length - 1; // Wrap to last image
        } else if (index >= galleryImagesData.length) {
            currentIndex = 0; // Wrap to first image
        } else {
            currentIndex = index;
        }

        const currentImage = galleryImagesData[currentIndex];
        lightboxImg.src = currentImage.src;
        lightboxImg.alt = currentImage.alt;
        lightboxCaption.textContent = currentImage.caption;
        lightbox.classList.add('active'); // Show the lightbox
    }

    function closeLightbox() {
        lightbox.classList.remove('active'); // Hide the lightbox
    }

    function showNextImage() {
        openLightbox(currentIndex + 1);
    }

    function showPrevImage() {
        openLightbox(currentIndex - 1);
    }

    // Event listeners for lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevImage);
    lightboxNext.addEventListener('click', showNextImage);

    // Close lightbox when clicking on the overlay itself
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox
