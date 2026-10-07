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

// Apply stricter rate limiting to authentication routes
router.post('/register', authLimiter, validateRegister, register)
router.post('/login', authLimiter, login)
router.get('/me', protect, getMe)
router.put('/update-password', protect, updatePassword)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password/:token', authLimiter, resetPassword)

module.exports = router
