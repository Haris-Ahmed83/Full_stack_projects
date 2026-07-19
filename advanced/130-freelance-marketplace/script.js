document.addEventListener('DOMContentLoaded', () => {
    // --- In-memory Data Store (Sample Data) ---
    let currentProjectId = 3; // To generate unique IDs for new projects
    let currentBidId = 3;     // To generate unique IDs for new bids

    let users = [
        { id: 'user1', name: 'Alice Smith', email: 'alice@example.com', skills: ['Web Design', 'UI/UX', 'Figma'], bio: 'Experienced UI/UX designer with a passion for creating intuitive and beautiful digital experiences.' },
        { id: 'user2', name: 'Bob Johnson', email: 'bob@example.com', skills: ['JavaScript', 'React', 'Node.js', 'APIs'], bio: 'Full-stack developer specializing in modern web applications. Ready to bring your ideas to life.' },
        { id: 'user3', name: 'Charlie Brown', email: 'charlie@example.com', skills: ['Content Writing', 'SEO', 'Copywriting'], bio: 'Creative content writer focused on engaging narratives and effective communication.' }
    ];

    let projects = [
        {
            id: 'proj1',
            title: 'Build a Responsive E-commerce Website',
            description: 'We need a skilled web developer to create a responsive e-commerce website for our new clothing brand. The site should include product listings, a shopping cart, and a secure checkout process. Experience with Stripe integration is a plus.',
            budget: 2500,
            postedBy: 'user1', // Posted by Alice Smith
            postedDate: '2023-10-26',
            skillsRequired: ['HTML', 'CSS', 'JavaScript', 'E-commerce Platforms'],
            status: 'open',
            bids: [
                { id: 'bid1', bidderId: 'user2', amount: 2200, message: 'I have extensive experience with e-commerce platforms and can deliver a high-quality, responsive site. I specialize in React and Node.js for backend.', bidDate: '2023-10-27' }
            ]
        },
        {
            id: 'proj2',
            title: 'Logo Design for a Tech Startup',
            description: 'Our new tech startup requires a modern and minimalist logo. We are looking for a creative graphic designer who can provide several concepts and refine the chosen one.',
            budget: 500,
            postedBy: 'user2', // Posted by Bob Johnson
            postedDate: '2023-10-25',
            skillsRequired: ['Graphic Design', 'Logo Design', 'Adobe Illustrator'],
            status: 'open',
            bids: [
                { id: 'bid2', bidderId: 'user1', amount: 450, message: 'As a UI/UX designer, I also have a strong background in branding and logo creation. I can offer fresh, innovative designs tailored to your startup.', bidDate: '2023-10-26' }
            ]
        },
        {
            id: 'proj3',
            title: 'SEO-Optimized Blog Content',
            description: 'We need 10 SEO-optimized blog posts (around 1000 words each) on various topics related to digital marketing. The content should be engaging, informative, and keyword-rich.',
            budget: 1000,
            postedBy: 'user1', // Posted by Alice Smith
            postedDate: '2023-10-28',
            skillsRequired: ['Content Writing', 'SEO', 'Keyword Research'],
            status: 'open',
            bids: []
        }
    ];

    // Simulate a logged-in user
    const currentUser = users.find(user => user.id === 'user2'); // Bob Johnson is the current user

    // --- DOM Elements ---
    const appContainer = document.getElementById('app-container');
    const navLinks = document.querySelectorAll('.nav-link');
    const brandLink = document.getElementById('brand-link');
    const backButtons = document.querySelectorAll('.back-button');

    const projectsListView = document.getElementById('projects-list-view');
    const projectsListContainer = document.getElementById('projects-list');

    const projectDetailView = document.getElementById('project-detail-view');
    const projectDetailsContainer = document.getElementById('project-details');
    const placeBidForm = document.getElementById('place-bid-form');
    let activeProjectId = null; // Stores the ID of the project currently being viewed

    const postProjectView = document.getElementById('post-project-view');
    const postProjectForm = document.getElementById('post-project-form');

    const myProfileView = document.getElementById('my-profile-view');
    const profileCard = document.getElementById('profile-card');

    const messagesView = document.getElementById('messages-view');

    // --- Helper Functions ---
    function getUserNameById(userId) {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // --- View Management ---
    function switchView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show the target view
        document.getElementById(viewId).classList.add('active');

        // Update active navigation link
        navLinks.forEach(link => {
            if (link.dataset.view === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Scroll to top of the main content area
        appContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // --- Render Functions ---
    function renderProjectsList() {
        projectsListContainer.innerHTML = ''; // Clear previous list
        if (projects.length === 0) {
            projectsListContainer.innerHTML = '<p>No projects available at the moment. Check back later!</p>';
            return;
        }

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.classList.add('project-card');
            projectCard.dataset.projectId = project.id;
            projectCard.innerHTML = `
                <h3>${project.title}</h3>
                <p class="budget">Budget: ${formatCurrency(project.budget)}</p>
                <p class="description-snippet">${project.description}</p>
                <p>Posted by: ${getUserNameById(project.postedBy)}</p>
                <button class="btn btn-primary" data-action="view-details">View Details</button>
            `;
            projectsListContainer.appendChild(projectCard);
        });
    }

    function renderProjectDetails(projectId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) {
            projectDetailsContainer.innerHTML = '<p>Project not found.</p>';
            return;
        }

        activeProjectId = projectId; // Set the currently active project ID

        const bidsHtml = project.bids.length > 0
            ? `<ul class="bids-list">
                ${project.bids.map(bid => `
                    <li>
                        <span><strong>${getUserNameById(bid.bidderId)}</strong> bid ${formatCurrency(bid.amount)}</span>
                        <span>${formatDate(bid.bidDate)}</span>
                        <p>${bid.message}</p>
                    </li>
                `).join('')}
              </ul>`
            : '<p>No bids yet. Be the first to bid!</p>';

        projectDetailsContainer.innerHTML = `
            <h3>${project.title}</h3>
            <p class="meta-info">Posted by ${getUserNameById(project.postedBy)} on ${formatDate(project.postedDate)}</p>
            <p class="project-budget">Budget: ${formatCurrency(project.budget)}</p>
            <p class="project-description">${project.description}</p>
            <p><strong>Skills Required:</strong> ${project.skillsRequired.join(', ')}</p>
            <h4>Bids (${project.bids.length})</h4>
            ${bidsHtml}
        `;
        switchView('project-detail-view');
    }

    function renderMyProfile() {
        if (!currentUser) {
            profileCard.innerHTML = '<p>Please log in to view your profile.</p>';
            return;
        }

        profileCard.innerHTML = `
            <h3>${currentUser.name}</h3>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Bio:</strong> ${currentUser.bio}</p>
            <p><strong>Skills:</strong></p>
            <ul class="skills-list">
                ${currentUser.skills.map(skill => `<li>${skill}</li>`).join('')}
            </ul>
            <h4>Your Posted Projects (${projects.filter(p => p.postedBy === currentUser.id).length})</h4>
            <div class="project-grid">
                ${projects.filter(p => p.postedBy === currentUser.id).map(project => `
                    <div class="project-card">
                        <h3>${project.title}</h3>
                        <p class="budget">Budget: ${formatCurrency(project.budget)}</p>
                        <p class="description-snippet">${project.description}</p>
                        <button class="btn btn-primary" data-action="view-details" data-project-id="${project.id}">View Details</button>
                    </div>
                `).join('')}
            </div>
            <h4>Your Bids (${projects.filter(p => p.bids.some(bid => bid.bidderId === currentUser.id)).length})</h4>
            <div class="project-grid">
                ${projects.filter(p => p.bids.some(bid => bid.bidderId === currentUser.id)).map(project => `
                    <div class="project-card">
                        <h3>${project.title}</h3>
                        <p class="budget">Original Budget: ${formatCurrency(project.budget)}</p>
                        <p class="description-snippet">Your bid: ${formatCurrency(project.bids.find(bid => bid.bidderId === currentUser.id).amount)}</p>
                        <button class="btn btn-primary" data-action="view-details" data-project-id="${project.id}">View Details</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // --- Event Handlers ---
    function handleNavigationClick(event) {
        event.preventDefault();
        const viewId = event.target.dataset.view;
        if (viewId) {
            switch (viewId) {
                case 'projects-list-view':
                    renderProjectsList();
                    break;
                case 'my-profile-view':
                    renderMyProfile();
                    break;
                // For 'post-project-view' and 'messages-view', no special rendering needed beyond switching
            }
            switchView(viewId);
        }
    }

    function handleProjectListClick(event) {
        const viewDetailsBtn = event.target.closest('[data-action="view-details"]');
        if (viewDetailsBtn) {
            // If the button is inside a project card, use its parent's dataset for project ID
            const projectId = viewDetailsBtn.dataset.projectId || event.target.closest('.project-card').dataset.projectId;
            renderProjectDetails(projectId);
        }
    }

    function handlePostProject(event) {
        event.preventDefault();
        const form = event.target;
        const newProject = {
            id: 'proj' + (++currentProjectId),
            title: form.title.value,
            description: form.description.value,
            budget: parseFloat(form.budget.value),
            postedBy: currentUser.id, // Assume current user posts the project
            postedDate: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            skillsRequired: form.skills.value.split(',').map(s => s.trim()).filter(s => s !== ''),
            status: 'open',
            bids: []
        };

        projects.unshift(newProject); // Add to the beginning for visibility
        form.reset();
        alert('Project posted successfully!');
        renderProjectsList();
        switchView('projects-list-view');
    }

    function handlePlaceBid(event) {
        event.preventDefault();
        if (!activeProjectId) return;
        if (!currentUser) {
            alert('You must be logged in to place a bid.');
            return;
        }

        const form = event.target;
        const bidAmount = parseFloat(form.elements['bidAmount'].value);
        const bidMessage = form.elements['bidMessage'].value;

        const project = projects.find(p => p.id === activeProjectId);
        if (project) {
            // Check if current user has already bid
            const existingBid = project.bids.find(bid => bid.bidderId === currentUser.id);
            if (existingBid) {
                if (!confirm('You have already placed a bid on this project. Do you want to update your bid?')) {
                    return;
                }
                // Update existing bid
                existingBid.amount = bidAmount;
                existingBid.message = bidMessage;
                existingBid.bidDate = new Date().toISOString().slice(0, 10);
            } else {
                // Add new bid
                const newBid = {
                    id: 'bid' + (++currentBidId),
                    bidderId: currentUser.id,
                    amount: bidAmount,
                    message: bidMessage,
                    bidDate: new Date().toISOString().slice(0, 10)
                };
                project.bids.push(newBid);
            }

            alert('Bid placed successfully!');
            form.reset();
            renderProjectDetails(activeProjectId); // Re-render details to show new bid
        }
    }

    // --- Initialize Application ---
    function init() {
        // Initial rendering of projects list
        renderProjectsList();

        // Event Listeners for Navigation
        navLinks.forEach(link => {
            link.addEventListener('click', handleNavigationClick);
        });

        // Event Listener for Brand Link (returns to projects list)
        brandLink.addEventListener('click', (event) => {
            event.preventDefault();
            renderProjectsList();
            switchView('projects-list-view');
        });

        // Event Listener for Back buttons
        backButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const targetViewId = event.target.dataset.view;
                if (targetViewId === 'projects-list-view') {
                    renderProjectsList(); // Ensure projects list is fresh
                }
                switchView(targetViewId);
            });
        });

        // Event Listener for clicking on project cards/view details buttons
        projectsListContainer.addEventListener('click', handleProjectListClick);
        // Event listener for view details buttons within the profile view's project lists
        myProfileView.addEventListener('click', handleProjectListClick);

        // Event Listener for Post Project Form submission
        postProjectForm.addEventListener('submit', handlePostProject);

        // Event Listener for Place Bid Form submission
        placeBidForm.addEventListener('submit', handlePlaceBid);
    }

    init();
});
