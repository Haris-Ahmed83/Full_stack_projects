const itemsContainer = document.getElementById('items-container');
const paginationContainer = document.getElementById('pagination-container');

// --- Dummy Data (replace with your actual API fetch or data source) ---
const dummyData = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `This is a detailed description for item number ${i + 1}. It provides some context for what each item represents in this pagination example.`
}));

// --- Pagination State ---
let currentPage = 1;
