// --- Project Data (Sample Data) ---
let projects = [
    {
        id: 'proj-1',
        name: 'Website Redesign',
        tasks: [
            { id: 'task-1', name: 'Design Mockups', description: 'Create UI mockups for new website', assignee: 'Alice', status: 'todo', dueDate: '2023-12-15', startDate: '2023-12-01', endDate: '2023-12-07' },
            { id: 'task-2', name: 'Develop Frontend', description: 'Implement UI with React components', assignee: 'Bob', status: 'in-progress', dueDate: '2023-12-28', startDate: '2023-12-08', endDate: '2023-12-25' },
            { id: 'task-3', name: 'Setup Backend API', description: 'Develop Node.js REST API for data', assignee: 'Charlie', status: 'done', dueDate: '2023-11-20', startDate: '2023-11-05', endDate: '2023-11-18' },
            { id: 'task-4', name: 'Database Integration', description: 'Connect API to PostgreSQL database', assignee: 'Alice', status: 'todo', dueDate: '2024-01-05', startDate: '2023-12-26', endDate: '2024-01-03' },
            { id: 'task-5', name: 'Deploy to Staging', description: 'Deploy website to staging environment', assignee: 'Bob', status: 'todo', dueDate: '2024-01-10', startDate: '2024-01-04', endDate: '2024-01-08' }
        ],
        teams: [
            { id: 'team-1', name: 'Frontend Devs', members: ['Alice', 'Bob'] },
            { id: 'team-2', name: 'Backend Devs', members: ['Charlie'] },
            { id: 'team-3', name: 'QA Team', members: ['David', 'Eve'] }
        ]
    }
];

// For simplicity, we'll work with the first project in the array.
let currentProject = projects[0];
let tasks = currentProject.tasks;
let teams = currentProject.teams;

// --- DOM Element References ---
const appContent = document.getElementById('appContent');
const sidebarBtns = document.querySelectorAll('.sidebar-btn');
const addTaskBtn = document.getElementById('addTaskBtn');

const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const teamModal = document.getElementById('teamModal');
const teamForm = document.getElementById('teamForm');

// --- Utility Functions ---

// Generates a simple unique ID
function generateId() {
    return 'id-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Formats a date string to 'YYYY-MM-DD'
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Calculates the difference in days between two date strings
function getDaysDifference(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end day
}

// Opens a modal
function openModal(modalElement) {
    modalElement.style.display = 'block';
}

// Closes a modal
function closeModal(modalElement) {
    modalElement.style.display = 'none';
    modalElement.querySelector('form').reset(); // Reset form on close
}

// --- Render Functions ---

// Clears current content and sets a loading spinner
function showLoading() {
    appContent.innerHTML = '<div class="loading-spinner"></div>';
    appContent.querySelector('.loading-spinner').style.display = 'block';
}

// Renders the Task List view
function renderTasks() {
    showLoading();
    setTimeout(() => { // Simulate network delay
        appContent.innerHTML = `
            <h2>All Tasks</h2>
            <div class="task-list" id="taskListContainer"></div>
        `;
        const taskListContainer = document.getElementById('taskListContainer');
        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p>No tasks yet. Add one!</p>';
            return;
        }

        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.setAttribute('data-id', task.id);
            taskCard.setAttribute('data-status', task.status);
            taskCard.innerHTML = `
                <h3>${task.name}</h3>
                <p>${task.description || 'No description'}</p>
                <div class="task-meta">
                    <span>Assignee: <strong>${task.assignee || 'Unassigned'}</strong></span>
                    <span>Due: ${formatDate(task.dueDate)}</span>
                    <span class="task-status-badge" data-status="${task.status}">${task.status.replace('-', ' ')}</span>
                </div>
                <div class="task-actions">
                    <button class="btn btn-primary btn-sm edit-task-btn">Edit</button>
                    <button class="btn btn-secondary btn-sm delete-task-btn">Delete</button>
                </div>
            `;
            taskListContainer.appendChild(taskCard);
        });

        // Add event listeners for edit/delete buttons
        taskListContainer.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.id;
                // For simplicity, edit will open the same modal with pre-filled data
                openTaskModal(taskId);
            });
        });
        taskListContainer.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.id;
                deleteTask(taskId);
            });
        });

    }, 200);
}

// Renders the Sprint Board view (Kanban-style)
function renderSprintBoard() {
    showLoading();
    setTimeout(() => { // Simulate network delay
        appContent.innerHTML = `
            <h2>Sprint Board</h2>
            <div class="sprint-board">
                <div class="sprint-column" data-status="todo">
                    <h2>To Do</h2>
                </div>
                <div class="sprint-column" data-status="in-progress">
                    <h2>In Progress</h2>
                </div>
                <div class="sprint-column" data-status="done">
                    <h2>Done</h2>
                </div>
            </div>
        `;

        const columns = document.querySelectorAll('.sprint-column');

        // Add drag and drop event listeners to columns
        columns.forEach(column => {
            column.addEventListener('dragover', e => {
                e.preventDefault(); // Allow drop
                column.classList.add('dragover');
            });
            column.addEventListener('dragleave', () => {
                column.classList.remove('dragover');
            });
            column.addEventListener('drop', e => {
                e.preventDefault();
                column.classList.remove('dragover');
                const taskId = e.dataTransfer.getData('text/plain');
                updateTaskStatus(taskId, column.dataset.status);
            });
        });

        // Populate columns with tasks
        tasks.forEach(task => {
            const taskCard = document.createElement('div');
            taskCard.className = 'task-card';
            taskCard.setAttribute('data-id', task.id);
            taskCard.setAttribute('data-status', task.status);
            taskCard.setAttribute('draggable', 'true'); // Make cards draggable
            taskCard.innerHTML = `
                <h3>${task.name}</h3>
                <p>Assignee: ${task.assignee || 'Unassigned'}</p>
                <p>Due: ${formatDate(task.dueDate)}</p>
            `;

            // Add drag event listeners to tasks
            taskCard.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', task.id); // Store task ID during drag
                taskCard.classList.add('dragging');
            });
            taskCard.addEventListener('dragend', () => {
                taskCard.classList.remove('dragging');
            });

            document.querySelector(`.sprint-column[data-status="${task.status}"]`).appendChild(taskCard);
        });
    }, 200);
}

// Renders a simplified Gantt Chart view
function renderGanttChart() {
    showLoading();
    setTimeout(() => { // Simulate network delay
        // Determine the overall date range for the chart
        let minDate = new Date();
        let maxDate = new Date();

        if (tasks.length > 0) {
            minDate = new Date(Math.min(...tasks.map(t => new Date(t.startDate))));
            maxDate = new Date(Math.max(...tasks.map(t => new Date(t.endDate))));
        } else {
            appContent.innerHTML = '<p>No tasks to display in Gantt chart.</p>';
            return;
        }

        // Expand the range a bit for better visualization
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);

        const chartStartDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
        const totalDays = getDaysDifference(chartStartDate.toISOString().split('T')[0], maxDate.toISOString().split('T')[0]);

        appContent.innerHTML = `
            <h2>Gantt Chart</h2>
            <div class="gantt-chart" style="--gantt-cols: ${totalDays};">
                <div class="gantt-header"></div>
            </div>
        `;
        const ganttChartDiv = appContent.querySelector('.gantt-chart');
        const ganttHeader = appContent.querySelector('.gantt-header');

        // Create an empty cell for the task names column header
        const emptyCell = document.createElement('div');
        emptyCell.className = 'gantt-cell';
        ganttHeader.appendChild(emptyCell);

        // Populate header with dates
        for (let i = 0; i < totalDays; i++) {
            const currentDate = new Date(chartStartDate);
            currentDate.setDate(chartStartDate.getDate() + i);
            const dayCell = document.createElement('div');
            dayCell.className = 'gantt-cell';
            dayCell.textContent = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`; // M/D format
            ganttHeader.appendChild(dayCell);
        }

        // Add tasks to the chart
        tasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)).forEach(task => {
            const taskRow = document.createElement('div');
            taskRow.className = 'gantt-task-row';

            const taskNameCell = document.createElement('div');
            taskNameCell.className = 'gantt-task-name';
            taskNameCell.textContent = task.name;
            taskRow.appendChild(taskNameCell);

            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.endDate);

            // Calculate start column and span for the task bar
            const startColumn = getDaysDifference(chartStartDate.toISOString().split('T')[0], taskStart.toISOString().split('T')[0]);
            const duration = getDaysDifference(taskStart.toISOString().split('T')[0], taskEnd.toISOString().split('T')[0]);

            const taskBar = document.createElement('div');
            taskBar.className = 'gantt-task-bar';
            taskBar.setAttribute('data-status', task.status);
            taskBar.textContent = task.name; // Display task name on the bar
            // Set grid-column property for positioning the task bar
            taskBar.style.gridColumn = `${startColumn + 1} / span ${duration}`; // +1 because grid columns are 1-indexed
            taskBar.title = `${task.name} (${formatDate(task.startDate)} - ${formatDate(task.endDate)})`;

            // Create empty cells before the task bar to position it correctly
            for (let i = 0; i < startColumn - 1; i++) {
                const emptyGridCell = document.createElement('div');
                emptyGridCell.className = 'gantt-cell';
                emptyGridCell.style.backgroundColor = 'transparent'; // Make empty cells transparent
                taskRow.appendChild(emptyGridCell);
            }
            taskRow.appendChild(taskBar);

            ganttChartDiv.appendChild(taskRow);
        });
    }, 200);
}

// Renders the Teams view
function renderTeams() {
    showLoading();
    setTimeout(() => { // Simulate network delay
        appContent.innerHTML = `
            <div class="header-actions" style="justify-content: flex-start; margin-bottom: var(--spacing-lg);">
                <h2>Teams</h2>
                <button class="btn btn-primary" id="addTeamBtn">+ Add Team</button>
            </div>
            <div class="team-list" id="teamListContainer"></div>
        `;
        const teamListContainer = document.getElementById('teamListContainer');
        const addTeamBtn = document.getElementById('addTeamBtn');

        addTeamBtn.addEventListener('click', () => openModal(teamModal));

        if (teams.length === 0) {
            teamListContainer.innerHTML = '<p>No teams yet. Add one!</p>';
            return;
        }

        teams.forEach(team => {
            const teamCard = document.createElement('div');
            teamCard.className = 'team-card';
            teamCard.innerHTML = `
                <h3>${team.name}</h3>
                <h4>Members:</h4>
                <ul>
                    ${team.members.map(member => `<li>${member}</li>`).join('')}
                </ul>
            `;
            teamListContainer.appendChild(teamCard);
        });
    }, 200);
}

// --- Data Manipulation Functions ---

// Adds or updates a task in the tasks array
function saveTask(taskData) {
    if (taskData.id) {
        // Update existing task
        const index = tasks.findIndex(t => t.id === taskData.id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
        }
    } else {
        // Add new task
        taskData.id = generateId();
        tasks.push(taskData);
    }
    // Re-render the current view to reflect changes
    renderCurrentView();
    closeModal(taskModal);
}

// Deletes a task from the tasks array
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== taskId);
        renderCurrentView();
    }
}

// Updates a task's status (used for drag and drop)
function updateTaskStatus(taskId, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        renderSprintBoard(); // Re-render the sprint board to reflect the change
    }
}

// Adds a new team
function addTeam(teamData) {
    teamData.id = generateId();
    teamData.members = teamData.members.split(',').map(m => m.trim()).filter(m => m);
    teams.push(teamData);
    renderTeams();
    closeModal(teamModal);
}

// --- View Management ---
let currentView = 'tasks'; // Default view

// Renders the currently active view
function renderCurrentView() {
    switch (currentView) {
        case 'tasks':
            renderTasks();
            break;
        case 'sprint-board':
            renderSprintBoard();
            break;
        case 'gantt-chart':
            renderGanttChart();
            break;
        case 'teams':
            renderTeams();
            break;
        default:
            renderTasks();
    }
}

// --- Event Listeners ---

// Sidebar navigation
sidebarBtns.forEach(button => {
    button.addEventListener('click', () => {
        // Update active state
        sidebarBtns.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // Set current view and render
        currentView = button.dataset.view;
        renderCurrentView();
    });
});

// Add Task button in header
addTaskBtn.addEventListener('click', () => openTaskModal());

// Task Modal close buttons
taskModal.querySelector('.close-button').addEventListener('click', () => closeModal(taskModal));
// Close modal if clicking outside content
taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) closeModal(taskModal);
});

// Team Modal close buttons
teamModal.querySelector('.close-button').addEventListener('click', () => closeModal(teamModal));
// Close modal if clicking outside content
teamModal.addEventListener('click', (e) => {
    if (e.target === teamModal) closeModal(teamModal);
});

// Task Form submission
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const taskData = {};
    for (let [key, value] of formData.entries()) {
        taskData[key] = value;
    }
    // If there's an existing taskId hidden in the form, use it for update
    const existingTaskId = taskForm.dataset.taskId;
    if (existingTaskId) {
        taskData.id = existingTaskId;
    }
    saveTask(taskData);
});

// Function to open task modal, optionally pre-filling for editing
function openTaskModal(taskId = null) {
    taskForm.reset(); // Clear previous form data
    taskForm.removeAttribute('data-task-id'); // Clear any existing task ID
    taskModal.querySelector('h2').textContent = 'Add New Task';
    taskForm.querySelector('button[type="submit"]').textContent = 'Add Task';

    if (taskId) {
        const taskToEdit = tasks.find(t => t.id === taskId);
        if (taskToEdit) {
            taskModal.querySelector('h2').textContent = 'Edit Task';
            taskForm.querySelector('button[type="submit"]').textContent = 'Update Task';
            taskForm.setAttribute('data-task-id', taskId); // Store task ID for update
            // Pre-fill form fields
            document.getElementById('taskName').value = taskToEdit.name;
            document.getElementById('taskDescription').value = taskToEdit.description;
            document.getElementById('taskAssignee').value = taskToEdit.assignee;
            document.getElementById('taskStatus').value = taskToEdit.status;
            document.getElementById('taskDueDate').value = taskToEdit.dueDate;
            document.getElementById('taskStartDate').value = taskToEdit.startDate;
            document.getElementById('taskEndDate').value = taskToEdit.endDate;
        }
    }
    openModal(taskModal);
}

// Team Form submission
teamForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(teamForm);
    const teamData = {};
    for (let [key, value] of formData.entries()) {
        teamData[key] = value;
    }
    addTeam(teamData);
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', renderCurrentView);
