document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const eventModal = document.getElementById('eventModal');
    const eventForm = document.getElementById('eventForm');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventStartDateInput = document.getElementById('eventStartDate');
    const eventStartTimeInput = document.getElementById('eventStartTime');
    const eventEndDateInput = document.getElementById('eventEndDate');
    const eventEndTimeInput = document.getElementById('eventEndTime');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const saveEventBtn = document.getElementById('saveEventBtn');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    let calendar;
    let currentEventId = null; // Tracks the ID of the event being edited
    let events = []; // In-memory storage for events

    // Helper to load events from localStorage
    function loadEvents() {
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) {
            events = JSON.parse(storedEvents);
        } else {
            // Seed some initial events if none exist
            events = [
                {
                    id: '1',
                    title: 'Team Meeting',
                    start: '2023-10-26T10:00:00',
                    end: '2023-10-26T11:00:00',
                    description: 'Weekly sync up.'
                },
                {
                    id: '2',
                    title: 'Project Deadline',
                    start: '2023-10-28',
                    allDay: true,
                    description: 'Final submission for Project X.'
                }
            ];
            saveEvents();
        }
    }

    // Helper to save events to localStorage
    function saveEvents() {
        localStorage.setItem('events', JSON.stringify(events));
    }

    // Opens the modal for creating or editing an event
    function openModal(event = null, startStr = null, endStr = null) {
        eventForm.reset(); // Clear form fields
        currentEventId = null;
        deleteEventBtn.style.display = 'none'; // Hide delete button by default

        if (event) { // Editing an existing event
            currentEventId = event.id;
            eventTitleInput.value = event.title;
            eventDescriptionInput.value = event.extendedProps.description || '';

            // Handle start date/time
            if (event.start) {
                const startDate = new Date(event.start);
                eventStartDateInput.value = startDate.toISOString().split('T')[0];
                eventStartTimeInput.value = event.allDay ? '' : startDate.toTimeString().split(' ')[0].substring(0, 5);
            }

            // Handle end date/time
            if (event.end) {
                const endDate = new Date(event.end);
                eventEndDateInput.value = endDate.toISOString().split('T')[0];
                eventEndTimeInput.value = event.allDay ? '' : endDate.toTimeString().split(' ')[0].substring(0, 5);
            } else if (event.start && event.allDay) { // For all-day events without an explicit end, set end date to start date
                const startDate = new Date(event.start);
                eventEndDateInput.value = startDate.toISOString().split('T')[0];
            }
            deleteEventBtn.style.display = 'block'; // Show delete button for existing events
        } else if (startStr) { // Creating a new event from a date click
            const startDate = new Date(startStr);
            eventStartDateInput.value = startDate.toISOString().split('T')[0];
            
            // If it's a dateClick for a specific time, populate time fields
            if (startStr.includes('T')) {
                eventStartTimeInput.value = startDate.toTimeString().split(' ')[0].substring(0, 5);
                // Set end time 1 hour after start time by default
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                eventEndDateInput.value = endDate.toISOString().split('T')[0];
                eventEndTimeInput.value = endDate.toTimeString().split(' ')[0].substring(0, 5);
            } else { // All-day click
                eventEndDateInput.value = eventStartDateInput.value; // Default end date same as start
            }
        }
        eventModal.style.display = 'block';
    }

    // Closes the modal
    function closeModal() {
        eventModal.style.display = 'none';
    }

    // Handle saving an event (create or update)
    saveEventBtn.addEventListener('click', function() {
        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();
        const startDate = eventStartDateInput.value;
        const startTime = eventStartTimeInput.value;
        const endDate = eventEndDateInput.value;
        const endTime = eventEndTimeInput.value;

        if (!title || !startDate) {
            alert('Title and Start Date are required.');
            return;
        }

        let startDateTime = startDate;
        let endDateTime = endDate;
        let allDay = false;

        if (startTime) {
            startDateTime += `T${startTime}:00`;
            allDay = false;
        } else {
            allDay = true;
        }

        if (endTime) {
            endDateTime += `T${endTime}:00`;
        } else if (!allDay && !endTime && endDate) { // If it's not all-day and an end date but no end time, default to end of day
             endDateTime += `T23:59:59`;
        } else if (allDay && endDate && endDate !== startDate) { // If all-day event has different start/end dates
            // FullCalendar's allDay end date is exclusive, so we need to add a day to the selected end date
            const exclusiveEndDate = new Date(endDate);
            exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);
            endDateTime = exclusiveEndDate.toISOString().split('T')[0];
        } else if (allDay && endDate === startDate) {
             // For all-day events ending on the same day, FullCalendar doesn't need an end date or treats it as start date + 1
             endDateTime = undefined; // Let FullCalendar handle it or set it to start date + 1 internally
        }

        if (new Date(startDateTime) > new Date(endDateTime) && !allDay) {
            alert('End date/time cannot be before start date/time.');
            return;
        }

        if (currentEventId) {
            // Update existing event
            const eventIndex = events.findIndex(e => e.id === currentEventId);
            if (eventIndex > -1) {
                events[eventIndex] = {
                    ...events[eventIndex],
                    title: title,
                    start: startDateTime,
                    end: endDateTime,
                    allDay: allDay,
                    description: description
                };
                const calendarEvent = calendar.getEventById(currentEventId);
                if (calendarEvent) {
                    calendarEvent.setProp('title', title);
                    calendarEvent.setDates(startDateTime, endDateTime);
                    calendarEvent.setAllDay(allDay);
                    calendarEvent.setExtendedProp('description', description);
                }
            }
        } else {
            // Create new event
            const newEvent = {
                id: String(Date.now()), // Simple unique ID
                title: title,
                start: startDateTime,
