// Get DOM elements
const carouselTrack = document.querySelector('.carousel-track');
const images = document.querySelectorAll('.carousel-track img');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
const indicatorsContainer = document.querySelector('.carousel-indicators');

// State variables
let currentIndex = 0;
const totalImages = images.length;
let slideInterval;
const slideDuration = 3000; // Time in ms for auto-slide

// --- Functions ---

// Function to update the carousel display
function updateCarousel() {
    // Apply CSS transform to move the track
    // Each image is assumed to be 100% width of the carousel-container
    carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;

    // Update active indicator
    updateIndicators();
}

// Function to update the active indicator dot
function updateIndicators() {
    const indicators = document.querySelectorAll('.carousel-indicator');
    indicators.forEach((indicator, index) => {
        if (index === currentIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Function to go to the next slide
function goToNextSlide() {
    currentIndex =
