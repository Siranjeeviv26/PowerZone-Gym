const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Trainer = require('../models/Trainer')
// Trainer already imported — used for client list updates on name transfer
const Payment = require('../models/Payment')
const Contact = require('../models/Contact')
const Branch = require('../models/Branch')
const NameTransfer = require('../models/NameTransfer')
const Settings = require('../models/Settings')
const WorkoutProgram = require('../models/WorkoutProgram')
const DietPlan = require('../models/DietPlan')
const { protect, authorize } = require('../middleware/auth')

router.use(protect, authorize('admin'))

router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalTrainers, totalRevenue, unreadContacts, recentUsers, recentPayments] = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      Trainer.countDocuments({ isActive: true }),
      Payment.aggregate([{ $match: { status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Contact.countDocuments({ status: 'unread' }),
      User.find({ role: 'user' }).sort('-createdAt').limit(5).select('name email membership createdAt').populate('membership.plan', 'name'),
      Payment.find().sort('-createdAt').limit(5).populate('user', 'name').populate('plan', 'name'),
    ])
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newSignups = await User.countDocuments({ createdAt: { $gte: thisMonthStart } })
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'success', createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])
    res.json({
      success: true,
      stats: { totalUsers, totalTrainers, totalRevenue: totalRevenue[0]?.total || 0, monthlyRevenue: monthlyRevenue[0]?.total || 0, unreadContacts, newSignups },
      recentUsers,
      recentPayments,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Assign personal trainer OR class trainer to a member
// type = 'personal' | 'class'
router.post('/assign-trainer', async (req, res) => {
  try {
    const { userId, trainerId, type } = req.body
    const field = type === 'class' ? 'classTrainer' : 'personalTrainer'
    const update = { [field]: trainerId || null }
    const user = await User.findByIdAndUpdate(userId, update, { new: true })
      .populate('personalTrainer', 'name speciality')
      .populate('classTrainer', 'name speciality')
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (trainerId) {
      await Trainer.findByIdAndUpdate(trainerId, { $addToSet: { clients: userId } })
    }
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Assign a member workout plan to a user (admin action during create/edit)
router.post('/assign-workout', async (req, res) => {
  try {
    const { userId, workoutPlanId } = req.body
    if (!userId || !workoutPlanId) return res.status(400).json({ message: 'userId and workoutPlanId are required' })
    const plan = await WorkoutProgram.findByIdAndUpdate(
      workoutPlanId,
      { $addToSet: { assignedTo: userId }, assignedBy: req.user.id },
      { new: true }
    )
    if (!plan) return res.status(404).json({ message: 'Workout plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Assign a diet plan to a member (admin action)
router.post('/assign-diet', async (req, res) => {
  try {
    const { userId, dietPlanId } = req.body
    if (!userId || !dietPlanId) return res.status(400).json({ message: 'userId and dietPlanId are required' })
    await DietPlan.updateMany({ assignedTo: userId }, { $pull: { assignedTo: userId } })
    const plan = await DietPlan.findByIdAndUpdate(
      dietPlanId,
      { $addToSet: { assignedTo: userId }, assignedBy: req.user.id },
      { new: true }
    )
    if (!plan) return res.status(404).json({ message: 'Diet plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Branch transfer with fee
router.post('/branch-transfer', async (req, res) => {
  try {
    const { userId, toBranchId, notes } = req.body
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const toBranch = await Branch.findById(toBranchId)
    if (!toBranch) return res.status(404).json({ message: 'Branch not found' })
    const fromBranchId = user.branch
    const settings = await Settings.getSingleton()
    const branchFeeEntry = settings.transferFees.find((f) => f.name.toLowerCase().includes('branch'))
    const fee = branchFeeEntry ? branchFeeEntry.value : 0
    user.branchTransferHistory.push({ fromBranch: fromBranchId, toBranch: toBranchId, fee, notes })
    user.branch = toBranchId
    await user.save()
    await user.populate('branch', 'name location')
    res.json({ success: true, user, fee, message: `Branch transfer completed. Fee: ₹${fee}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all transfer records across all users
router.get('/transfers', async (req, res) => {
  try {
    const users = await User.find({ 'branchTransferHistory.0': { $exists: true } })
      .select('name email branchTransferHistory')
      .populate('branchTransferHistory.fromBranch', 'name location')
      .populate('branchTransferHistory.toBranch', 'name location')
    const transfers = []
    users.forEach((u) => {
      u.branchTransferHistory.forEach((t) => {
        transfers.push({
          _id: t._id,
          userId: u._id,
          userName: u.name,
          userEmail: u.email,
          fromBranch: t.fromBranch,
          toBranch: t.toBranch,
          fee: t.fee,
          date: t.date,
          notes: t.notes,
        })
      })
    })
    transfers.sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json({ success: true, transfers })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Delete a specific transfer record
router.delete('/transfers/:userId/:transferId', async (req, res) => {
  try {
    const { userId, transferId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    const idx = user.branchTransferHistory.findIndex((t) => t._id.toString() === transferId)
    if (idx === -1) return res.status(404).json({ message: 'Transfer record not found' })
    user.branchTransferHistory.splice(idx, 1)
    await user.save()
    res.json({ success: true, message: 'Transfer record deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Transfer settings (name transfer fee)
router.get('/transfer-settings', async (req, res) => {
  try {
    const settings = await Settings.getSingleton()
    const branches = await Branch.find().select('name location transferFee')
    res.json({ success: true, nameTransferFee: settings.nameTransferFee, branches })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/transfer-settings', async (req, res) => {
  try {
    const settings = await Settings.getSingleton()
    if (req.body.nameTransferFee !== undefined) settings.nameTransferFee = Number(req.body.nameTransferFee)
    await settings.save()
    res.json({ success: true, nameTransferFee: settings.nameTransferFee })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Name Transfers
router.get('/name-transfers', async (req, res) => {
  try {
    const transfers = await NameTransfer.find()
      .populate('fromUser', 'name email regNo')
      .populate('toUser', 'name email regNo')
      .populate('membershipPlan', 'name')
      .sort('-date')
    res.json({ success: true, transfers })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/name-transfer', async (req, res) => {
  try {
    const { fromUserId, toUserId, fee, notes, transferMembership } = req.body
    if (!fromUserId || !toUserId) return res.status(400).json({ message: 'Both members are required' })
    if (fromUserId === toUserId) return res.status(400).json({ message: 'Cannot transfer to the same member' })

    const fromUser = await User.findById(fromUserId).populate('membership.plan')
    const toUser = await User.findById(toUserId)
    if (!fromUser || !toUser) return res.status(404).json({ message: 'Member not found' })

    const planId = fromUser.membership?.plan?._id

    const transfer = await NameTransfer.create({
      fromUser: fromUserId,
      toUser: toUserId,
      membershipPlan: planId,
      fee: fee || 0,
      notes,
      transferMembership: !!transferMembership,
    })

    // Always transfer trainer assignments with name transfer
    if (fromUser.personalTrainer) {
      toUser.personalTrainer = fromUser.personalTrainer
      await Trainer.findByIdAndUpdate(fromUser.personalTrainer, { $addToSet: { clients: toUserId } })
      await Trainer.findByIdAndUpdate(fromUser.personalTrainer, { $pull: { clients: fromUserId } })
      fromUser.personalTrainer = undefined
    }
    if (fromUser.classTrainer) {
      toUser.classTrainer = fromUser.classTrainer
      await Trainer.findByIdAndUpdate(fromUser.classTrainer, { $addToSet: { clients: toUserId } })
      await Trainer.findByIdAndUpdate(fromUser.classTrainer, { $pull: { clients: fromUserId } })
      fromUser.classTrainer = undefined
    }

    if (transferMembership && planId) {
      toUser.membership = {
        plan: planId,
        status: fromUser.membership.status,
        package: fromUser.membership.package,
        joiningDate: fromUser.membership.joiningDate,
        paymentDate: new Date(),
        nextPaymentDate: fromUser.membership.nextPaymentDate,
      }
      fromUser.membership.status = 'expired'
      fromUser.membership.plan = undefined
    }

    await Promise.all([fromUser.save(), toUser.save()])

    await transfer.populate([
      { path: 'fromUser', select: 'name email regNo' },
      { path: 'toUser', select: 'name email regNo' },
      { path: 'membershipPlan', select: 'name' },
    ])
    res.status(201).json({ success: true, transfer })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/name-transfers/:id', async (req, res) => {
  try {
    await NameTransfer.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Transfer record deleted' })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

// Transfer Fee Items CRUD
router.get('/transfer-fees', async (req, res) => {
  try {
    const settings = await Settings.getSingleton()
    res.json({ success: true, fees: settings.transferFees || [] })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.post('/transfer-fees', async (req, res) => {
  try {
    const { name, value } = req.body
    if (!name?.trim()) return res.status(400).json({ message: 'Fee name is required' })
    const settings = await Settings.getSingleton()
    settings.transferFees.push({ name: name.trim(), value: Number(value) || 0 })
    await settings.save()
    res.status(201).json({ success: true, fees: settings.transferFees })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.put('/transfer-fees/:id', async (req, res) => {
  try {
    const { name, value } = req.body
    const settings = await Settings.getSingleton()
    const fee = settings.transferFees.id(req.params.id)
    if (!fee) return res.status(404).json({ message: 'Fee not found' })
    if (name !== undefined) fee.name = name.trim()
    if (value !== undefined) fee.value = Number(value)
    await settings.save()
    res.json({ success: true, fees: settings.transferFees })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

router.delete('/transfer-fees/:id', async (req, res) => {
  try {
    const settings = await Settings.getSingleton()
    settings.transferFees.pull({ _id: req.params.id })
    await settings.save()
    res.json({ success: true, fees: settings.transferFees })
  } catch (err) { res.status(500).json({ message: err.message }) }
})

module.exports = router
