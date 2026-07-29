document.addEventListener('DOMContentLoaded', () => {
    // --- Dummy Data (Mock API Response) ---
    // This array simulates data fetched from a backend for CI/CD workflows.
    // Each workflow has an ID, name, status, last run timestamp, duration, and detailed steps.
    const workflowsData = [
        {
            id: 'wf-frontend-build',
            name: 'Frontend Web App CI/CD',
            status: 'success',
            lastRun: '2023-10-27T10:30:00Z',
            duration: 180, // seconds
            steps: [
                { name: 'Checkout Code', status: 'success', log: 'Cloned repository branch: main.' },
                { name: 'Install Dependencies', status: 'success', log: 'npm install completed successfully. Found 0 vulnerabilities.' },
                { name: 'Run Unit Tests', status: 'success', log: 'All 150 unit tests passed (100% coverage).' },
                { name: 'Build Production Bundle', status: 'success', log: 'Webpack build completed in 60s. Output: 5.2MB.' },
                { name: 'Deploy to CDN', status: 'success', log: 'Files uploaded to CloudFront S3 bucket. Cache invalidated.' }
            ]
        },
        {
            id: 'wf-backend-api',
            name: 'Backend API Service CI',
            status: 'failure',
            lastRun: '2023-10-27T09:15:00Z',
            duration: 240,
            steps: [
                { name: 'Checkout Code', status: 'success', log: 'Cloned repository branch: develop.' },
                { name: 'Install Python Packages', status: 'success', log: 'pip install -r requirements.txt completed.' },
                { name: 'Run Unit Tests', status: 'success', log: 'All 80 unit tests passed.' },
                { name: 'Run Integration Tests', status: 'failure', log: 'Integration test failed: Database connection error. Check DB logs.' },
                { name: 'Build Docker Image', status: 'pending', log: 'Skipped due to test failure in previous step.' },
                { name: 'Deploy to Kubernetes', status: 'pending', log: 'Skipped due to build failure.' }
            ]
        },
        {
            id: 'wf-db-migrations',
            name: 'Database Migrations & Seed',
            status: 'running',
            lastRun: '2023-10-27T11:00:00Z',
            duration: 90,
            steps: [
                { name: 'Checkout Code', status: 'success', log: 'Cloned repository.' },
                { name: 'Connect to DB', status: 'success', log: 'Successfully connected to PostgreSQL on dev-cluster.' },
                { name: 'Apply Migrations', status: 'running', log: 'Applying migration V1.2.3_Add_Audit_Table... (50% complete)' },
                { name: 'Run Seed Data', status: 'pending', log: 'Waiting for migrations to complete.' }
            ]
        },
        {
            id: 'wf-mobile-app',
            name: 'Mobile App CI (iOS/Android)',
            status: 'pending',
            lastRun: '2023-10-26T18:00:00Z',
            duration: 0,
            steps: [
                { name: 'Checkout Code', status: 'pending', log: 'Waiting to start on build agent.' },
                { name: 'Install Dependencies', status: 'pending', log: 'Will install iOS pods and Android gradle dependencies.' },
                { name: 'Build iOS App', status: 'pending', log: 'Will compile for iOS simulator.' },
                { name: 'Build Android App', status: 'pending', log: 'Will compile for Android emulator.' }
            ]
        },
        {
            id: 'wf-infra-terraform',
            name: 'Infrastructure as Code Deploy',
            status: 'success',
            lastRun: '2023-10-26T14:45:00Z',
            duration: 60,
            steps: [
                { name: 'Checkout Code', status: 'success', log: 'Cloned Terraform configuration.' },
                { name: 'Terraform Plan', status: 'success', log: 'Terraform plan generated: 0 to add, 0 to change, 0 to destroy.' },
                { name: 'Terraform Apply', status: 'success', log: 'Infrastructure is up to date. No changes applied.' }
            ]
        },
        {
            id: 'wf-docs-publish',
            name: 'Documentation Site Publish',
            status: 'success',
            lastRun: '2023-10-25T11:00:00Z',
            duration: 45,
            steps: [
                { name: 'Checkout Docs', status: 'success', log: 'Cloned documentation repository.' },
                { name: 'Generate HTML', status: 'success', log: 'Markdown converted to static HTML pages.' },
                { name: 'Publish to GitHub Pages', status: 'success', log: 'Documentation site updated on gh-pages branch.' }
            ]
        },
        {
            id: 'wf-data-pipeline',
            name: 'Data ETL Pipeline',
            status: 'failure',
            lastRun: '2023-10-27T08:00:00Z',
            duration: 300,
            steps: [
                { name: 'Extract Data', status: 'success', log: 'Extracted 10,000 records from source DB.' },
                { name: 'Transform Data', status: 'failure', log: 'Transformation failed: Invalid data format in row 1234.' },
                { name: 'Load Data', status: 'pending', log: 'Skipped due to transformation failure.' }
            ]
        }
    ];

    // --- DOM Elements ---
    const pipelineSummaryEl = document.getElementById('pipeline-summary');
    const workflowListEl = document.getElementById('workflow-list');
    const workflowDetailsContainerEl = document.getElementById('workflow-details-container');

    let selectedWorkflowId = null; // Keeps track of the currently selected workflow for details view

    // --- Helper Functions ---

    /**
     * Formats a UTC timestamp string into a human-readable local date and time.
     * @param {string} dateString - The ISO 8601 date string (e.g., '2023-10-27T10:30:00Z').
     * @returns {string} Formatted date and time string.
     */
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        return date.toLocaleString(undefined, options);
    }

    /**
     * Formats a duration in seconds into a human-readable string (e.g., '3m 0s').
     * @param {number} seconds - The duration in seconds.
     * @returns {string} Formatted duration string.
     */
    function formatDuration(seconds) {
        if (seconds === 0) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    /**
     * Maps a workflow status string to its corresponding CSS class.
     * @param {string} status - The workflow status (e.g., 'success', 'failure').
     * @returns {string} The CSS class name.
     */
    function getStatusClass(status) {
        return `status-${status.toLowerCase()}`;
    }

    // --- Rendering Functions ---

    /**
     * Renders the pipeline summary cards (Total, Success, Failure, Running, Pending).
     */
    function renderPipelineSummary() {
        const total = workflowsData.length;
        const success = workflowsData.filter(wf => wf.status === 'success').length;
        const failure = workflowsData.filter(wf => wf.status === 'failure').length;
        const running = workflowsData.filter(wf => wf.status === 'running').length;
        const pending = workflowsData.filter(wf => wf.status === 'pending').length;

        pipelineSummaryEl.innerHTML = `
            <div class="summary-card">
                <h3>Total Workflows</h3>
                <p>${total}</p>
            </div>
            <div class="summary-card">
                <h3>Successful</h3>
                <p style="color: var(--success-color);">${success}</p>
            </div>
            <div class="summary-card">
                <h3>Failed</h3>
                <p style="color: var(--failure-color);">${failure}</p>
            </div>
            <div class="summary-card">
                <h3>Running</h3>
                <p style="color: var(--running-color);">${running}</p>
            </div>
            <div class="summary-card">
                <h3>Pending</h3>
                <p style="color: var(--pending-color);">${pending}</p>
            </div>
        `;
    }

    /**
     * Renders the list of all workflows as clickable cards.
     * Attaches click event listeners to each card to display details.
     */
    function renderWorkflowList() {
        workflowListEl.innerHTML = ''; // Clear previous list
        workflowsData.forEach(workflow => {
            const workflowCard = document.createElement('div');
            workflowCard.classList.add('workflow-card', getStatusClass(workflow.status));
            workflowCard.dataset.workflowId = workflow.id; // Store ID for easy retrieval

            workflowCard.innerHTML = `
                <h3>${workflow.name}</h3>
                <p>Last Run: ${formatDateTime(workflow.lastRun)}</p>
                <div class="status">${workflow.status}</div>
            `;

            // Add click event listener to each workflow card
            workflowCard.addEventListener('click', () => displayWorkflowDetails(workflow.id));
            workflowListEl.appendChild(workflowCard);
        });

        // Automatically select the first workflow if available, or previously selected one
        if (workflowsData.length > 0 && !selectedWorkflowId) {
            displayWorkflowDetails(workflowsData[0].id);
        } else if (selectedWorkflowId) {
            displayWorkflowDetails(selectedWorkflowId);
        }
    }

    /**
     * Displays the detailed view of a selected workflow, including its steps and logs.
     * @param {string} workflowId - The ID of the workflow to display.
     */
    function displayWorkflowDetails(workflowId) {
        const workflow = workflowsData.find(wf => wf.id === workflowId);

        if (!workflow) {
            workflowDetailsContainerEl.innerHTML = '<p class="no-selection-message">Workflow not found.</p>';
            return;
        }

        // Update selectedWorkflowId and highlight the active card
        selectedWorkflowId = workflowId;
        document.querySelectorAll('.workflow-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.workflowId === workflowId) {
                card.classList.add('selected');
            }
        });

        // Build HTML for workflow details
        let detailsHtml = `
            <div class="workflow-details">
                <h3>${workflow.name}</h3>
                <div class="meta-info">
                    <div>
                        <span>Status</span>
                        <strong class="${getStatusClass(workflow.status)}">${workflow.status}</strong>
                    </div>
                    <div>
                        <span>Last Run</span>
                        <strong>${formatDateTime(workflow.lastRun)}</strong>
                    </div>
                    <div>
                        <span>Duration</span>
                        <strong>${formatDuration(workflow.duration)}</strong>
                    </div>
                </div>
                
                <h4>Pipeline Steps</h4>
                <div class="workflow-steps">
        `;

        // Iterate through steps and build their HTML
        workflow.steps.forEach((step, index) => {
            detailsHtml += `
                <div class="workflow-step">
                    <div class="step-indicator ${getStatusClass(step.status)}">${index + 1}</div>
                    <div class="step-content">
                        <h4>${step.name}</h4>
                        <pre class="step-log">${step.log}</pre>
                    </div>
                </div>
            `;
        });

        detailsHtml += `
                </div>
            </div>
        `;

        workflowDetailsContainerEl.innerHTML = detailsHtml;
    }

    // --- Initialization ---
    /**
     * Initializes the dashboard by rendering summary and workflow list.
     */
    function initializeDashboard() {
        renderPipelineSummary();
        renderWorkflowList();
    }

    initializeDashboard();
});
