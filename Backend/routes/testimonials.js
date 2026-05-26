const router = require('express').Router()
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')
const {
  getTestimonials, getAllTestimonials,
  createTestimonial, updateTestimonial, deleteTestimonial,
} = require('../controllers/testimonialController')

// Public
router.get('/', getTestimonials)

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllTestimonials)
router.post('/', protect, authorize('admin'), upload.single('image'), createTestimonial)
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateTestimonial)
router.delete('/:id', protect, authorize('admin'), deleteTestimonial)

module.exports = router
