// --- Global Variables and Selectors ---
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

let todos = []; // Array to store todo objects

// --- Helper Functions ---

/**
 * Saves the current 'todos' array to localStorage.
 */
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Loads 'todos' from localStorage or initializes an empty array.
 */
function loadTodos() {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
        todos = JSON.parse(storedTodos);
    } else {
        todos = [];
    }
}

/**
 * Renders all todos from the 'todos' array to the DOM.
 */
function renderTodos() {
    todoList.innerHTML = ''; // Clear existing list

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item'; // Add a class for styling if needed

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.dataset.index = index; // Store index for easy access
        checkbox.addEventListener('change', toggleTodoComplete);

        const todoText = document.createElement('span');
        todoText.textContent = todo.text;
        if (todo.completed) {
