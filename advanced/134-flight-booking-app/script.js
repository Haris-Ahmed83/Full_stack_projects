document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements --- //
    const sections = {
        search: document.getElementById('search-section'),
        results: document.getElementById('results-section'),
        seatSelection: document.getElementById('seat-selection-section'),
        bookingSummary: document.getElementById('booking-summary-section'),
        confirmation: document.getElementById('confirmation-section'),
    };

    const searchForm = document.getElementById('flight-search-form');
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    const departureDateInput = document.getElementById('departure-date');
    const returnDateInput = document.getElementById('return-date');
    const passengersInput = document.getElementById('passengers');

    const flightResultsList = document.getElementById('flight-results-list');
    const sortBySelect = document.getElementById('sort-by');
    const nonStopFilter = document.getElementById('non-stop-filter');
    const backToSearchBtn = document.getElementById('back-to-search');

    const selectedFlightDetailsDiv = document.getElementById('selected-flight-details');
    const seatMapDiv = document.getElementById('seat-map');
    const selectedSeatInfoDisplay = document.getElementById('selected-seat-info-display');
    const confirmSeatSelectionBtn = document.getElementById('confirm-seat-selection');
    const backToResultsBtn = document.getElementById('back-to-results');

    const bookingDetailsDiv = document.getElementById('booking-details');
    const confirmBookingBtn = document.getElementById('confirm-booking');
    const backToSeatSelectionBtn = document.getElementById('back-to-seat-selection');

    const startNewSearchBtn = document.getElementById('start-new-search');

    // --- App State --- //
    let currentView = 'search';
    let searchResults = [];
    let selectedFlight = null;
    let selectedSeat = null;
    let numPassengers = 1;
    let bookingDetails = {};

    // --- Sample Data --- //
    const flightsData = [
        { id: 'FL001', airline: 'AirSwift', origin: 'JFK', destination: 'LAX', departure: '2023-12-25T08:00:00', arrival: '2023-12-25T11:30:00', durationMinutes: 210, stops: 0, price: 250, date: '2023-12-25' },
        { id: 'FL002', airline: 'United', origin: 'JFK', destination: 'LAX', departure: '2023-12-25T10:00:00', arrival: '2023-12-25T15:00:00', durationMinutes: 300, stops: 1, price: 220, date: '2023-12-25' },
        { id: 'FL003', airline: 'Delta', origin: 'JFK', destination: 'LAX', departure: '2023-12-25T14:00:00', arrival: '2023-12-25T17:30:00', durationMinutes: 210, stops: 0, price: 280, date: '2023-12-25' },
        { id: 'FL004', airline: 'AirSwift', origin: 'JFK', destination: 'LAX', departure: '2023-12-26T09:00:00', arrival: '2023-12-26T12:30:00', durationMinutes: 210, stops: 0, price: 260, date: '2023-12-26' },
        { id: 'FL005', airline: 'United', origin: 'LAX', destination: 'JFK', departure: '2023-12-25T18:00:00', arrival: '2023-12-25T23:00:00', durationMinutes: 300, stops: 0, price: 270, date: '2023-12-25' },
        { id: 'FL006', airline: 'Delta', origin: 'LAX', destination: 'SFO', departure: '2023-12-27T07:00:00', arrival: '2023-12-27T08:30:00', durationMinutes: 90, stops: 0, price: 120, date: '2023-12-27' },
        { id: 'FL007', airline: 'AirSwift', origin: 'JFK', destination: 'LAX', departure: '2023-12-25T16:00:00', arrival: '2023-12-25T19:30:00', durationMinutes: 210, stops: 0, price: 240, date: '2023-12-25' },
        { id: 'FL008', airline: 'United', origin: 'JFK', destination: 'LAX', departure: '2023-12-25T11:00:00', arrival: '2023-12-25T16:30:00', durationMinutes: 330, stops: 1, price: 210, date: '2023-12-25' },
    ];

    const seatMapRows = 6;
    const seatMapCols = 4; // A, B, C, D
    const occupiedSeatsLabels = new Set(['A2', 'C3', 'D1', 'F4']); // Example occupied seats

    // --- Utility Functions --- //
    const formatTime = (isoString) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formatDate = (isoString) => new Date(isoString).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formatDuration = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };
    const formatCurrency = (amount) => `$${amount.toFixed(2)}`;

    // --- View Management --- //
    const showSection = (sectionId) => {
        // Hide all sections
        Object.values(sections).forEach(section => section.classList.add('hidden'));
        // Show the target section
        sections[sectionId].classList.remove('hidden');
        currentView = sectionId;
    };

    // --- Search Logic --- //
    const handleSearchSubmit = (event) => {
        event.preventDefault();

        const origin = originInput.value.trim().toUpperCase();
        const destination = destinationInput.value.trim().toUpperCase();
        const departureDate = departureDateInput.value;
        numPassengers = parseInt(passengersInput.value, 10);

        // Basic validation
        if (!origin || !destination || !departureDate || isNaN(numPassengers) || numPassengers < 1) {
            alert('Please fill in all required search fields correctly.');
            return;
        }

        // Filter flights based on criteria
        searchResults = flightsData.filter(flight =>
            flight.origin === origin &&
            flight.destination === destination &&
            flight.date === departureDate
        );

        // If no return date, returnDateInput.value will be empty string
        // For simplicity, we only consider one-way for now. A round trip would involve two searches.

        displayFlights(searchResults);
        showSection('results');
    };

    const displayFlights = (flightsToDisplay) => {
        flightResultsList.innerHTML = ''; // Clear previous results

        if (flightsToDisplay.length === 0) {
            flightResultsList.innerHTML = '<p>No flights found for your search criteria. Try different dates or destinations.</p>';
            return;
        }

        // Apply sorting and filtering before displaying
        const sortedAndFilteredFlights = applyFiltersAndSorting(flightsToDisplay);

        sortedAndFilteredFlights.forEach(flight => {
            const flightCard = document.createElement('div');
            flightCard.classList.add('flight-card');
            flightCard.innerHTML = `
                <div class="flight-card-header">
                    <h3>${flight.airline}</h3>
                    <span class="flight-card-price">${formatCurrency(flight.price * numPassengers)}</span>
                </div>
                <div class="flight-card-details">
                    <p><strong>${formatTime(flight.departure)}</strong> ${flight.origin}</p>
                    <p><strong>${formatTime(flight.arrival)}</strong> ${flight.destination}</p>
                    <p><span>Duration:</span> ${formatDuration(flight.durationMinutes)}</p>
                    <p><span>Stops:</span> ${flight.stops === 0 ? 'Non-stop' : flight.stops}</p>
                </div>
                <div class="flight-card-actions">
                    <button class="btn primary select-flight-btn" data-flight-id="${flight.id}">Select Flight</button>
                </div>
            `;
            flightResultsList.appendChild(flightCard);
        });

        // Attach event listeners to the new select buttons
        flightResultsList.querySelectorAll('.select-flight-btn').forEach(button => {
            button.addEventListener('click', (e) => handleFlightSelection(e.target.dataset.flightId));
        });
    };

    const applyFiltersAndSorting = (flights) => {
        let filtered = [...flights]; // Create a shallow copy to avoid modifying original array

        // Apply non-stop filter
        if (nonStopFilter.checked) {
            filtered = filtered.filter(f => f.stops === 0);
        }

        // Apply sorting
        const sortBy = sortBySelect.value;
        filtered.sort((a, b) => {
            if (sortBy === 'price-asc') {
                return a.price - b.price;
            } else if (sortBy === 'price-desc') {
                return b.price - a.price;
            } else if (sortBy === 'duration-asc') {
                return a.durationMinutes - b.durationMinutes;
            }
            return 0;
        });

        return filtered;
    };

    // --- Flight Selection Logic --- //
    const handleFlightSelection = (flightId) => {
        selectedFlight = flightsData.find(f => f.id === flightId);
        if (selectedFlight) {
            displaySelectedFlightDetails();
            generateSeatMap();
            showSection('seatSelection');
            selectedSeat = null; // Reset selected seat
            selectedSeatInfoDisplay.textContent = 'None';
            confirmSeatSelectionBtn.disabled = true;
        } else {
            alert('Selected flight not found.');
        }
    };

    const displaySelectedFlightDetails = () => {
        if (!selectedFlight) return;
        selectedFlightDetailsDiv.innerHTML = `
            <p><strong>Airline:</strong> ${selectedFlight.airline}</p>
            <p><strong>Route:</strong> ${selectedFlight.origin} to ${selectedFlight.destination}</p>
            <p><strong>Departure:</strong> ${formatDate(selectedFlight.departure)} at ${formatTime(selectedFlight.departure)}</p>
            <p><strong>Passengers:</strong> ${numPassengers}</p>
            <p><strong>Total Price:</strong> ${formatCurrency(selectedFlight.price * numPassengers)}</p>
        `;
    };

    // --- Seat Selection Logic --- //
    const generateSeatMap = () => {
        seatMapDiv.innerHTML = ''; // Clear previous map
        // Create a 2D array representing the seat map with status
        const currentSeatMap = [];
        for (let r = 0; r < seatMapRows; r++) {
            const row = [];
            for (let c = 0; c < seatMapCols; c++) {
                const seatLabel = `${String.fromCharCode(65 + r)}${c + 1}`;
                const status = occupiedSeatsLabels.has(seatLabel) ? 'occupied' : 'available';
                row.push({ label: seatLabel, status: status });
            }
            currentSeatMap.push(row);
        }

        currentSeatMap.forEach(row => {
            row.forEach(seat => {
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat', seat.status);
                seatElement.textContent = seat.label;
                seatElement.dataset.label = seat.label;

                if (seat.status !== 'occupied') {
                    seatElement.addEventListener('click', () => handleSeatClick(seatElement, seat.label));
                }
                seatMapDiv.appendChild(seatElement);
            });
        });
    };

    const handleSeatClick = (clickedSeatElement, label) => {
        // If a seat is already selected, deselect it visually
        const previouslySelected = seatMapDiv.querySelector('.seat.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }

        // If the clicked seat was the one previously selected, deselect it and reset state
        if (selectedSeat === label) {
            selectedSeat = null;
            selectedSeatInfoDisplay.textContent = 'None';
            confirmSeatSelectionBtn.disabled = true;
        } else {
            // Select the new seat
            clickedSeatElement.classList.add('selected');
            selectedSeat = label;
            selectedSeatInfoDisplay.textContent = label;
            confirmSeatSelectionBtn.disabled = false;
        }
    };

    const confirmSeatSelection = () => {
        if (selectedFlight && selectedSeat) {
            bookingDetails = {
                flight: selectedFlight,
                seat: selectedSeat,
                passengers: numPassengers,
                totalPrice: selectedFlight.price * numPassengers,
            };
            displayBookingSummary();
            showSection('bookingSummary');
        } else {
            alert('Please select a flight and a seat.');
        }
    };

    // --- Booking Summary Logic --- //
    const displayBookingSummary = () => {
        if (!bookingDetails.flight) return;

        const flight = bookingDetails.flight;
        bookingDetailsDiv.innerHTML = `
            <div><strong>Flight:</strong> ${flight.airline} ${flight.origin} to ${flight.destination}</div>
            <div><strong>Departure:</strong> ${formatDate(flight.departure)} at ${formatTime(flight.departure)}</div>
            <div><strong>Passengers:</strong> ${bookingDetails.passengers}</div>
            <div><strong>Seat:</strong> ${bookingDetails.seat}</div>
            <div><strong>Total Price:</strong> <span class="price">${formatCurrency(bookingDetails.totalPrice)}</span></div>
        `;
    };

    const confirmBooking = () => {
        // Simulate an API call for booking
        confirmBookingBtn.disabled = true;
        confirmBookingBtn.textContent = 'Booking...';

        setTimeout(() => {
            // In a real app, this would involve sending data to a server
            // and handling success/failure responses.
            // For this simulation, we assume success.

            alert('Booking successful!');
            showSection('confirmation');
            confirmBookingBtn.disabled = false;
            confirmBookingBtn.textContent = 'Confirm Booking';

            // Optionally, mark the booked seat as occupied in our local data for a new search
            occupiedSeatsLabels.add(bookingDetails.seat);

            // Reset relevant state for a new search
            selectedFlight = null;
            selectedSeat = null;
            bookingDetails = {};
            searchResults = [];
            // We don't clear form inputs, but could if desired.

        }, 1500);
    };

    // --- Event Listeners --- //
    searchForm.addEventListener('submit', handleSearchSubmit);
    sortBySelect.addEventListener('change', () => displayFlights(searchResults));
    nonStopFilter.addEventListener('change', () => displayFlights(searchResults));
    backToSearchBtn.addEventListener('click', () => showSection('search'));
    confirmSeatSelectionBtn.addEventListener('click', confirmSeatSelection);
    backToResultsBtn.addEventListener('click', () => showSection('results'));
    confirmBookingBtn.addEventListener('click', confirmBooking);
    backToSeatSelectionBtn.addEventListener('click', () => showSection('seatSelection'));
    startNewSearchBtn.addEventListener('click', () => showSection('search'));

    // --- Initial Setup --- //
    showSection('search'); // Start on the search page

    // Set today's date as min for departure date and pre-fill for easier testing
    const today = new Date();
    departureDateInput.min = today.toISOString().split('T')[0];
    if (!departureDateInput.value) {
        departureDateInput.value = today.toISOString().split('T')[0];
    }
    returnDateInput.min = today.toISOString().split('T')[0];
});
