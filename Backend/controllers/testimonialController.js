const Testimonial = require('../models/Testimonial')

// Public — active testimonials only
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort('-featured -createdAt')
    res.json({ success: true, testimonials })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Admin — all testimonials
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort('-createdAt')
    res.json({ success: true, testimonials })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createTestimonial = async (req, res) => {
  try {
    const { name, role, rating, text, result, featured, isActive } = req.body
    const image = req.file ? req.file.path : (req.body.image || '')
    const testimonial = await Testimonial.create({ name, role, image, rating, text, result, featured, isActive })
    res.status(201).json({ success: true, testimonial })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.updateTestimonial = async (req, res) => {
  try {
    const { name, role, rating, text, result, featured, isActive } = req.body
    const update = { name, role, rating, text, result, featured, isActive }
    if (req.file) update.image = req.file.path
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' })
    res.json({ success: true, testimonial })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
