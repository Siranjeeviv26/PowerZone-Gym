const express = require('express')
const router = express.Router()
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.get('/', getOffers)
router.post('/', protect, authorize('admin'), upload.single('image'), createOffer)
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateOffer)
router.delete('/:id', protect, authorize('admin'), deleteOffer)

module.exports = router
