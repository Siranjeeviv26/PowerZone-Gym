const rateLimit = require('express-rate-limit')

// Dynamic max so NODE_ENV is evaluated per-request (avoids dotenv load-order issues)
const devAuthMax = 500
const prodAuthMax = 50
const devApiMax = 1000
const prodApiMax = 300

// Stricter rate limit for authentication endpoints
// Was 10/15min — too low for testing; now 500 in dev / 50 in prod
exports.authLimiter = rateLimit({
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
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: async (req) => (process.env.NODE_ENV === 'development' ? devApiMax : prodApiMax),
  message: {
    success: false,
    message: 'Too many requests, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
})
