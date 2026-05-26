const User = require('../models/User')
const DietPlan = require('../models/DietPlan')
const WorkoutProgram = require('../models/WorkoutProgram')

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('membership.plan')
    .populate('branch')
    .populate('personalTrainer', 'name speciality image email phone trainerId')
    .populate('classTrainer', 'name speciality image email phone trainerId')
  res.json({ success: true, user })
}

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, goal, socialLinks } = req.body
    const user = await User.findByIdAndUpdate(req.user.id, { name, phone, goal, socialLinks }, { new: true, runValidators: true })
      .populate('membership.plan').populate('branch')
      .populate('personalTrainer', 'name speciality image trainerId')
      .populate('classTrainer', 'name speciality image trainerId')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' })
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: req.file.path }, { new: true })
      .populate('membership.plan').populate('branch')
      .populate('personalTrainer', 'name speciality image trainerId')
      .populate('classTrainer', 'name speciality image trainerId')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.checkIn = async (req, res) => {
  try {
    const { duration, workoutType, notes } = req.body
    const user = await User.findById(req.user.id)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const alreadyCheckedIn = user.attendance.some((a) => {
      const d = new Date(a.date)
      d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
    if (alreadyCheckedIn) return res.status(400).json({ message: 'Already checked in today' })
    user.attendance.push({ date: new Date(), duration, workoutType, notes })
    await user.save()
    res.json({ success: true, attendance: user.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('attendance')
    res.json({ success: true, attendance: user.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.logWeight = async (req, res) => {
  try {
    const { weight, bodyFat, muscleMass, notes } = req.body
    const user = await User.findById(req.user.id)
    user.progress.push({ date: new Date(), weight, bodyFat, muscleMass, notes })
    await user.save()
    res.json({ success: true, progress: user.progress })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('progress')
    res.json({ success: true, progress: user.progress.sort((a, b) => new Date(b.date) - new Date(a.date)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.progress = user.progress.filter((p) => p._id.toString() !== req.params.id)
    await user.save()
    res.json({ success: true, progress: user.progress.sort((a, b) => new Date(b.date) - new Date(a.date)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const entry = user.progress.id(req.params.id)
    if (!entry) return res.status(404).json({ message: 'Progress entry not found' })
    if (req.body.notes !== undefined) entry.notes = req.body.notes
    await user.save()
    res.json({ success: true, progress: user.progress.sort((a, b) => new Date(b.date) - new Date(a.date)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMyDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findOne({ assignedTo: req.user.id, isActive: true })
      .populate('assignedBy', 'name speciality')
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMyWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutProgram.findOne({ assignedTo: req.user.id, isActive: true })
      .populate('trainer', 'name speciality image')
      .populate('assignedBy', 'name speciality')
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, phone } = req.query
    const query = { role: 'user' }
    if (search) {
      const phoneQuery = search.replace(/[\s\-().+]/g, '')
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        ...(phoneQuery.length >= 4 ? [{ phone: { $regex: phoneQuery, $options: 'i' } }] : []),
      ]
    }
    if (phone) query.phone = { $regex: phone, $options: 'i' }
    if (status) query['membership.status'] = status
    const users = await User.find(query)
      .limit(Number(limit)).skip((page - 1) * Number(limit))
      .populate('membership.plan')
      .populate('branch', 'name')
      .populate('personalTrainer', 'name speciality')
      .populate('classTrainer', 'name speciality')
      .populate('referredBy', 'name phone email')
      .sort('-createdAt')
    const total = await User.countDocuments(query)
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, goal, membership, referredBy, branch } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })
    const count = await User.countDocuments({ role: 'user' })
    const regNo = `GYM${String(count + 1).padStart(4, '0')}`
    const user = await User.create({
      regNo, name, email, password: password || 'changeme123', phone, goal,
      role: 'user',
      membership: membership || {},
      referredBy: referredBy || undefined,
      branch: branch || undefined,
    })
    user.password = undefined
    res.status(201).json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { name, phone, goal, role, isActive, membership, branch, personalTrainer, referredBy } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, goal, role, isActive, membership, branch, personalTrainer, referredBy: referredBy || undefined },
      { new: true, runValidators: true }
    ).populate('membership.plan').populate('branch', 'name').populate('personalTrainer', 'name speciality').populate('referredBy', 'name phone email')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addAttendance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.attendance.push(req.body)
    await user.save()
    res.json({ success: true, attendance: user.attendance })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.addProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    user.progress.push(req.body)
    await user.save()
    res.json({ success: true, progress: user.progress })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
