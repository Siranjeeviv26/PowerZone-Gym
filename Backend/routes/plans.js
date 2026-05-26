const express = require('express')
const router = express.Router()
const { getPlans, createPlan, updatePlan, deletePlan, purchasePlan, uploadOffer, removeOffer } = require('../controllers/planController')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.get('/', getPlans)
router.post('/', protect, authorize('admin'), createPlan)
router.put('/:id', protect, authorize('admin'), updatePlan)
router.delete('/:id', protect, authorize('admin'), deletePlan)
router.post('/purchase', protect, purchasePlan)
router.put('/:id/offer', protect, authorize('admin'), upload.single('image'), uploadOffer)
router.delete('/:id/offer', protect, authorize('admin'), removeOffer)

module.exports = router
