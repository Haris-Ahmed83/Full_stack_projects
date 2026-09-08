const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const { graphql, buildSchema } = require('graphql');

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || 'your_secret_api_token';

// In-memory "database" for demonstration
const contentTypes = {
  'blog-post': {
    name: 'Blog Post',
    slug: 'blog-post',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'slug', type: 'string', required: true, unique: true },
      { name: 'content', type: 'text' },
      { name: 'author', type: 'string' },
      { name: 'publishedDate', type: 'date' },
    ],
  },
  'product': {
    name: 'Product',
    slug: 'product',
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'sku', type: 'string', required: true, unique: true },
      { name: 'description', type: 'text' },
      { name: 'price', type: 'number' },
    ],
  },
};

const contentData = {
  'blog-post': {
    '1a2b3c': {
      id: '1a2b3c',
      title: 'Getting Started with Headless CMS',
      slug: 'getting-started-headless-cms',
      content: 'This is an introductory post about headless content management systems.',
      author: 'Jane Doe',
      publishedDate: '2023-10-26T10:00:00Z',
      createdAt: '2023-10-26T10:00:00Z',
      updatedAt: '2023-10-26T10:00:00Z',
    },
  },
  'product': {
    'd4e5f6': {
      id: 'd4e5f6',
      name: 'Wireless Keyboard',
      sku: 'WK-001',
      description: 'Ergonomic wireless keyboard with backlit keys.',
      price: 79.99,
      createdAt: '2023-10-25T14:30:00Z',
      updatedAt: '2023-10-25T14:30:00Z',
    },
  },
};

// --- Middleware ---
app.use(bodyParser.json());

// API Token Authentication Middleware
const authenticateAPIKey = (req, res, next) => {
  const token = req.headers['x-api-key'];
  if (!token || token !== API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API Token' });
  }
  next();
};

// --- Webhook Simulation ---
const triggerWebhook = (event, payload) => {
  console.log(`--- WEBHOOK TRIGGERED ---`);
  console.log(`Event: ${event}`);
  console.log(`Payload:`, JSON.stringify(payload, null, 2));
  // In a real application, this would send an HTTP POST request to registered webhook URLs.
  console.log(`-------------------------`);
};

// --- REST API Endpoints ---

// Content Types API
app.get('/api/content-types', authenticateAPIKey, (req, res) => {
  res.json(Object.values(contentTypes));
});

app.post('/api/content-types', authenticateAPIKey, (req, res) => {
  const { name, slug, fields } = req.body;
  if (!name || !slug || !fields) {
    return res.status(400).json({ error: 'Name, slug, and fields are required.' });
  }
  if (contentTypes[slug]) {
    return res.status(409).json({ error: `Content type with slug '${slug}' already exists.` });
  }

  const newContentType = { name, slug, fields };
  contentTypes[slug] = newContentType;
  contentData[slug] = {}; // Initialize data store for new content type
  res.status(201).json(newContentType);
  triggerWebhook('contentType.created', newContentType);
});

// Content API
app.get('/api/content/:contentTypeSlug', authenticateAPIKey, (req, res) => {
  const { contentTypeSlug } = req.params;
  if (!contentTypes[contentTypeSlug]) {
    return res.status(404).json({ error: 'Content type not found.' });
  }
  res.json(Object.values(contentData[contentTypeSlug]));
});

app.post('/api/content/:contentTypeSlug', authenticateAPIKey, (req, res) => {
  const { contentTypeSlug } = req.params;
  const contentType = contentTypes[contentTypeSlug];
  if (!contentType) {
    return res.status(404).json({ error: 'Content type not found.' });
  }

  const newEntry = { id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...req.body };

  // Basic field validation
  for (const field of contentType.fields) {
    if (field.required && !newEntry[field.name]) {
      return res.status(400).json({ error: `Field '${field.name}' is required.` });
    }
    if (field.unique && newEntry[field.name]) {
      const existingEntry = Object.values(contentData[contentTypeSlug]).find(
        entry => entry[field.name] === newEntry[field.name]
      );
      if (existingEntry) {
        return res.status(409).json({ error: `Field '${field.name}' must be unique, value '${newEntry[field.name]}' already exists.` });
      }
    }
  }

  contentData[contentTypeSlug][newEntry.id] = newEntry;
  res.status(201).json(newEntry);
  triggerWebhook('content.created', { contentTypeSlug, entry: newEntry });
});

app.get('/api/content/:contentTypeSlug/:id', authenticateAPIKey, (req, res) => {
  const { contentTypeSlug, id } = req.params;
  if (!contentTypes[contentTypeSlug]) {
    return res.status(404).json({ error: 'Content type not found.' });
  }
  const entry = contentData[contentTypeSlug][id];
  if (!entry) {
    return res.status(404).json({ error: 'Content entry not found.' });
  }
  res.json(entry);
});

app.put('/api/content/:contentTypeSlug/:id', authenticateAPIKey, (req, res) => {
  const { contentTypeSlug, id } = req.params;
  const contentType = contentTypes[contentTypeSlug];
  if (!contentType) {
    return res.status(404).json({ error: 'Content type not found.' });
  }
  let entry = contentData[contentTypeSlug][id];
  if (!entry) {
    return res.status(404).json({ error: 'Content entry not found.' });
  }

  const updatedEntry = { ...entry, ...req.body, updatedAt: new Date().toISOString() };

  // Basic field validation for unique fields
  for (const field of contentType.fields) {
    if (field.unique && updatedEntry[field.name] && updatedEntry[field.name] !== entry[field.name]) {
      const existingEntry = Object.values(contentData[contentTypeSlug]).find(
        e => e[field.name] === updatedEntry[field.name] && e.id !== id
      );
      if (existingEntry) {
        return res.status(409).json({ error: `Field '${field.name}' must be unique, value '${updatedEntry[field.name]}' already exists.` });
      }
    }
  }

  contentData[contentTypeSlug][id] = updatedEntry;
  res.json(updatedEntry);
  triggerWebhook('content.updated', { contentTypeSlug, entry: updatedEntry });
});

app.delete('/api/content/:contentTypeSlug/:id', authenticateAPIKey, (req, res) => {
  const { contentTypeSlug, id } = req.params;
  if (!contentTypes[contentTypeSlug]) {
    return res.status(404).json({ error: 'Content type not found.' });
  }
  const entry = contentData[contentTypeSlug][id];
  if (!entry) {
    return res.status(404).json({ error: 'Content entry not found.' });
  }
  delete contentData[contentTypeSlug][id];
  res.status(204).send(); // No Content
  triggerWebhook('content.deleted', { contentTypeSlug, entryId: id });
});

// --- GraphQL API Endpoint ---

// Define a GraphQL schema
const schema = buildSchema(`
  type BlogPost {
    id: ID!
    title: String
    slug: String
    content: String
    author: String
    publishedDate: String
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String
    sku: String
    description: String
    price: Float
    createdAt: String
    updatedAt: String
  }

  type Query {
    hello: String
    blogPosts: [BlogPost]
    blogPost(id: ID!): BlogPost
    products: [Product]
    product(id: ID!): Product
  }
`);

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => 'Hello from GraphQL!',
  blogPosts: () => Object.values(contentData['blog-post']),
  blogPost: ({ id }) => contentData['blog-post'][id],
  products: () => Object.values(contentData['product']),
  product: ({ id }) => contentData['product'][id],
};

app.post('/graphql', authenticateAPIKey, async (req, res) => {
  const { query, variables } = req.body;
  try {
    const result = await graphql({
      schema,
      source: query,
      rootValue: root,
      variableValues: variables,
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ errors: [{ message: error.message }] });
  }
});

// --- Webhook Trigger Endpoint (for testing webhooks manually) ---
app.post('/api/webhooks/trigger', authenticateAPIKey, (req, res) => {
  const { event, payload } = req.body;
  if (!event || !payload) {
    return res.status(400).json({ error: 'Event and payload are required.' });
  }
  triggerWebhook(event, payload);
  res.status(200).json({ message: 'Webhook triggered successfully (simulated).' });
});


// Default route
app.get('/', (req, res) => {
  res.send(`
    <h1>Headless CMS API</h1>
    <p>Welcome to the Headless CMS API simulation.</p>
    <p>Use an <code>x-api-key</code> header with value <code>${API_TOKEN}</code> for authentication.</p>
    <h2>REST API Endpoints:</h2>
    <ul>
      <li><code>GET /api/content-types</code> - List all content types</li>
      <li><code>POST /api/content-types</code> - Create a new content type</li>
      <li><code>GET /api/content/:contentTypeSlug</code> - Get all entries for a content type</li>
      <li><code>POST /api/content/:contentTypeSlug</code> - Create a new entry</li>
      <li><code>GET /api/content/:contentTypeSlug/:id</code> - Get a single entry</li>
      <li><code>PUT /api/content/:contentTypeSlug/:id</code> - Update an entry</li>
      <li><code>DELETE /api/content/:contentTypeSlug/:id</code> - Delete an entry</li>
    </ul>
    <h2>GraphQL API Endpoint:</h2>
    <ul>
      <li><code>POST /graphql</code> - Send GraphQL queries (e.g., <code>{"query": "{ blogPosts { id title } }"}</code>)</li>
    </ul>
    <h2>Webhook Trigger Endpoint (for simulation):</h2>
    <ul>
      <li><code>POST /api/webhooks/trigger</code> - Manually trigger a webhook (e.g., <code>{"event": "custom.event", "payload": {"data": "some value"}}</code>)</li>
    </ul>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Headless CMS API running on port ${PORT}`);
  console.log(`API Token: ${API_TOKEN}`);
  console.log(`Access at: http://localhost:${PORT}`);
});
