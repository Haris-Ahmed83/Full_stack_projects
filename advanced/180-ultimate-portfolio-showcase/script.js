document.addEventListener('DOMContentLoaded', () => {
    // Sample project data
    const projects = [
        {
            id: 'p1',
            title: 'E-commerce Storefront',
            description: 'A full-stack e-commerce platform with user authentication, product listings, shopping cart, and checkout process. Built for scalability and user experience.',
            category: 'web-development',
            imageUrl: 'https://via.placeholder.com/400x250/FF5733/FFFFFF?text=E-commerce',
            techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe API'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/e-commerce'
        },
        {
            id: 'p2',
            title: 'Mobile Task Manager',
            description: 'A native mobile application to manage daily tasks, set reminders, and track progress. Features offline capabilities and push notifications.',
            category: 'mobile-app',
            imageUrl: 'https://via.placeholder.com/400x250/2196F3/FFFFFF?text=Task+App',
            techStack: ['React Native', 'Firebase', 'Redux'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/task-manager-mobile'
        },
        {
            id: 'p3',
            title: 'Portfolio Website Redesign',
            description: 'Modernizing an existing portfolio site with a focus on responsive design, accessibility, and a clean, minimalist UI/UX. Implemented using latest CSS features.',
            category: 'ui-ux',
            imageUrl: 'https://via.placeholder.com/400x250/FFC107/333333?text=Portfolio+UI',
            techStack: ['HTML5', 'CSS3', 'JavaScript', 'Figma'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/portfolio-redesign'
        },
        {
            id: 'p4',
            title: 'Customer Feedback Dashboard',
            description: 'A data visualization dashboard to analyze customer feedback from various sources. Utilizes machine learning for sentiment analysis.',
            category: 'data-science',
            imageUrl: 'https://via.placeholder.com/400x250/9C27B0/FFFFFF?text=Dashboard',
            techStack: ['Python', 'Pandas', 'Matplotlib', 'Scikit-learn', 'Streamlit'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/feedback-dashboard'
        },
        {
            id: 'p5',
            title: 'Real-time Chat Application',
            description: 'A web-based chat application supporting real-time messaging, user authentication, and group chats. Built with WebSockets for instant communication.',
            category: 'web-development',
            imageUrl: 'https://via.placeholder.com/400x250/009688/FFFFFF?text=Chat+App',
            techStack: ['Vue.js', 'Socket.IO', 'Express', 'PostgreSQL'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/realtime-chat-app'
        },
        {
            id: 'p6',
            title: 'Fitness Tracker App',
            description: 'A cross-platform mobile application to track workouts, monitor progress, and set fitness goals. Includes data synchronization across devices.',
            category: 'mobile-app',
            imageUrl: 'https://via.placeholder.com/400x250/FF9800/FFFFFF?text=Fitness+Tracker',
            techStack: ['Flutter', 'Dart', 'Firebase Auth', 'Cloud Firestore'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/fitness-tracker'
        },
        {
            id: 'p7',
            title: 'Landing Page Optimization',
            description: 'A/B testing and redesign of a high-traffic landing page to improve conversion rates. Focused on user flow and visual hierarchy.',
            category: 'ui-ux',
            imageUrl: 'https://via.placeholder.com/400x250/607D8B/FFFFFF?text=Landing+Page',
            techStack: ['Google Analytics', 'Hotjar', 'HTML', 'CSS', 'JavaScript'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/landing-page-optimization'
        },
        {
            id: 'p8',
            title: 'Predictive Analytics Model',
            description: 'Developed a machine learning model to predict customer churn for a subscription service, providing insights for retention strategies.',
            category: 'data-science',
            imageUrl: 'https://via.placeholder.com/400x250/795548/FFFFFF?text=Predictive+Model',
            techStack: ['Python', 'Jupyter', 'TensorFlow', 'Keras'],
            liveDemoUrl: '#',
            githubUrl: 'https://github.com/myusername/churn-prediction'
        }
    ];

    // Get DOM elements
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    /**
     * Creates an HTML string for a single project card.
     * @param {object} project - The project data object.
     * @returns {string} - The HTML string for the project card.
     */
    function createProjectCard(project) {
        // Generate tech stack tags HTML
        const techTagsHtml = project.techStack.map(tech => 
            `<span class="tech-tag">${tech}</span>`
        ).join('');

        return `
            <article class="portfolio-card" data-category="${project.category}">
                <img src="${project.imageUrl}" alt="${project.title}" class="portfolio-card-image">
                <div class="card-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="tech-stack">
                        ${techTagsHtml}
                    </div>
                    <div class="card-actions">
                        <a href="${project.liveDemoUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Live Demo</a>
                        <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">GitHub</a>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Renders a list of projects into the portfolio grid.
     * @param {Array<object>} projectsToRender - An array of project objects to display.
     */
    function renderProjects(projectsToRender) {
        portfolioGrid.innerHTML = ''; // Clear existing projects
        if (projectsToRender.length === 0) {
            portfolioGrid.innerHTML = '<p>No projects found for this category.</p>';
            return;
        }
        // Map project data to HTML strings and join them
        const projectsHtml = projectsToRender.map(createProjectCard).join('');
        portfolioGrid.innerHTML = projectsHtml; // Insert into the DOM
    }

    /**
     * Filters the projects based on the given category.
     * @param {string} category - The category to filter by ('all' for no filter).
     * @returns {Array<object>} - An array of filtered project objects.
     */
    function filterProjects(category) {
        if (category === 'all') {
            return projects; // Return all projects if 'all' is selected
        } else {
            // Filter projects where the category matches
            return projects.filter(project => project.category === category);
        }
    }

    /**
     * Sets the active state for the clicked filter button.
     * @param {HTMLElement} clickedButton - The button element that was clicked.
     */
    function setActiveFilterButton(clickedButton) {
        // Remove 'active' class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add 'active' class to the clicked button
        clickedButton.classList.add('active');
    }

    // Add event listeners to filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const selectedCategory = event.target.dataset.category; // Get category from data-attribute
            const filtered = filterProjects(selectedCategory); // Filter projects
            renderProjects(filtered); // Re-render the grid with filtered projects
            setActiveFilterButton(event.target); // Update active button styling
        });
    });

    // Initial render of all projects when the page loads
    renderProjects(projects);
});
