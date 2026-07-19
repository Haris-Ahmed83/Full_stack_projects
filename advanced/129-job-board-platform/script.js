// Constants and DOM elements
const jobListingsEl = document.getElementById('job-listings');
const searchFormEl = document.getElementById('search-form');
const keywordsInput = document.getElementById('keywords');
const locationInput = document.getElementById('location');
const categorySelect = document.getElementById('category');
const paginationEl = document.getElementById('pagination');
const applyModalEl = document.getElementById('apply-modal');
const closeApplyModalBtn = document.getElementById('close-apply-modal');
const applicationFormEl = document.getElementById('application-form');
const jobIdField = document.getElementById('job-id-field');

// Application state
let currentSearchParams = {
    keywords: '',
    location: '',
    category: '',
    page: 1,
    limit: 10 // Items per page
};

// --- API Functions ---
async function fetchJobs(params) {
    const query = new URLSearchParams(params).toString();
    try {
        const response = await fetch(`/api/jobs?${query}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // { jobs: [], totalPages: 5, currentPage: 1 }
    } catch (error) {
        console.error('Error fetching jobs:', error);
        jobListingsEl.innerHTML = '<p class="text-red-500">Failed to load job listings. Please try again later.</p>';
        return { jobs: [], totalPages: 0, currentPage: 1 };
    }
}

async function applyToJob(jobId, applicationData) {
    try {
        const response = await fetch(`/api/jobs/${jobId}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization header if authentication is required for applying
                // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(applicationData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error applying to job:', error);
        alert(`Failed to submit application: ${error.message}`);
        return null;
    }
}

// --- UI Rendering Functions ---
function renderJobs(jobs) {
    jobListingsEl.innerHTML = ''; // Clear previous listings
    if (jobs.length === 0) {
        jobListingsEl.innerHTML = '<p class="text-center text-gray-600">No jobs found matching your criteria.</p>';
        return;
    }

    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'bg-white shadow-md rounded-lg p-6 mb-4 border border-gray-200';
        jobCard.innerHTML = `
            <h2 class="text-2xl font-bold text-gray-800 mb-2">${job.title}</h2>
            <p class="text-gray-600 mb-1">${job.company} - ${job.location}</p>
            <p class="text-gray-700 text-sm mb-3">${job.description.substring(0, 150)}...</p>
            <div class="flex items-center justify-between">
                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">${job.category}</span>
                <button class="apply-btn bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-300" data-job-id="${job._id}">Apply Now</button>
            </div>
        `;
        jobListingsEl.appendChild(jobCard);
    });

    // Attach event listeners to new apply buttons
    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const jobId = event.target.dataset.jobId;
            openApplyModal(jobId);
        });
    });
}

function renderPagination(totalPages, currentPage) {
    paginationEl.innerHTML = ''; // Clear previous pagination
    if (totalPages <= 1) return;

    const maxPagesToShow = 5; // e.g., 2 before, current, 2 after

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
        paginationEl.appendChild(createPaginationLink(1, '&laquo; First'));
        if (startPage > 2) paginationEl.appendChild(createPaginationLink(currentPage - 1, '&lsaquo; Prev'));
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationEl.appendChild(createPaginationLink(i, i, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) paginationEl.appendChild(createPaginationLink(currentPage + 1, 'Next &rsaquo;'));
        paginationEl.appendChild(createPaginationLink(totalPages, 'Last &raquo;'));
    }
}

function createPaginationLink(pageNumber, text, isActive = false) {
    const li = document.createElement('li');
    li.className = 'inline-block mx-1';
    const link = document.createElement('a');
    link.href = '#';
    link.dataset.page = pageNumber;
    link.innerHTML = text;
    link.className = `py-2 px-3 leading-tight border rounded hover:bg-gray-200 transition duration-300 ${
        isActive ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border-gray-300'
    }`;
    li.appendChild(link);
    return li;
}

function openApplyModal(jobId) {
    jobIdField.value = jobId;
    applyModalEl.style.display = 'block';
    document.body.classList.add('overflow-hidden'); // Prevent background scrolling
}

function closeApplyModal() {
    applyModalEl.style.display = 'none';
    document.body.classList.remove('overflow-hidden');
    applicationFormEl.reset(); // Clear form fields
}

// --- Event Handlers ---
async function handleSearch(event) {
    event.preventDefault();
    currentSearchParams.keywords = keywordsInput.value.trim();
    currentSearchParams.location = locationInput.value.trim();
    currentSearchParams.category = categorySelect.value;
    currentSearchParams.page = 1; // Reset to first page on new search

    await loadJobs();
}

async function handlePaginationClick(event) {
    event.preventDefault();
    const target = event.target.closest('a');
    if (target && target.dataset.page) {
        const newPage = parseInt(target.dataset.page);
        if (newPage !== currentSearchParams.page) {
            currentSearchParams.page = newPage;
            await loadJobs();
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        }
    }
}

async function handleApplicationSubmit(event) {
    event.preventDefault();
    const jobId = jobIdField.value;
    const formData = new FormData(applicationFormEl);
    const applicationData = Object.fromEntries(formData.entries());

    // Basic client-side validation
    if (!applicationData.name || !applicationData.email || !applicationData.coverLetter) {
        alert('Please fill in all required fields.');
        return;
    }

    const result = await applyToJob(jobId, applicationData);
    if (result) {
        alert('Application submitted successfully!');
        closeApplyModal();
    }
    // Error message handled by applyToJob function
}


// --- Initialization ---
async function loadJobs() {
    jobListingsEl.innerHTML = '<p class="text-center text-gray-600">Loading jobs...</p>';
    paginationEl.innerHTML = ''; // Clear pagination during load

    const data = await fetchJobs(currentSearchParams);
    renderJobs(data.jobs);
    renderPagination(data.totalPages, data.currentPage);
}

function init() {
    // Populate categories (example, could be fetched from API)
    const categories = ['Software Engineering', 'Marketing', 'Sales', 'Design', 'Finance', 'Human Resources'];
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categorySelect.appendChild(option);
    });

    // Event Listeners
    searchFormEl.addEventListener('submit', handleSearch);
    paginationEl.addEventListener('click', handlePaginationClick);
    closeApplyModalBtn.addEventListener('click', closeApplyModal);
    applyModalEl.addEventListener('click', (event) => { // Close modal when clicking outside form
        if (event.target === applyModalEl) {
            closeApplyModal();
        }
    });
    applicationFormEl.addEventListener('submit', handleApplicationSubmit);

    // Initial load of jobs
    loadJobs();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);
