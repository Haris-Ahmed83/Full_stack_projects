document.addEventListener('DOMContentLoaded', () => {
    // DOM element references
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const recipeGrid = document.getElementById('recipeGrid');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // TheMealDB API base URL for searching meals by name
    const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

    /**
     * Displays a specific message element and hides others.
     * @param {HTMLElement} elementToShow - The message element to display.
     */
    const showMessage = (elementToShow) => {
        [loadingMessage, errorMessage, noResultsMessage].forEach(msg => {
            msg.classList.add('hidden'); // Hide all messages initially
        });
        if (elementToShow) {
            elementToShow.classList.remove('hidden'); // Show the specified message
        }
    };

    /**
     * Fetches recipes from TheMealDB API based on the search query.
     * @param {string} query - The search term for recipes.
     */
    const fetchRecipes = async (query) => {
        recipeGrid.innerHTML = ''; // Clear previous recipes
        showMessage(loadingMessage); // Show loading indicator

        try {
            const response = await fetch(`${API_BASE_URL}${query}`);
            if (!response.ok) {
                // If response is not OK (e.g., 404, 500), throw an error
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Check if meals array exists and has items
            if (data.meals && data.meals.length > 0) {
                displayRecipes(data.meals); // Display fetched recipes
                showMessage(null); // Hide all messages
            } else {
                showMessage(noResultsMessage); // Show no results message
            }
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
            errorMessage.textContent = `Failed to load recipes: ${error.message}. Please try again later.`;
            showMessage(errorMessage); // Show error message
        } finally {
            // The finally block ensures loading message is hidden regardless of success or failure
            if (!loadingMessage.classList.contains('hidden')) {
                 loadingMessage.classList.add('hidden');
            }
        }
    };

    /**
     * Creates and displays recipe cards in the DOM.
     * @param {Array<Object>} recipes - An array of recipe objects.
     */
    const displayRecipes = (recipes) => {
        recipeGrid.innerHTML = ''; // Clear existing cards

        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.classList.add('recipe-card');

            // Populate card with recipe data
            card.innerHTML = `
                <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
                <div class="card-content">
                    <h3>${recipe.strMeal}</h3>
                    <p>Category: ${recipe.strCategory || 'N/A'}</p>
                    <p>Area: ${recipe.strArea || 'N/A'}</p>
                    <button class="view-details-btn" data-id="${recipe.idMeal}">View Details</button>
                </div>
            `;
            recipeGrid.appendChild(card);
        });

        // Add event listeners to all 'View Details' buttons
        recipeGrid.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const mealId = event.target.dataset.id;
                const selectedRecipe = recipes.find(r => r.idMeal === mealId);

                // Open external source or YouTube link if available, otherwise alert.
                if (selectedRecipe && selectedRecipe.strSource) {
                    window.open(selectedRecipe.strSource, '_blank');
                } else if (selectedRecipe && selectedRecipe.strYoutube) {
                    window.open(selectedRecipe.strYoutube, '_blank');
                } else {
                    alert('No external source or YouTube link available for this recipe.');
                }
            });
        });
    };

    /**
     * Handles the search action when the button is clicked or Enter is pressed.
     */
    const handleSearch = () => {
        const query = searchInput.value.trim(); // Get search input value and remove whitespace
        if (query) {
            fetchRecipes(query); // Fetch recipes if query is not empty
        } else {
            // Optionally, clear results or show a message if search is empty
            recipeGrid.innerHTML = '';
            showMessage(noResultsMessage); // Indicate that no search term was entered
            noResultsMessage.textContent = 'Please enter a recipe name to search.';
        }
    };

    // Event listeners for search functionality
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleSearch(); // Trigger search on Enter key press
        }
    });

    // Initial load: Fetch some default recipes when the page loads
    fetchRecipes('chicken');
});
