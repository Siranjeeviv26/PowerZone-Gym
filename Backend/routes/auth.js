const express = require('express')
const router = express.Router()
const { register, login, getMe, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController')
const { protect } = require('../middleware/auth')
const { body } = require('express-validator')

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 chars'),
]

router.post('/register', validateRegister, register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.put('/update-password', protect, updatePassword)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

module.exports = router
