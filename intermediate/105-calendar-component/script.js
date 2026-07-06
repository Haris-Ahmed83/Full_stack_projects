// script.js

const calendarDays = document.getElementById('calendarDays');
const monthYearDisplay = document.getElementById('monthYearDisplay');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

let currentDate = new Date(); // Represents the currently displayed month/year

// --- Event Data (Example) ---
// In a real application, this would come from a backend or persistent storage.
const events = {
    "2023-10-26": ["Team Meeting", "Project Review"],
    "2023-11-15": ["Client Demo"],
    "2023-12-01": ["Holiday Party"],
    "2023-12-25": ["Christmas Day"],
    "2024-01-01": ["New Year's Day"],
    "2024-01-10": ["Doctor's Appointment"],
    "2024-02-14": ["Valentine's Day"],
    "2024-03-08": ["International Women's Day"],
    "2024-03-20": ["Spring Equinox"],
    "2024-04-22": ["Earth Day"],
    "2024-05-01": ["May Day"],
    "2024-06-21": ["Summer Solstice"],
    "2024-07-04": ["Independence Day (US)"],
    "2024-08-15": ["Assumption Day"],
    "2024-09-02": ["Labor Day (US)"],
    "2024-09-22": ["Autumn Equinox"],
    "2024-10-31": ["Halloween"],
    "2024-11-28": ["Thanksgiving (US)"],
    "2024-12-21": ["Winter Solstice"],
};

// --- Helper Functions ---

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
}

function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Calendar Rendering ---

function renderCalendar() {
    calendarDays.innerHTML = ''; // Clear previous days

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed (0 for Jan, 11 for Dec)
    const today = new Date(); // To highlight today's date

    // Update month and year display
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[month]} ${year}`;

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeek = getFirstDayOfMonth(year, month);

    // Add empty divs for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('empty-day');
        calendarDays.appendChild(emptyDay);
    }

    // Add actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.textContent = i;

        const currentDayDate = new Date(year, month, i);

        // Highlight today's date
        if (currentDayDate.getDate() === today.getDate() &&
            currentDayDate.getMonth() === today.getMonth() &&
            currentDayDate.getFullYear() === today.getFullYear()) {
            dayElement.classList.add('today');
        }

        // Add events
        const eventKey = formatDateKey(currentDayDate);
        if (events[eventKey]) {
            dayElement.classList.add('has-event');
            const eventList = document.createElement('ul');
            eventList.classList.add('event-list');
            events[eventKey].forEach(eventText => {
                const eventItem = document.createElement('li');
                eventItem.textContent = eventText;
                eventList.appendChild(eventItem);
            });
            dayElement.appendChild(eventList);
        }

        calendarDays.appendChild(dayElement);
    }
}

// --- Navigation Functions ---

function goToPrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function goToNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// --- Event Listeners ---

prevMonthBtn.addEventListener('click', goToPrevMonth);
nextMonthBtn.addEventListener('click', goToNextMonth);

// --- Initialization ---

renderCalendar();
