const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// --- In-memory data store for demonstration ---
let items = [
    { id: '1', name: 'Item A', description: 'This is item A.' },
    { id: '2', name: 'Item B', description: 'This is item B.' }
];
let nextId = 3; // To simulate auto-incrementing IDs

// --- Middleware ---
// 1. Body Parser Middleware: Parses incoming JSON requests and puts the parsed data in req.body
app.use(express.json());

// 2. Simple Request Logger Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware function or route handler
});

// --- CRUD Endpoints ---

// GET all items
app.get('/api/items', (req, res) => {
    res.json(items);
});

// GET item by ID
app.get('/api/items/:id', (req, res, next) => {
    const { id } = req.params;
    const item = items.find(i => i.id === id);

    if (item) {
        res.json(item);
    } else {
        // Pass a custom error to the error handling middleware
        next({ status: 404, message: `Item with ID ${id} not found.` });
    }
});

// POST a new item (with basic validation)
app.post('/api/items', (req, res, next) => {
    const { name, description } = req.body;

    // Basic Validation Middleware (could be externalized)
    if (!name || name.trim() === '') {
        return next({ status: 400, message: 'Name is required for a new item.' });
    }
    if (!description || description.trim() === '') {
        return next({ status: 400, message: 'Description is required for a new item.' });
    }

    const newItem = {
        id: String(nextId++),
        name,
        description
    };
    items.push(newItem);
    res.status(201).json(newItem); // 201 Created
});

// PUT (update) an item by ID (with basic validation)
app.put('/api/items/:id', (req, res, next) => {
    const { id } = req.params;
    const { name, description } = req.body;

    // Basic Validation
    if (!name && !description) {
        return next({ status: 400, message: 'At least one field (name or description) must be provided for update.' });
    }

    const itemIndex = items.findIndex(i => i.id === id);

    if (itemIndex > -1) {
        // Update only provided fields
        if (name !== undefined) {
            if (name.trim() === '') {
                return next({ status: 400, message: 'Name cannot be empty.' });
            }
            items[itemIndex].name = name;
        }
        if (description !== undefined) {
            if (description.trim() === '') {
                return next({ status: 400, message: 'Description cannot be empty.' });
            }
            items[itemIndex].description = description;
        }
        res.json(items[itemIndex]);
    } else {
        next({ status: 404, message: `Item with ID ${id} not found.` });
    }
});

// DELETE an item by ID
app.delete('/api/items/:id', (req, res, next) => {
    const { id } = req.params;
    const initialLength = items.length;
    items = items.filter(i => i.id !== id);

    if (items.length < initialLength) {
        res.status(204).send(); // 204 No Content
    } else {
        next({ status: 404, message: `Item with ID ${id} not found.` });
    }
});

// --- Error Handling Middleware ---

// 1. 404 Not Found Handler (for unmatched routes)
app.use((req, res, next) => {
    next({ status: 404, message: `Route ${req.originalUrl} not found.` });
});

// 2. General Error Handler
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || 'An unexpected error occurred.';

    console.error(`Error ${statusCode}: ${message}`, err.stack); // Log the error for debugging

    res.status(statusCode).json({
        error: {
            status: statusCode,
            message: message,
            // In development, you might include the stack trace
            // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
