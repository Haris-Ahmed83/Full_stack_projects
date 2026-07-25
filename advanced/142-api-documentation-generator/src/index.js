const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // For the 'try-it' feature

const app = express();
const PORT = process.env.PORT || 3000;
const API_DOCS_DIR = path.join(__dirname, 'api-docs'); // Directory where your markdown API definitions live

// Middleware to parse JSON request bodies
app.use(express.json());
// Middleware to serve static files (e.g., a simple frontend or generated HTML)
// In a real app, 'public' would contain your client-side documentation viewer
app.use(express.static(path.join(__dirname, 'public')));

// --- Mock/Placeholder for Markdown Parsing Logic ---
// In a real application, this function would:
// 1. Read all .md files in the specified directory (e.g., API_DOCS_DIR).
// 2. Use a markdown parser (e.g., 'marked', 'markdown-it') to convert markdown to HTML or an AST.
// 3. Apply custom logic to identify and extract API endpoint details:
//    - HTTP method and path (e.g., from a heading like '## GET /users')
//    - Description, summary
//    - Request parameters (query, header, path, cookie)
//    - Request body schema and examples
//    - Response status codes, schemas, and examples
//    - Code samples for different languages (e.g., from fenced code blocks)
// 4. Structure the extracted data into a consistent JSON format.
// For this example, we'll return a hardcoded structure representing the output of such parsing.
function parseMarkdownApiDocs(docsDir) {
    console.log(`Scanning for API documentation in: ${docsDir}`);
    const apiDefinitions = [];

    // --- Start of Mock API Data ---
    // This array simulates the structured data that would be generated
    // by parsing markdown files like 'users.md', 'products.md', etc.
    apiDefinitions.push(
        {
            id: 'getUsers',
            path: '/users',
            method: 'GET',
            summary: 'Retrieve a list of users',
            description: 'Fetches all registered users from the system. Supports pagination.',
            parameters: [
                { name: 'limit', in: 'query', description: 'Max number of users to return', type: 'integer', required: false, default: 10 },
                { name: 'offset', in: 'query', description: 'Offset for pagination', type: 'integer', required: false, default: 0 },
                { name: 'Authorization', in: 'header', description: 'Bearer token for authentication', type: 'string', required: false }
            ],
            responses: {
                200: {
                    description: 'A list of users',
                    schema: [{ id: 1, name: 'John Doe', email: 'john@example.com' }, { id: 2, name: 'Jane Smith', email: 'jane@example.com' }],
                    contentType: 'application/json'
                },
                401: {
                    description: 'Unauthorized',
                    schema: { message: 'Authentication required' },
                    contentType: 'application/json'
                },
                500: {
                    description: 'Internal Server Error',
                    schema: { message: 'Something went wrong on the server.' },
                    contentType: 'application/json'
                }
            },
            codeSamples: [
                {
                    lang: 'curl',
                    code: 'curl -X GET "http://localhost:8080/api/users?limit=5&offset=0" \\n  -H "Authorization: Bearer YOUR_TOKEN"'
                },
                {
                    lang: 'javascript',
                    code: 'fetch(\'http://localhost:8080/api/users?limit=5\', {\n  headers: { \'Authorization\': \'Bearer YOUR_TOKEN\' }\n})\n  .then(res => res.json())\n  .then(console.log);'
                }
            ]
        },
        {
            id: 'createUser',
            path: '/users',
            method: 'POST',
            summary: 'Create a new user',
            description: 'Adds a new user to the database with provided details.',
            requestBody: {
                contentType: 'application/json',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Full name of the user' },
                        email: { type: 'string', format: 'email', description: 'Unique email address' },
                        password: { type: 'string', format: 'password', description: 'User password' }
                    },
                    required: ['name', 'email', 'password']
                },
                example: { name: 'Alice Wonderland', email: 'alice@example.com', password: 'securepassword123' }
            },
            responses: {
                201: {
                    description: 'User created successfully',
                    schema: { id: 3, name: 'Alice Wonderland', email: 'alice@example.com' },
                    contentType: 'application/json'
                },
                400: {
                    description: 'Invalid input',
                    schema: { message: 'Name, email, and password are required.' },
                    contentType: 'application/json'
                }
            },
            codeSamples: [
                {
                    lang: 'curl',
                    code: 'curl -X POST -H "Content-Type: application/json" -d \'{"name": "Bob", "email": "bob@example.com", "password": "pass"}\' "http://localhost:8080/api/users"'
                },
                {
                    lang: 'python',
                    code: 'import requests\nurl = "http://localhost:8080/api/users"\nheaders = {"Content-Type": "application/json"}\ndata = {"name": "Charlie", "email": "charlie@example.com", "password": "secure"}\nresponse = requests.post(url, json=data, headers=headers)\nprint(response.json())'
                }
            ]
        }
    );
    // --- End of Mock API Data ---

    return apiDefinitions;
}

// Store parsed documentation in memory (or cache it)
let apiDocumentation = [];
try {
    // In a real scenario, you'd check if API_DOCS_DIR exists and contains markdown files.
    // For this example, we just use the mock data.
    apiDocumentation = parseMarkdownApiDocs(API_DOCS_DIR);
    console.log(`Loaded ${apiDocumentation.length} API endpoints from mock data.`);
} catch (error) {
    console.error('Failed to parse API documentation:', error.message);
}

// --- API Endpoints for the Documentation Generator Backend ---

// Endpoint to retrieve the structured API documentation data
// A frontend application would fetch this data to render the interactive documentation.
app.get('/api/docs', (req, res) => {
    res.json(apiDocumentation);
});

// Endpoint for the "Interactive Try-it" feature
// This acts as a proxy: a client (frontend) sends an API request configuration here,
// and this backend forwards it to the actual target API, then returns the response.
app.post('/api/try-it', async (req, res) => {
    const { url, method, headers, body } = req.body;

    if (!url || !method) {
        return res.status(400).json({ error: 'URL and method are required for try-it request.' });
    }

    try {
        const config = {
            method: method.toLowerCase(),
            url: url,
            headers: {
                'Content-Type': 'application/json', // Default, can be overridden by user headers
                ...headers
            },
            data: body // For POST, PUT, PATCH, DELETE requests
        };

        const response = await axios(config);

        // Return the response from the target API
        res.json({
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            data: response.data
        });
    } catch (error) {
        // Handle errors from the target API or network issues
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).json({
                error: 'API call failed on target server',
                status: error.response.status,
                statusText: error.response.statusText,
                headers: error.response.headers,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).json({ error: 'No response received from target API.', message: error.message });
        } else {
            // Something happened in setting up the request that triggered an Error
            res.status(500).json({ error: 'Error setting up API try-it request.', message: error.message });
        }
    }
});

// Basic route for the root
app.get('/', (req, res) => {
    res.send(`
        <h1>API Documentation Generator Backend</h1>
        <p>This server provides structured API documentation data and an interactive "try-it" proxy.</p>
        <p>Visit <code>/api/docs</code> to see the generated documentation data (JSON).</p>
        <p>An interactive frontend application (typically served from the <code>/public</code> directory or a separate client) would consume <code>/api/docs</code> to display the documentation and use <code>/api/try-it</code> for live API calls.</p>
        <p>Ensure your <code>api-docs</code> directory (or equivalent) contains markdown files defining your APIs.</p>
    `);
});

// Start the server
app.listen(PORT, () => {
    console.log(`API Doc Generator server running on http://localhost:${PORT}`);
    console.log(`Documentation data available at http://localhost:${PORT}/api/docs`);
    console.log(`Interactive "Try-it" endpoint at http://localhost:${PORT}/api/try-it`);
    console.log(`Static files (if any frontend) served from http://localhost:${PORT}/`);
});
