let transactions = [];
let budgets = [];
let categories = ['Food', 'Transport', 'Utilities', 'Rent', 'Salary', 'Entertainment', 'Shopping', 'Healthcare']; // Default categories

// --- DOM Elements ---
const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const balanceDisplay = document.getElementById('balance');
const incomeDisplay = document.getElementById('income');
const expenseDisplay = document.getElementById('expense');
const transactionCategorySelect = document.getElementById('transaction-category');

const categoryForm = document.getElementById('category-form');
const categoryListDisplay = document.getElementById('category-list-display');
const budgetCategorySelect = document.getElementById('budget-category');

const budgetForm = document.getElementById('budget-form');
const budgetList = document.getElementById('budget-list');

// --- Chart.js Instances (requires Chart.js CDN in HTML) ---
// Example CDN: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
let expenseChartInstance;
let incomeExpenseChartInstance;

// --- Data Storage ---
const saveData = () => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('categories', JSON.stringify(categories));
};

const loadData = () => {
    const storedTransactions = localStorage.getItem('transactions');
    const storedBudgets = localStorage.getItem('budgets');
    const storedCategories = localStorage.getItem('categories');

    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
    }
    if (storedBudgets) {
        budgets = JSON.parse(storedBudgets);
    }
    if (storedCategories) {
        categories = JSON.parse(storedCategories);
    }
};

// --- Transaction Tracking ---
const updateSummary = () => {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = income - expense;

    if (incomeDisplay) incomeDisplay.textContent = income.toFixed(2);
    if (expenseDisplay) expenseDisplay.textContent = expense.toFixed(2);
    if (balanceDisplay) balanceDisplay.textContent = balance.toFixed(2);
};

const addTransaction = (e) => {
    e.preventDefault();

    const description = document.getElementById('transaction-description').value;
    const amount = parseFloat(document.getElementById('transaction-amount').value);
    const type = document.getElementById('transaction-type').value;
    const category = document.getElementById('transaction-category').value;
    const date = document.getElementById('transaction-date').value || new Date().toISOString().split('T')[0];

    if (!description || isNaN(amount) || amount <= 0 || !category) {
        alert('Please enter valid transaction details.');
        return;
    }

    const newTransaction = {
        id: Date.now(),
        description,
        amount,
        type,
        category,
        date
    };

    transactions.push(newTransaction);
    saveData();
    renderTransactions();
    updateSummary();
    renderBudgets(); // Budgets might be affected by new transactions
    renderCharts();
    if (transactionForm) transactionForm.reset();
};

const deleteTransaction = (id) => {
    transactions = transactions.filter(t => t.id !== id);
    saveData();
    renderTransactions();
    updateSummary();
    renderBudgets();
    renderCharts();
};

const renderTransactions = () => {
    if (!transactionList) return;
    transactionList.innerHTML = '';
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(t => {
        const li = document.createElement('li');
        li.className = `list-group-item d-flex justify-content
