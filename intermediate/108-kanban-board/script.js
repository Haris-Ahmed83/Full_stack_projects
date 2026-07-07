// Global array to store tasks
let tasks = [];

// DOM elements
const todoColumn = document.getElementById('todo-cards');
const inProgressColumn = document.getElementById('in-progress-cards');
const doneColumn = document.getElementById('done-cards');
const blockedColumn = document.getElementById('blocked-cards');

const addTaskModal = new bootstrap.Modal(document.getElementById('formModal'));
const taskForm = document.getElementById('taskForm');
const taskNameInput = document.getElementById('taskName');
const taskDescriptionInput = document.getElementById('taskDescription');
const taskDueDateInput = document.getElementById('taskDueDate');

let editingTaskId = null; // To keep track if we are editing an existing task

// Function to generate a unique ID for tasks
function generateTaskId() {
  return crypto.randomUUID();
}

// Function to save tasks to local storage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
  const storedTasks = localStorage.getItem('tasks');
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
}

// Function to create a task card element
function createTaskCard(task) {
  const card = document.createElement('div');
  card.classList.add('card', 'mb-3', 'draggable');
  card.setAttribute('data-task-id', task.id);
  card.setAttribute('draggable', true);

  // Determine background color based on due date proximity
  const now = dayjs();
  const dueDate = dayjs(task.dueDate);
  let cardBgClass = 'bg-light'; // Default

  if (task.dueDate && task.status !== 'done') {
    if (dueDate.isBefore(now, 'day')) {
      cardBgClass = 'bg-danger text-white'; // Overdue
    } else if (dueDate.diff(now, 'day') <= 3) {
      cardBgClass = 'bg-warning text-dark'; // Due soon
    }
  }
  card.classList.add(cardBgClass);

  card.innerHTML = `
    <div class="card-body">
      <h5 class="card-title">${task.name}</h5>
      <p class="card-text">${task.description}</p>
      <p class="card-text"><strong>Due:</strong> ${task.dueDate ? dayjs(task.dueDate).format('MM/DD/YYYY') : 'N/A'}</p>
      <button class="btn btn-danger btn-sm delete-task-btn" data-task-id="${task.id}">Delete</button>
      <button class="btn btn-info btn-sm edit-task-btn" data-task-id="${task.id}">Edit</button>
    </div>
  `;

  card.addEventListener('dragstart', handleDragStart);
  return card;
}

// Function to render tasks to the columns
function renderTasks() {
  // Clear existing cards
  todoColumn.innerHTML = '';
  inProgressColumn.innerHTML = '';
  doneColumn.innerHTML = '';
  blockedColumn.innerHTML = '';

  // Iterate over tasks and append to appropriate column
  tasks.forEach(task => {
    const card = createTaskCard(task);
    if (task.status === 'to-do') {
      todoColumn.appendChild(card);
    } else if (task.status === 'in-progress') {
      inProgressColumn.appendChild(card);
    } else if (task.status === 'done') {
      doneColumn.appendChild(card);
    } else if (task.status === '
