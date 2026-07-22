const CRM_APP = {
    data: {
        leads: [],
        tasks: [],
        users: [],
        pipelineStages: ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'],
        analytics: {} // Placeholder for aggregated data
    },

    elements: {
        leadsList: document.getElementById('leads-list'),
        tasksList: document.getElementById('tasks-list'),
        pipelineChart: document.getElementById('pipeline-chart'), // For a visual representation or summary
        analyticsDashboard: document.getElementById('analytics-dashboard'),
        teamDashboard: document.getElementById('team-dashboard'),
        addLeadBtn: document.getElementById('add-lead-btn'),
        addTaskBtn: document.getElementById('add-task-btn'),
        // Add more specific elements as needed for forms, modals, etc.
    },

    init: function() {
        console.log('CRM Dashboard App Initializing...');
        this.loadData();
        this.renderAll
