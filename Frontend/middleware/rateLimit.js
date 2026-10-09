const rateLimit = require('express-rate-limit')

// On Cloudflare Workers the in-memory store dies with each isolate (so limits
// would reset unpredictably and the client IP cannot be derived reliably),
// which would randomly lock users out. App-level limiting is disabled there —
// use Cloudflare WAF rate-limiting rules instead.
const IS_WORKERS = typeof caches !== 'undefined'
const passthrough = (req, res, next) => next()

// Dynamic max so NODE_ENV is evaluated per-request (avoids dotenv load-order issues)
const devAuthMax = 500
const prodAuthMax = 50
const devApiMax = 1000
const prodApiMax = 300

// Stricter rate limit for authentication endpoints
// Was 10/15min — too low for testing; now 500 in dev / 50 in prod
exports.authLimiter = IS_WORKERS ? passthrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => (process.env.NODE_ENV === 'development' ? devAuthMax : prodAuthMax),
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limiter — was 100/15min, hit during dev/HMR
// Dev: 1000 req/15min, Prod: 300 req/15min
exports.apiLimiter = IS_WORKERS ? passthrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => (process.env.NODE_ENV === 'development' ? devApiMax : prodApiMax),
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
