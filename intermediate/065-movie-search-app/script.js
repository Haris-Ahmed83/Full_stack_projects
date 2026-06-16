const searchInput = document.getElementById('searchInput');
const movieGrid = document.getElementById('movieGrid');

// Replace 'YOUR_OMDB_API_KEY' with your actual OMDB API Key.
// You can get one for free from http://www.omdbapi.com/apikey.aspx
const OMDB_API_KEY = 'YOUR_OMDB_API_KEY';

// Debounce function to limit how often a function is called
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

// Function to fetch movies from OMDB API
const fetchMovies = async (searchTerm) => {
    if (!searchTerm) {
        return []; // Return empty array if search term is empty
    }
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${searchTerm}&apikey=${OMDB_API_KEY}`);
        const data = await response.json();
        if (data.Response === 'True') {
            return data.Search; // Return the array of movies
        } else {
            return []; // No movies found or error
        }
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
};

// Function to display movies in the grid
const displayMovies = (movies) => {
    movieGrid.innerHTML = ''; // Clear previous results

    if (movies.length === 0) {
        movieGrid.innerHTML = '<p class="no-results">No movies found. Try another search term!</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        // Use a placeholder image if the poster is not available
        const posterUrl = movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster';

        movieCard.innerHTML = `
            <img src="${posterUrl}" alt="${movie.Title} Poster">
            <div class="movie-info">
                <h3>${movie.Title}</h3>
                <p>Year: ${movie.Year}</p>
            </div>
        `;
        movieGrid.appendChild(movieCard);
    });
};

// Main search handler function
const handleSearch = async (event) => {
    const searchTerm = event.target.value.trim();

    // Only search if the term has at least 2 characters
    if (searchTerm.length >= 2) {
        const movies = await fetchMovies(searchTerm);
        displayMovies(movies);
    } else {
        // Clear results or show initial message if search term is too short
        movieGrid.innerHTML = '<p class="initial-message">Start typing to search for movies!</p>';
    }
};

// Attach the debounced search handler to the search input
// The search will be triggered 500ms after the user stops typing
searchInput.addEventListener('input', debounce(handleSearch, 500));

// Initial message when the app loads
movieGrid.innerHTML = '<p class="initial-message">Start typing to search for movies!</p>';

// Optional: Clear results when input is empty after typing and user clicks out
searchInput.addEventListener('blur', () => {
    if (searchInput.value.trim() === '') {
        movieGrid.innerHTML = '<p class="initial-message">Start typing to search for movies!</p>';
    }
});
