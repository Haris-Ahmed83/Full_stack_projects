require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const { isURL } = require('validator');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
});

// --- Mongoose Schema and Model ---
const urlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Url = mongoose.model('Url', urlSchema);

// --- Routes ---

// Basic welcome route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the URL Shortener API!',
        documentation: 'Use POST /api/shorten to create short URLs and GET /:shortId to redirect.',
    });
});

// POST /api/shorten - Create a new short URL
app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl) {
        return res.status(400).json({ error: 'originalUrl is required' });
    }

    // Validate URL with protocol (http/https)
    if (!isURL(originalUrl, { require_protocol: true })) {
        return res.status(400).json({ error: 'Invalid URL. Please provide a valid URL with http/https protocol.' });
    }

    try {
        // Check if the original URL already exists
        let urlEntry = await Url.findOne({ originalUrl });
        if (urlEntry) {
            return res.json({
                message: 'URL already shortened',
                originalUrl: urlEntry.originalUrl,
                shortUrl: `${req.protocol}://${req.get('host')}/${urlEntry.shortId}`,
                shortId: urlEntry.shortId,
            });
        }

        // Generate a unique short ID
        let shortId;
        let isUnique = false;
        while (!isUnique) {
            shortId = nanoid(7); // Generate a 7-character short ID
            const existingId = await Url.findOne({ shortId });
            if (!existingId) {
                isUnique = true;
            }
        }

        // Create and save new URL entry
        urlEntry = new Url({
            originalUrl,
            shortId,
        });

        await urlEntry.save();

        res.status(201).json({
            message: 'URL shortened successfully',
            originalUrl: urlEntry.originalUrl,
            shortUrl: `${req.protocol}://${req.get('host')}/${urlEntry.shortId}`,
            shortId: urlEntry.shortId,
        });

    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /:shortId - Redirect to the original URL
app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;

    try {
        const urlEntry = await Url.findOne({ shortId });

        if (urlEntry) {
            // Perform a permanent redirect (301)
            return res.redirect(301, urlEntry.originalUrl);
        } else {
            return res.status(404).json({ error: 'Short URL not found' });
        }
    } catch (error) {
        console.error('Error retrieving URL:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- Error Handling Middleware (Catch-all for 404s) ---
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
