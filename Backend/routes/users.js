const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  getProfile, updateProfile, uploadAvatar, addAttendance, addProgress,
  getAllUsers, createUser, updateUser, deleteUser,
  checkIn, getAttendance, logWeight, getProgress, deleteProgress, updateProgress,
  getMyDietPlan, getMyWorkoutPlan,
} = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const { handleValidation } = require('../middleware/validate')
const upload = require('../middleware/upload')

const userCreateRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[+\d][\d\s\-().]{6,17}$/).withMessage('Enter a valid phone number'),
]

const userUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[+\d][\d\s\-().]{6,17}$/).withMessage('Enter a valid phone number'),
]

const profileUpdateRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('phone').optional({ checkFalsy: true }).matches(/^[+\d][\d\s\-().]{6,17}$/).withMessage('Enter a valid phone number'),
]

const checkinRules = [
  body('duration').optional({ checkFalsy: true }).isFloat({ min: 1 }).withMessage('Duration must be a positive number'),
]

const weightRules = [
  body('weight').notEmpty().withMessage('Weight is required').isFloat({ min: 0.1 }).withMessage('Weight must be a positive number'),
  body('bodyFat').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100 }).withMessage('Body fat must be between 0 and 100'),
  body('muscleMass').optional({ checkFalsy: true }).isFloat({ min: 0.1 }).withMessage('Muscle mass must be a positive number'),
]

// Self routes
router.get('/profile', protect, getProfile)
router.put('/profile', protect, profileUpdateRules, handleValidation, updateProfile)
router.put('/profile/avatar', protect, upload.single('avatar'), uploadAvatar)
router.post('/checkin', protect, checkinRules, handleValidation, checkIn)
router.get('/attendance', protect, getAttendance)
router.post('/weight', protect, weightRules, handleValidation, logWeight)
router.get('/progress', protect, getProgress)
router.put('/progress/:id', protect, updateProgress)
router.delete('/progress/:id', protect, deleteProgress)
router.get('/my-diet-plan', protect, getMyDietPlan)
router.get('/my-workout-plan', protect, getMyWorkoutPlan)

// Legacy
router.post('/attendance', protect, addAttendance)
router.post('/progress', protect, addProgress)

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers)
router.post('/', protect, authorize('admin'), userCreateRules, handleValidation, createUser)
router.put('/:id', protect, authorize('admin'), userUpdateRules, handleValidation, updateUser)
router.delete('/:id', protect, authorize('admin'), deleteUser)

module.exports = router
