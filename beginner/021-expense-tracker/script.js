const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseDateInput = document.getElementById('expense-date');
const expenseList = document.getElementById('expense-list');
const balanceDisplay = document.getElementById('balance');
const chartCanvas = document.getElementById('expense-chart');

let expenses = [];
let chartInstance;

// Load expenses from localStorage
function getExpensesFromLocalStorage() {
    const storedExpenses = localStorage.getItem('expenses');
    return storedExpenses ? JSON.parse(storedExpenses) : [];
}

// Save expenses to localStorage
function saveExpensesToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Render expenses to the DOM
function renderExpenses() {
    expenseList.innerHTML = '';
    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.className = 'expense-item';
        listItem.innerHTML = `
            <span>${expense.name}</span>
            <span>$${expense.amount.toFixed(2)}</span>
            <span>${expense.category}</span>
            <span>${expense.date}</span>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        expenseList.appendChild(listItem);
    });
}

// Update total balance
function updateTotals() {
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    balanceDisplay.textContent = totalAmount.toFixed(2);
}

// Draw chart
function drawChart() {
    if (chartInstance) {
        chartInstance.destroy();
    }

    const categoryTotals = {};
    expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const backgroundColors = [
        'rgba(255, 99, 132, 0.7)', // Red
        'rgba(54, 162, 235, 0.7)', // Blue
        'rgba(255, 206, 86, 0.7)', // Yellow
        'rgba(75, 192, 192, 0.7)', // Green
        'rgba(153, 102, 255, 0.7)',// Purple
        'rgba(255, 159, 64, 0.7)', // Orange
        'rgba(199, 199, 199, 0.7)', // Grey
        'rgba(83, 109, 254, 0.7)', // Indigo
        'rgba(255, 23, 68, 0.7)'   // Pink
    ];

    chartInstance = new Chart(chartCanvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors
