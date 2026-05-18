document.addEventListener('DOMContentLoaded', () => {
    // Get references to HTML elements where time and date will be displayed
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const ampmEl = document.getElementById('ampm');
    const dateDisplayEl = document.getElementById('date-display');

    /**
     * Pads a number with a leading zero if it's less than 10.
     * @param {number} num - The number to pad.
     * @returns {string} The padded number as a string.
     */
    const padZero = (num) => {
        return num < 10 ? '0' + num : num;
    };

    /**
     * Updates the clock and date display with the current time.
     */
    const updateClock = () => {
        const now = new Date(); // Create a new Date object for the current time

        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Determine AM/PM and convert to 12-hour format
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert 24-hour to 12-hour format
        hours = hours === 0 ? 12 : hours; // Handle midnight (0 hours) as 12 AM

        // Get date components for display
        const options = {
            weekday: 'long', // e.g., Monday
            year: 'numeric', // e.g., 2024
            month: 'long',   // e.g., January
            day: 'numeric'   // e.g., 1
        };
        // Format the date using toLocaleDateString for internationalization
        const formattedDate = now.toLocaleDateString(undefined, options);

        // Update the text content of the HTML elements
        hoursEl.textContent = padZero(hours);
        minutesEl.textContent = padZero(minutes);
        secondsEl.textContent = padZero(seconds);
        ampmEl.textContent = ampm;
        dateDisplayEl.textContent = formattedDate;
    };

    // Call updateClock once immediately to display the time without a delay
    updateClock();

    // Update the clock every second using setInterval
    setInterval(updateClock, 1000);
});
