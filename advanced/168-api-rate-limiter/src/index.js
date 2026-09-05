const express = require('express');
const { createClient } = require('redis');

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// --- Redis Client ---
const redisClient = createClient({
    url: REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Failed to connect to Redis', err);
        // In a production environment, you might want to handle this more gracefully,
        // perhaps by retrying or exiting only after a certain number of failures.
        process.exit(1); // Exit if Redis connection fails
    }
}

// --- Lua Script for Token Bucket Logic ---
// This script is executed atomically on the Redis server.
// It retrieves the current state, calculates token refill,
// attempts to consume a token, updates the state, and returns
// the result along with rate limit headers.
const LUA_TOKEN_BUCKET_SCRIPT = `
-- KEYS[1]: The client's rate limit key (e.g., "rate_limit:ip_address")
-- ARGV[1]: Bucket capacity (maximum tokens)
-- ARGV[2]: Fill rate (tokens per second)
-- ARGV[3]: Current timestamp in milliseconds

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local fillRate = tonumber(ARGV[2]) -- tokens per second
local now_ms = tonumber(ARGV[3])

-- Get current state: last refill time and current tokens in the bucket
local lastRefillTime_str = redis.call('HGET', key, 'lastRefillTime')
local currentTokens_str = redis.call('HGET', key, 'currentTokens')

-- Initialize state if not present
local lastRefillTime = tonumber(lastRefillTime_str) or 0
local currentTokens = tonumber(currentTokens_str) or capacity -- Start with a full bucket

-- Calculate tokens added since the last known state
local timePassed_ms = now_ms - lastRefillTime
local tokensToAdd = (timePassed_ms / 1000) * fillRate

-- Update tokens, capped at the bucket capacity
currentTokens = math.min(capacity, currentTokens + tokensToAdd)

local allowed = 0
local tokensRemainingAfterAttempt = math.floor(currentTokens) -- Default if not allowed or before consumption

-- Check if there's at least one token to consume
if currentTokens >= 1 then
    allowed = 1
    currentTokens = currentTokens - 1 -- Consume one token
    tokensRemainingAfterAttempt = math.floor(currentTokens)
    -- Store the updated state (last refill time and new token count)
    redis.call('HMSET', key, 'lastRefillTime', now_ms, 'currentTokens', currentTokens)
else
    -- If not allowed (no tokens), we still update lastRefillTime to `now_ms`.
    -- This prevents accumulating a massive `tokensToAdd` calculation if the client
    -- repeatedly hits the rate limit without ever having tokens.
    -- The `currentTokens` will remain below 1 or at 0.
    redis.call('HMSET', key, 'lastRefillTime', now_ms, 'currentTokens', currentTokens)
end

-- Calculate X-RateLimit-Reset header: time until the bucket is full again.
-- This provides a clear indication of when the user can expect to have maximum capacity.
local tokensNeededToFill = capacity - currentTokens
local refillTimeSeconds = tokensNeededToFill / fillRate
local resetTimestamp_seconds = math.floor(now_ms / 1000 + refillTimeSeconds)

-- Return an array: [allowed status, remaining tokens (floored), reset timestamp in seconds]
return {allowed, tokensRemainingAfterAttempt, resetTimestamp_seconds}
`;

// --- Token Bucket Rate Limiter Middleware ---
/**
 * Express middleware for token bucket rate limiting using Redis.
 *
 * @param {object} options - Configuration options for the rate limiter.
 * @param {number} options.capacity - The maximum number of tokens the bucket can hold.
 * @param {number} options.fillRate - The rate at which tokens are added to the bucket (tokens per second).
 * @param {string} [options.keyPrefix='rate_limit'] - Prefix for Redis keys to store rate limit data.
 * @returns {Function} Express middleware function.
 */
function tokenBucketRateLimiter(options) {
    const { capacity, fillRate, keyPrefix = 'rate_limit' } = options;

    if (!capacity || !fillRate) {
        throw new Error('capacity and fillRate are required options for tokenBucketRateLimiter');
    }

    return async (req, res, next) => {
        // Identify the client using their IP address.
        // req.ip works for direct connections, x-forwarded-for for proxies/load balancers.
        const clientId = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
        const key = `${keyPrefix}:${clientId}`;
        const now_ms = Date.now();

        try {
            // Execute the Lua script on Redis
            const [allowed, tokensRemaining, resetTimestamp] = await redisClient.eval(
                LUA_TOKEN_BUCKET_SCRIPT,
                [key], // KEYS array for the Lua script
                [capacity.toString(), fillRate.toString(), now_ms.toString()] // ARGV array for the Lua script
            );

            // Set standard rate limit headers
            res.setHeader('X-RateLimit-Limit', capacity);
            res.setHeader('X-RateLimit-Remaining', tokensRemaining);
            res.setHeader('X-RateLimit-Reset', resetTimestamp); // UTC epoch seconds

            if (allowed) {
                next(); // Request allowed, proceed to the next middleware/route handler
            } else {
                // Request blocked due to rate limit
                res.status(429).send('Too Many Requests');
            }
        } catch (error) {
            console.error('Rate limiter error:', error);
            // In case of a Redis error or script execution failure,
            // it's often safer to allow the request to pass to avoid
            // a single point of failure (Redis) from blocking all traffic.
            // Depending on your application's requirements, you might choose
            // to send a 500 error or block the request.
            next();
        }
    };
}

// --- Express App ---
const app = express();
app.use(express.json()); // Middleware for parsing application/json

// Apply the rate limiting middleware.
// Example: Allow 5 requests initially, then refill at a rate of 0.5 tokens/second
// (meaning 1 token every 2 seconds).
app.use(tokenBucketRateLimiter({ capacity: 5, fillRate: 0.5 }));

// --- Routes ---
app.get('/', (req, res) => {
    res.send('Welcome to the API! Access /protected to test the rate limiter.');
});

app.get('/protected', (req, res) => {
    res.json({ message: 'This is a protected resource, subject to rate limiting!' });
});

app.get('/status', (req, res) => {
    res.json({ status: 'API is running', redis: redisClient.isReady ? 'connected' : 'disconnected' });
});

// --- Start Server ---
async function startServer() {
    await connectRedis(); // Ensure Redis is connected before starting the Express server
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
