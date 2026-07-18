// Google Maps API Key placeholder - REPLACE WITH YOUR ACTUAL KEY
// You can get one from: https://developers.google.com/maps/documentation/javascript/get-started
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// --- Global Variables --- 
let map; // Google Map instance
let directionsService; // Service for calculating directions
let directionsRenderer; // Service for displaying directions on map
let autocompletePickup; // Autocomplete for pickup location input
let autocompleteDestination; // Autocomplete for destination input
let currentRoute = null; // Stores the calculated route details from DirectionsService
let carMarker = null; // Marker for the simulated car on the map
let trackingInterval = null; // Interval ID for car movement simulation
let currentRide = null; // Object to store details of the active ride

// --- DOM Elements --- 
const pickupInput = document.getElementById('pickup-location');
const destinationInput = document.getElementById('destination');
const findRideBtn = document.getElementById('find-ride-btn');
const bookRideBtn = document.getElementById('book-ride-btn');
const cancelRideBtn = document.getElementById('cancel-ride-btn');
const rideStatus = document.getElementById('ride-status');
const distanceSpan = document.getElementById('distance');
const durationSpan = document.getElementById('duration');
const fareSpan = document.getElementById('fare');
const rideHistoryList = document.getElementById('ride-history-list');

// --- Constants for Fare Calculation --- 
const BASE_FARE = 2.50; // Base fare in USD
const PER_KM_RATE = 1.20; // Rate per kilometer in USD
const PER_MIN_RATE = 0.20; // Rate per minute in USD (for duration)
const CAR_ICON = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Simple arrow for car marker
    scale: 5,
    strokeColor: 'white',
    fillColor: '#007bff', // Blue car
    fillOpacity: 1,
    rotation: 0 // Will be updated during tracking
};

// --- Google Maps Initialization (called by API script) --- 
function initMap() {
    // Initialize map centered on a default location (e.g., San Francisco)
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.7749, lng: -122.4194 }, // San Francisco coordinates
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ 
        map: map, 
        polylineOptions: { strokeColor: '#4A90E2', strokeWeight: 5 } // Custom route line style
    });

    // Initialize Autocomplete for pickup and destination inputs
    autocompletePickup = new google.maps.places.Autocomplete(pickupInput, {
        fields: ["place_id", "geometry", "name", "formatted_address"]
    });
    autocompleteDestination = new google.maps.places.places.Autocomplete(destinationInput, {
        fields: ["place_id", "geometry", "name", "formatted_address"]
    });

    // Add event listeners for autocomplete place changes to reset UI
    autocompletePickup.addListener('place_changed', resetUIOnInput);
    autocompleteDestination.addListener('place_changed', resetUIOnInput);

    // Load and display ride history on map load
    displayRideHistory();
}

/**
 * Resets parts of the UI when pickup or destination input changes.
 */
function resetUIOnInput() {
    rideStatus.textContent = ''; // Clear status message
    bookRideBtn.disabled = true; // Disable book button
    directionsRenderer.setDirections({ routes: [] }); // Clear previous route from map
    if (carMarker) carMarker.setMap(null); // Clear car marker
    resetRideDetails(); // Clear ride details display
}

// --- Event Listeners --- 
findRideBtn.addEventListener('click', findRide);
bookRideBtn.addEventListener('click', bookRide);
cancelRideBtn.addEventListener('click', cancelRide);

// --- Functions --- 

/**
 * Finds a ride by calculating the route between pickup and destination using Google Directions Service.
 */
async function findRide() {
    const origin = pickupInput.value;
    const destination = destinationInput.value;

    if (!origin || !destination) {
        rideStatus.textContent = 'Please enter both pickup and destination.';
        return;
    }

    // Disable buttons and update status during calculation
    findRideBtn.disabled = true;
    findRideBtn.textContent = 'Finding Ride...';
    rideStatus.textContent = 'Calculating route...';
    bookRideBtn.disabled = true; 
    cancelRideBtn.classList.add('hidden');

    try {
        const request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING // Specify travel mode for car rides
        };

        const response = await directionsService.route(request); // Make the directions request
        if (response.status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response); // Display route on map
            currentRoute = response.routes[0]; // Store the first (most relevant) route

            // Extract distance and duration from the route's first leg
            const leg = currentRoute.legs[0];
            const distance = leg.distance.text;
            const duration = leg.duration.text;
            const distanceInKm = leg.distance.value / 1000; // Convert meters to km
            const durationInMinutes = leg.duration.value / 60; // Convert seconds to minutes

            // Calculate fare and update UI
            const fare = calculateFare(distanceInKm, durationInMinutes);
            distanceSpan.textContent = distance;
            durationSpan.textContent = duration;
            fareSpan.textContent = `$${fare.toFixed(2)}`;
            rideStatus.textContent = 'Route found. Ready to book!';
            bookRideBtn.disabled = false; // Enable book button as route is found
        } else {
            rideStatus.textContent = `Error finding route: ${response.status}. Please try again.`;
            console.error('Directions request failed:', response.status);
            resetRideDetails(); // Clear details if route not found
        }
    } catch (error) {
        rideStatus.textContent = 'Error finding route. Please check inputs and try again.';
        console.error('Error during directions service:', error);
        resetRideDetails();
    } finally {
        findRideBtn.disabled = false;
        findRideBtn.textContent = 'Find Ride';
    }
}

/**
 * Calculates the estimated fare based on distance and duration.
 * @param {number} distanceInKm - Distance in kilometers.
 * @param {number} durationInMinutes - Duration in minutes.
 * @returns {number} The calculated fare.
 */
function calculateFare(distanceInKm, durationInMinutes) {
    return BASE_FARE + (distanceInKm * PER_KM_RATE) + (durationInMinutes * PER_MIN_RATE);
}

/**
 * Resets the ride details displayed in the UI to default 'N/A' values.
 */
function resetRideDetails() {
    distanceSpan.textContent = 'N/A';
    durationSpan.textContent = 'N/A';
    fareSpan.textContent = 'N/A';
    bookRideBtn.disabled = true;
    currentRoute = null;
    if (carMarker) {
        carMarker.setMap(null);
        carMarker = null;
    }
    clearInterval(trackingInterval); // Clear any active tracking
    trackingInterval = null;
    currentRide = null;
    cancelRideBtn.classList.add('hidden');
    rideStatus.textContent = '';
}

/**
 * Books the ride, simulates car tracking, and saves to history upon completion.
 */
function bookRide() {
    if (!currentRoute) {
        rideStatus.textContent = 'Please find a ride first.';
        return;
    }

    // Disable inputs and booking buttons during an active ride
    findRideBtn.disabled = true;
    bookRideBtn.disabled = true;
    pickupInput.disabled = true;
    destinationInput.disabled = true;

    rideStatus.textContent = 'Ride booked! Driver is on the way...';
    cancelRideBtn.classList.remove('hidden'); // Show cancel button

    // Store current ride details for history
    const leg = currentRoute.legs[0];
    currentRide = {
        pickup: leg.start_address,
        destination: leg.end_address,
        distance: leg.distance.text,
        duration: leg.duration.text,
        fare: fareSpan.textContent, // Use the formatted fare string
        timestamp: new Date().toISOString(),
        status: 'In Progress'
    };

    // Initialize car marker at the start of the route
    const path = currentRoute.overview_path; // Simplified path for tracking
    carMarker = new google.maps.Marker({
        position: path[0], 
        map: map,
        icon: CAR_ICON,
        title: 'Your Ride'
    });

    let step = 0;
    const totalSteps = path.length;
    const intervalTime = 500; // Update car position every 0.5 seconds (simulated 'real-time')

    // Simulate car movement along the route
    trackingInterval = setInterval(() => {
        if (step < totalSteps) {
            const currentPosition = path[step];
            const nextPosition = path[step + 1] || currentPosition; // Handle end of path
            
            // Calculate rotation for car icon to face direction of travel
            const heading = google.maps.geometry.spherical.computeHeading(
                currentPosition,
                nextPosition
            );
            carMarker.setIcon({ ...CAR_ICON, rotation: heading });

            carMarker.setPosition(currentPosition);
            map.panTo(currentPosition); // Keep the car marker centered on the map
            step++;

            // Update ride status periodically
            if (step === Math.floor(totalSteps * 0.25)) {
                rideStatus.textContent = 'Driver is nearby!';
            } else if (step === Math.floor(totalSteps * 0.75)) {
                rideStatus.textContent = 'Driver is almost at destination!';
            }
        } else {
            // Ride completed
            clearInterval(trackingInterval);
            trackingInterval = null;
            rideStatus.textContent = 'Ride completed! Thank you.';
            carMarker.setMap(null); // Remove car marker from map
            currentRide.status = 'Completed';
            saveRideToHistory(currentRide); // Save completed ride to history
            resetAfterRide(); // Reset UI for next ride booking
        }
    }, intervalTime);
}

/**
 * Cancels the currently active ride.
 */
function cancelRide() {
    if (trackingInterval) {
        clearInterval(trackingInterval);
        trackingInterval = null;
    }
    if (carMarker) {
        carMarker.setMap(null);
        carMarker = null;
    }

    rideStatus.textContent = 'Ride cancelled.';
    if (currentRide) {
        currentRide.status = 'Cancelled';
        saveRideToHistory(currentRide); // Save cancelled ride to history
    }
    resetAfterRide();
}

/**
 * Resets UI elements after a ride (completed or cancelled) to allow new bookings.
 */
function resetAfterRide() {
    findRideBtn.disabled = false;
    bookRideBtn.disabled = true; // Book button should be disabled until a new route is found
    pickupInput.disabled = false;
    destinationInput.disabled = false;
    pickupInput.value = ''; // Clear input fields
    destinationInput.value = '';
    directionsRenderer.setDirections({ routes: [] }); // Clear route from map
    cancelRideBtn.classList.add('hidden');
    resetRideDetails(); // Clear ride details and status
}

/**
 * Loads ride history from localStorage.
 * @returns {Array} An array of ride objects, or an empty array if none found/error.
 */
function loadRideHistory() {
    try {
        const history = localStorage.getItem('rideHistory');
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error('Error loading ride history from localStorage', e);
        return [];
    }
}

/**
 * Saves a ride object to localStorage and updates the displayed history.
 * @param {object} ride - The ride object to save.
 */
function saveRideToHistory(ride) {
    const history = loadRideHistory();
    history.unshift(ride); // Add new ride to the beginning of the array
    localStorage.setItem('rideHistory', JSON.stringify(history));
    displayRideHistory(); // Re-render history list in the UI
}

/**
 * Displays the ride history in the UI by populating the #ride-history-list.
 */
function displayRideHistory() {
    const history = loadRideHistory();
    rideHistoryList.innerHTML = ''; // Clear existing list items

    if (history.length === 0) {
        rideHistoryList.innerHTML = '<li>No ride history yet.</li>';
        return;
    }

    history.forEach(ride => {
        const listItem = document.createElement('li');
        const date = new Date(ride.timestamp).toLocaleString();
        listItem.innerHTML = `
            <strong>${ride.pickup}</strong> to <strong>${ride.destination}</strong><br>
            Distance: ${ride.distance}, Duration: ${ride.duration}<br>
            Fare: ${ride.fare} | Status: <span class="status-${ride.status.toLowerCase().replace(' ', '-')}">${ride.status}</span><br>
            <small>${date}</small>
        `;
        rideHistoryList.appendChild(listItem);
    });
}

// Initial check for Google Maps API key and history display when script loads
document.addEventListener('DOMContentLoaded', () => {
    if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' || GOOGLE_MAPS_API_KEY === '') {
        alert('WARNING: Google Maps API key is not set in script.js. Please replace "YOUR_GOOGLE_MAPS_API_KEY" with your actual key to enable map functionality.');
    }
    // initMap is called automatically by the Google Maps script with the 'callback=initMap' parameter
    // We ensure history is displayed here, though initMap also calls it for redundancy.
    displayRideHistory();
});
