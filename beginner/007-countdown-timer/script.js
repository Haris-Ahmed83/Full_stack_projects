// Select DOM elements
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const countdownTitleElement = document.getElementById('countdown-title');
const messageElement = document.getElementById('message');

// Set the target date (e.g., New Year 2025)
// You can change this date to any future date you want
const targetDate = new Date("Jan 1, 2025 00:00:00").getTime();

// Function to update the countdown
function updateCountdown() {
    // Get today's date and time
    const now = new Date().getTime();

    // Find the distance between now and the target date
    const distance = targetDate - now;

    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 *
