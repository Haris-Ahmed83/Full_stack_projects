const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// --- Configuration ---
const TARGET_URL = 'https://news.ycombinator.com/'; // Example target website
const OUTPUT_DIR = path.join(__dirname, 'data');
const CSV_FILENAME_PREFIX = 'scraped_data_';
// Cron schedule: '0 */6 * * *' means run every 6 hours (e.g., 00:00, 06:00, 12:00, 18:00 UTC)
// You can adjust this schedule as needed. E.g., '*/30 * * * *' for every 30 minutes.
const CRON_SCHEDULE = '0 */6 * * *';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
    console.log(`Created data directory: ${OUTPUT_DIR}`);
}

// --- Web Scraping Function ---
/**
 * Scrapes data from a given URL using Puppeteer and Cheerio.
 * @param {string} url The URL to scrape.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of scraped data objects.
 */
async function scrapeWebsite(url) {
    let browser;
    try {
        console.log(`Launching browser to scrape: ${url}`);
        browser = await puppeteer.launch({
            headless: true, // Set to true for production, false for debugging UI
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Recommended for Docker/CI environments
        });
        const page = await browser.newPage();

        // Optional: Set a user agent to mimic a real browser and avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to the URL and wait for the network to be idle
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // Max 60 seconds wait

        // Get the full page HTML content
        const htmlContent = await page.content();

        // Use Cheerio to parse the HTML
        const $ = cheerio.load(htmlContent);

        const scrapedData = [];

        // --- Example: Scraping Hacker News headlines and links ---
        // You will need to adjust these selectors based on the target website's HTML structure.
        $('table.itemlist tr.athing').each((index, element) => {
            const titleElement = $(element).find('.titleline a');
            const title = titleElement.text().trim();
            const itemUrl = titleElement.attr('href'); // Renamed to itemUrl to avoid conflict with function param
            const subtextElement = $(element).next().find('.subtext');
            const score = subtextElement.find('.score').text().trim().replace(' points', '');
            const author = subtextElement.find('.hnuser').text().trim();
            const commentsLink = subtextElement.find('a[href^="item?id="]').last();
            const commentsCountMatch = commentsLink.text().match(/(\d+)\s+comments?/);
            const comments = commentsCountMatch ? commentsCountMatch[1] : '0';

            if (title && itemUrl) {
                scrapedData.push({
                    title: title,
                    url: itemUrl,
                    score: score || 'N/A',
                    author: author || 'N/A',
                    comments: comments,
                    timestamp: new Date().toISOString()
                });
            }
        });

        console.log(`Successfully scraped ${scrapedData.length} items from ${url}`);
        return scrapedData;

    } catch (error) {
        console.error(`Error during scraping ${url}:`, error);
        return [];
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
}

// --- CSV Export Function ---
/**
 * Exports an array of data objects to a CSV file.
 * @param {Array<Object>} data The data to export.
 * @param {string} filename The name of the CSV file.
 */
function exportToCsv(data, filename) {
    if (!data || data.length === 0) {
        console.log('No data to export to CSV.');
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers to CSV
    csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));

    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header];
            // Handle commas, newlines, and double quotes in data by enclosing in quotes
            return `"${String(val).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }

    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, csvRows.join('\n'), 'utf8');
    console.log(`Data successfully exported to ${filePath}`);
}

// --- Main Scraper Execution Function ---
/**
 * Orchestrates the scraping and CSV export process.
 */
async function runScraper() {
    console.log(`\n--- [${new Date().toISOString()}] Starting web scraping task... ---`);
    try {
        const scrapedData = await scrapeWebsite(TARGET_URL);

        if (scrapedData.length > 0) {
            // Generate a unique filename with timestamp
            const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const filename = `${CSV_FILENAME_PREFIX}${timestamp}.csv`;
            exportToCsv(scrapedData, filename);
        } else {
            console.log('No data scraped, skipping CSV export.');
        }
        console.log(`--- [${new Date().toISOString()}] Web scraping task completed. ---`);
    } catch (error) {
        console.error(`--- [${new Date().toISOString()}] Web scraping task failed:`, error);
    }
}

// --- Scheduling the Scraper ---
console.log(`[${new Date().toISOString()}] Web Scraper Dashboard backend started.`);
console.log(`[${new Date().toISOString()}] Scraper scheduled to run with cron pattern: "${CRON_SCHEDULE}"`);

// Run the scraper immediately on startup
runScraper();

// Schedule subsequent runs using node-cron
cron.schedule(CRON_SCHEDULE, () => {
    runScraper();
}, {
    scheduled: true,
    timezone: "UTC" // Set your desired timezone, e.g., "America/New_York"
});

// --- Placeholder for Dashboard Data Display (Optional - requires an HTTP server) ---
/*
// To integrate with a frontend dashboard, you would typically:
// 1. Store the scraped data in a database (e.g., MongoDB, PostgreSQL) instead of just CSVs.
// 2. Create an API endpoint using Express.js to serve the latest data or a history of scrapes.
//
// Example of how you might start an Express server (requires 'express' package):
// const express = require('express');
// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get('/api/latest-scrape', (req, res) => {
//     // In a real scenario, you'd fetch the latest data from a DB or read the most recent CSV
//     // For demonstration, we'll return a simple status.
//     res.json({
//         status: 'ok',
//         message: 'Data scraping service is running. Check "data" directory for CSVs.',
//         lastAttempt: new Date().toISOString(),
//         nextSchedule: CRON_SCHEDULE
//     });
// });

// app.listen(PORT, () => {
//     console.log(`Dashboard API server listening on port ${PORT}`);
// });
*/
