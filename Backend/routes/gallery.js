const express = require('express')
const router = express.Router()
const Gallery = require('../models/Gallery')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

router.get('/', async (req, res) => {
  try {
    const { category, admin } = req.query
    const query = admin === 'true' ? { isActive: true } : { isActive: true, showOnSite: true }
    if (category && category !== 'All') query.category = category
    const images = await Gallery.find(query).sort('-createdAt')
    res.json({ success: true, images })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const image = await Gallery.create({
      ...req.body,
      imageUrl: req.file?.path || req.body.imageUrl,
      cloudinaryId: req.file?.filename,
      uploadedBy: req.user.id,
    })
    res.status(201).json({ success: true, image })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!image) return res.status(404).json({ message: 'Image not found' })
    res.json({ success: true, image })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Gallery.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Image removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
