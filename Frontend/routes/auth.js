const express = require('express')
const router = express.Router()
const { register, login, getMe, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const { body } = require('express-validator')

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
]

// Logs server-side duration for auth POSTs so slow responses can be told apart
// from network latency (visible in Render logs).
const timeAuth = (label) => (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    console.log(`[auth] ${label} -> ${res.statusCode} in ${ms}ms${ms > 1000 ? ' (SLOW)' : ''}`)
  })
  next()
}

// Apply stricter rate limiting to authentication routes
router.post('/register', timeAuth('register'), authLimiter, validateRegister, register)
router.post('/login', timeAuth('login'), authLimiter, login)
router.get('/me', protect, getMe)
router.put('/update-password', protect, updatePassword)
router.post('/forgot-password', timeAuth('forgot-password'), authLimiter, forgotPassword)
router.post('/reset-password/:token', timeAuth('reset-password'), authLimiter, resetPassword)

module.exports = router
