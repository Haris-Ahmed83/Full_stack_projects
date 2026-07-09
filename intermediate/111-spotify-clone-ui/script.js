// --- Player Bar Functionality ---
const playPauseBtn = document.getElementById('play-pause-btn');
const playPauseIcon = document.getElementById('play-pause-icon');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const volumeSlider = document.getElementById('volume-slider');

let isPlaying = false;
let currentProgress = 0; // percentage 0-100
let duration = 240; // Example duration in seconds (4 minutes)
let currentAudioTime = 0;
let progressInterval;

// Simulate audio playback
function startProgressSimulation() {
    progressInterval = setInterval(() => {
        if (currentAudioTime < duration) {
            currentAudioTime++;
            currentProgress = (currentAudioTime / duration) * 100;
            if (progressBar) {
                progressBar.style.width = `${currentProgress}%`;
            }
            updateTimeDisplay();
        } else {
            clearInterval(progressInterval);
            isPlaying = false;
            if (playPauseIcon) {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
            currentAudioTime = 0;
            currentProgress = 0;
            if (progressBar) {
                progressBar.style.width = '0%';
            }
            updateTimeDisplay();
        }
    }, 1000); // Update every second
}

function stopProgressSimulation() {
    clearInterval(progressInterval);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function updateTimeDisplay() {
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(currentAudioTime);
    }
    if (durationDisplay) {
        durationDisplay.textContent = formatTime(duration);
    }
}

if (playPauseBtn && playPauseIcon) {
    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
            startProgressSimulation();
        } else {
            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
            stopProgressSimulation();
        }
    });
}

if (progressContainer && progressBar) {
    progressContainer.addEventListener('click', (e) => {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        const newProgress = (clickX / width) * 100;
        progressBar.style.width = `${newProgress}%`;
        currentProgress = newProgress;
        currentAudioTime = (currentProgress / 100) * duration;
        updateTimeDisplay();
        if (isPlaying) {
            stopProgressSimulation();
            startProgressSimulation();
        }
    });
}

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value;
        // In a real app, you'd set audio.volume = volume / 100;
        console.log(`Volume set to: ${volume}%`);
    });
}

// Initialize time display on load
document.addEventListener('DOMContentLoaded', updateTimeDisplay);


// --- Sidebar Navigation Functionality ---
const sidebarLinks = document.querySelectorAll('.sidebar-nav .nav-link');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Prevent default link behavior if they are just placeholders
        // e.preventDefault(); 

        // Remove 'active' class from currently active link
        const currentActive = document.querySelector('.sidebar-nav .nav-link.active');
        if (currentActive) {
            currentActive.classList.remove('active');
        }

        // Add 'active' class to the clicked link
