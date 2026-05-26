const Offer = require('../models/Offer')

exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort('-createdAt')
    res.json({ success: true, offers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createOffer = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Offer image is required' })
    const offer = await Offer.create({
      title: req.body.title,
      image: req.file.path,
      description: req.body.description || '',
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
    })
    res.status(201).json({ success: true, offer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateOffer = async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description || '',
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      isActive: req.body.isActive === 'true' || req.body.isActive === true,
    }
    if (req.file) updates.image = req.file.path
    const offer = await Offer.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!offer) return res.status(404).json({ message: 'Offer not found' })
    res.json({ success: true, offer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id)
    if (!offer) return res.status(404).json({ message: 'Offer not found' })
    res.json({ success: true, message: 'Offer deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
