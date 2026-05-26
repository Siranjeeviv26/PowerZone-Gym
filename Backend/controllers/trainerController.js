const Trainer = require('../models/Trainer')
const User = require('../models/User')
const DietPlan = require('../models/DietPlan')
const WorkoutProgram = require('../models/WorkoutProgram')

exports.getAllTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find({ isActive: true })
      .populate('branch', 'name location')
      .populate('reviews.user', 'name avatar')
      .sort('-createdAt')
    res.json({ success: true, trainers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getTrainer = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('branch', 'name location')
      .populate('reviews.user', 'name avatar')
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' })
    res.json({ success: true, trainer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createTrainer = async (req, res) => {
  try {
    const { name, email, password, phone, speciality, bio, experience, branch } = req.body

    // Check if a user account already exists for this email
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'A user with this email already exists' })

    // Create the login User account for the trainer
    const userAccount = await User.create({
      name,
      email,
      password: password || 'trainer123',
      phone,
      role: 'trainer',
    })

    // Auto-generate trainerId
    const trainerCount = await Trainer.countDocuments()
    const trainerId = 'TRN' + String(trainerCount + 1).padStart(4, '0')

    // Create the Trainer profile linked to the User account
    const trainer = await Trainer.create({
      trainerId,
      name, email, phone, speciality, bio,
      experience: experience ? Number(experience) : undefined,
      branch: branch || undefined,
      image: req.file?.path || '',
      user: userAccount._id,
    })

    res.status(201).json({ success: true, trainer, loginEmail: email, defaultPassword: password ? undefined : 'trainer123' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateTrainer = async (req, res) => {
  try {
    const updates = { ...req.body }
    if (req.file) updates.image = req.file.path
    const trainer = await Trainer.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('branch', 'name location')
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' })
    res.json({ success: true, trainer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteTrainer = async (req, res) => {
  try {
    await Trainer.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Trainer removed' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addReview = async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' })
    const existing = trainer.reviews.find((r) => r.user?.toString() === req.user.id)
    if (existing) {
      existing.rating = req.body.rating
      existing.comment = req.body.comment
    } else {
      trainer.reviews.push({ user: req.user.id, ...req.body })
    }
    trainer.updateRating()
    await trainer.save()
    res.json({ success: true, trainer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer self-service: get own profile
exports.getMyProfile = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id })
      .populate('branch', 'name location')
      .populate('clients', 'name email phone membership')
      .populate('reviews.user', 'name avatar')
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    res.json({ success: true, trainer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer self-service: update own profile (phone, bio, image)
exports.updateMyProfile = async (req, res) => {
  try {
    const updates = {}
    if (req.body.phone !== undefined) updates.phone = req.body.phone
    if (req.body.bio !== undefined) updates.bio = req.body.bio
    if (req.body.socialLinks !== undefined) updates.socialLinks = req.body.socialLinks
    if (req.file) updates.image = req.file.path
    const trainer = await Trainer.findOneAndUpdate({ user: req.user.id }, updates, { new: true })
      .populate('branch', 'name location').populate('clients', 'name email phone membership')
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    // Keep User.avatar in sync with Trainer.image
    if (req.file) await User.findByIdAndUpdate(req.user.id, { avatar: req.file.path })
    res.json({ success: true, trainer })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer: get clients assigned to them (as personal OR class trainer)
exports.getMyClients = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id })
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    const clients = await User.find({
      $or: [{ personalTrainer: trainer._id }, { classTrainer: trainer._id }],
      isActive: true,
    })
      .populate('membership.plan', 'name monthlyPrice')
      .populate('branch', 'name')
      .populate('personalTrainer', 'name')
      .populate('classTrainer', 'name')
      .select('name email phone goal membership branch attendance progress createdAt personalTrainer classTrainer')
    // Tag each client with their trainer relationship
    const tagged = clients.map((c) => {
      const obj = c.toObject()
      obj.trainerRole = c.personalTrainer?._id?.toString() === trainer._id.toString() ? 'Personal Trainer' : 'Class Trainer'
      return obj
    })
    res.json({ success: true, clients: tagged })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer: mark attendance for a client
exports.markClientAttendance = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id })
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    const client = await User.findOne({ _id: req.params.userId, $or: [{ personalTrainer: trainer._id }, { classTrainer: trainer._id }] })
    if (!client) return res.status(403).json({ message: 'Client not under your supervision' })
    const { duration, workoutType, notes } = req.body
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const alreadyDone = client.attendance.some((a) => { const d = new Date(a.date); d.setHours(0, 0, 0, 0); return d.getTime() === today.getTime() })
    if (alreadyDone) return res.status(400).json({ message: 'Attendance already marked for today' })
    client.attendance.push({ date: new Date(), duration, workoutType, notes })
    await client.save()
    res.json({ success: true, attendance: client.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer: assign diet plan to client
exports.assignDietPlan = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id })
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    const client = await User.findOne({ _id: req.params.userId, $or: [{ personalTrainer: trainer._id }, { classTrainer: trainer._id }] })
    if (!client) return res.status(403).json({ message: 'Client not under your supervision' })

    // Remove client from any previous diet plan
    await DietPlan.updateMany({ assignedTo: client._id }, { $pull: { assignedTo: client._id } })

    let plan
    if (req.body.planId) {
      // Assign existing plan
      plan = await DietPlan.findByIdAndUpdate(req.body.planId, { $addToSet: { assignedTo: client._id }, assignedBy: trainer._id }, { new: true })
    } else {
      // Create new plan and assign
      plan = await DietPlan.create({ ...req.body, assignedTo: [client._id], assignedBy: trainer._id, createdBy: req.user.id })
    }
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer: assign workout plan to client
exports.assignWorkoutPlan = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id })
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    const client = await User.findOne({ _id: req.params.userId, $or: [{ personalTrainer: trainer._id }, { classTrainer: trainer._id }] })
    if (!client) return res.status(403).json({ message: 'Client not under your supervision' })

    await WorkoutProgram.updateMany({ assignedTo: client._id }, { $pull: { assignedTo: client._id } })

    let plan
    if (req.body.planId) {
      plan = await WorkoutProgram.findByIdAndUpdate(req.body.planId, { $addToSet: { assignedTo: client._id }, assignedBy: trainer._id }, { new: true })
    } else {
      plan = await WorkoutProgram.create({ ...req.body, trainer: trainer._id, assignedTo: [client._id], assignedBy: trainer._id })
    }
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Trainer: get a specific client's full details
exports.getClientDetail = async (req, res) => {
  try {
    const trainer = await Trainer.findOne({ user: req.user.id })
    if (!trainer) return res.status(404).json({ message: 'Trainer profile not found' })
    const client = await User.findOne({ _id: req.params.userId, $or: [{ personalTrainer: trainer._id }, { classTrainer: trainer._id }] })
      .populate('membership.plan', 'name monthlyPrice').populate('branch', 'name')
    if (!client) return res.status(403).json({ message: 'Client not under your supervision' })
    const dietPlan = await DietPlan.findOne({ assignedTo: client._id, isActive: true })
    const workoutPlan = await WorkoutProgram.findOne({ assignedTo: client._id, isActive: true })
    res.json({ success: true, client, dietPlan, workoutPlan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
