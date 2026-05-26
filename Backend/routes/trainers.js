const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const {
  getAllTrainers, getTrainer, createTrainer, updateTrainer, deleteTrainer, addReview,
  getMyProfile, updateMyProfile, getMyClients, markClientAttendance, assignDietPlan, assignWorkoutPlan, getClientDetail,
} = require('../controllers/trainerController')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')
const { handleValidation } = require('../middleware/validate')

const trainerCreateRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('speciality').trim().notEmpty().withMessage('Speciality is required'),
  body('phone').optional({ checkFalsy: true }).matches(/^[+\d][\d\s\-().]{6,17}$/).withMessage('Enter a valid phone number'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('experience').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Experience must be a non-negative number'),
]

const trainerUpdateRules = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),
  body('speciality').optional().trim().notEmpty().withMessage('Speciality cannot be empty'),
  body('phone').optional({ checkFalsy: true }).matches(/^[+\d][\d\s\-().]{6,17}$/).withMessage('Enter a valid phone number'),
  body('experience').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Experience must be a non-negative number'),
]

const dietPlanRules = [
  body('title').trim().notEmpty().withMessage('Plan title is required').isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('totalCalories').optional({ checkFalsy: true }).isFloat({ min: 1 }).withMessage('Calories must be a positive number'),
  body('totalProtein').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Protein must be non-negative'),
  body('totalCarbs').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Carbs must be non-negative'),
  body('totalFat').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Fat must be non-negative'),
]

const workoutPlanRules = [
  body('title').optional({ checkFalsy: true }).trim().isLength({ min: 2 }).withMessage('Title must be at least 2 characters'),
  body('description').optional({ checkFalsy: true }).trim(),
  body('duration').optional({ checkFalsy: true }).isFloat({ min: 1 }).withMessage('Duration must be a positive number'),
  body('caloriesBurn').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Calories burn must be non-negative'),
]

const attendanceRules = [
  body('duration').optional({ checkFalsy: true }).isFloat({ min: 1 }).withMessage('Duration must be a positive number'),
]

// Public
router.get('/', getAllTrainers)
router.get('/:id', getTrainer)

// Trainer self
router.get('/me/profile', protect, authorize('trainer', 'admin'), getMyProfile)
router.put('/me/profile', protect, authorize('trainer', 'admin'), upload.single('image'), updateMyProfile)
router.get('/me/clients', protect, authorize('trainer', 'admin'), getMyClients)
router.get('/me/clients/:userId', protect, authorize('trainer', 'admin'), getClientDetail)
router.post('/me/clients/:userId/attendance', protect, authorize('trainer', 'admin'), attendanceRules, handleValidation, markClientAttendance)
router.post('/me/clients/:userId/diet', protect, authorize('trainer', 'admin'), dietPlanRules, handleValidation, assignDietPlan)
router.post('/me/clients/:userId/workout', protect, authorize('trainer', 'admin'), workoutPlanRules, handleValidation, assignWorkoutPlan)

// Admin
router.post('/', protect, authorize('admin'), upload.single('image'), trainerCreateRules, handleValidation, createTrainer)
router.put('/:id', protect, authorize('admin'), upload.single('image'), trainerUpdateRules, handleValidation, updateTrainer)
router.delete('/:id', protect, authorize('admin'), deleteTrainer)
router.post('/:id/reviews', protect, addReview)

module.exports = router
