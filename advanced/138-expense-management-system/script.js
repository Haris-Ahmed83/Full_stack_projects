let currentUser = null; // Stores the currently logged-in user

let users = [
    { id: 'u1', name: 'Alice Employee', email: 'alice@example.com', role: 'employee' },
    { id: 'u2', name: 'Bob Manager', email: 'bob@example.com', role: 'manager' },
    { id: 'u3', name: 'Charlie Admin', email: 'charlie@example.com', role: 'admin' },
    { id: 'u4', name: 'David Employee', email: 'david@example.com', role: 'employee' },
];

let expenses = [
    { id: 'e1', userId: 'u1', amount: 55.50, category: 'Travel', description: 'Bus fare to client meeting', date: '2023-10-26', receiptUrl: '', status: 'pending', approverId: null },
