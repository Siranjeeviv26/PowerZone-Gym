const express = require('express')
const router = express.Router()
const SiteContent = require('../models/SiteContent')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

// GET all sections — public
router.get('/', async (req, res) => {
  try {
    const docs = await SiteContent.find()
    const result = {}
    docs.forEach((d) => { result[d.section] = d.data })
    res.json({ success: true, content: result })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET one section — public
router.get('/:section', async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ section: req.params.section })
    res.json({ success: true, data: doc?.data || {} })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT update section — admin only
router.put('/:section', protect, authorize('admin'), async (req, res) => {
  try {
    const doc = await SiteContent.findOneAndUpdate(
      { section: req.params.section },
      { $set: { data: req.body } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    res.json({ success: true, data: doc.data })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST upload image — admin only (multer-storage-cloudinary handles the upload directly)
router.post('/upload/image', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' })
    res.json({ success: true, url: req.file.path })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
