// This project implements a stopwatch using vanilla JavaScript.
// The term "React" in the project title is interpreted as the stopwatch
// "reacting" to user inputs, rather than using the React framework.
// Key concepts like "Interval Hooks" and "useRef" are implemented
// using standard vanilla JS features like setInterval/clearInterval
// and direct variable/DOM element references.

// 1. Get DOM elements for display and controls
const hoursDisplay = document.getElementById('hours');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');

const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn = document.getElementById('lapBtn');

const lapList = document.getElementById('lapList');

// 2. State variables
let timerInterval = null; // Stores the interval ID, `null` when the timer is stopped
let elapsedTime = 0;      // Stores total elapsed time in milliseconds
let lapTimes = [];        // Array to store recorded lap times

// 3. Helper function to format time for display
// Takes milliseconds as input and returns an object with padded time components.
function formatTime(ms) {
    const totalMilliseconds = ms;
    const hours = Math.floor(totalMilliseconds / 3600000);
    const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
    const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
    const milliseconds = Math.floor((totalMilliseconds % 1000));

    // Pad with leading zeros to ensure consistent display format (e.g., 5 -> 05)
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMilliseconds = String(milliseconds).padStart(3, '0');

    return { formattedHours, formattedMinutes, formattedSeconds, formattedMilliseconds };
}

// 4. Function to update the stopwatch display in the UI
function updateDisplay() {
    const { formattedHours, formattedMinutes, formattedSeconds, formattedMilliseconds } = formatTime(elapsedTime);
    hoursDisplay.textContent = formattedHours;
    minutesDisplay.textContent = formattedMinutes;
    secondsDisplay.textContent = formattedSeconds;
    millisecondsDisplay.textContent = formattedMilliseconds;
}

// 5. Function to start or resume the timer
function startTimer() {
    // Prevent starting if the timer is already running
    if (timerInterval !== null) return;

    // Calculate the 'effective' start time by subtracting elapsed time
    // from current time. This allows the timer to resume correctly after a pause.
    let startTime = Date.now() - elapsedTime;

    // Set an interval to update the display every 10 milliseconds
    // This provides a smooth visual update for milliseconds.
    timerInterval = setInterval(() => {
        elapsedTime = Date.now() - startTime; // Update total elapsed time
        updateDisplay(); // Refresh the display
    }, 10); 

    // Update button states: disable Start, enable Pause, Reset, and Lap
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    lapBtn.disabled = false;
}

// 6. Function to pause the timer
function pauseTimer() {
    clearInterval(timerInterval); // Stop the running interval
    timerInterval = null;         // Clear the interval ID

    // Update button states: enable Start, disable Pause
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    // Reset and Lap buttons remain enabled if there's elapsed time
}

// 7. Function to reset the timer to its initial state
function resetTimer() {
    clearInterval(timerInterval); // Stop any running interval
    timerInterval = null;         // Clear the interval ID
    elapsedTime = 0;              // Reset elapsed time to zero
    lapTimes = [];                // Clear all recorded lap times

    updateDisplay();         // Update display to 00:00:00.000
    lapList.innerHTML = '';  // Clear lap list in the UI

    // Reset all button states to initial: Start enabled, others disabled
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
    lapBtn.disabled = true;
}

// 8. Function to record a lap time
function recordLap() {
    // Only record a lap if the timer is currently running
    if (timerInterval === null) return;

    const currentLapTime = elapsedTime; // Get the current elapsed time
    lapTimes.push(currentLapTime);      // Add it to the lap times array

    const lapNumber = lapTimes.length; // Determine the lap number
    const { formattedHours, formattedMinutes, formattedSeconds, formattedMilliseconds } = formatTime(currentLapTime);

    // Create a new list item (<li>) for the lap time
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span>Lap ${lapNumber}</span>
        <span>${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}</span>
    `;
    lapList.appendChild(listItem); // Add the new lap item to the unordered list

    // Automatically scroll to the bottom of the lap list to show the latest lap
    lapList.scrollTop = lapList.scrollHeight;
}

// 9. Event Listeners for buttons
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
lapBtn.addEventListener('click', recordLap);

// 10. Initial display setup when the script loads
updateDisplay();
