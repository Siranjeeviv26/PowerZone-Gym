const MembershipPlan = require('../models/MembershipPlan')
const User = require('../models/User')
const Payment = require('../models/Payment')

exports.getPlans = async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort('order')
    res.json({ success: true, plans })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createPlan = async (req, res) => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const {
      name, description, monthlyPrice, quarterlyPrice, halfYearlyPrice, yearlyPrice,
      features, category, isActive, order
    } = req.body

    const plan = await MembershipPlan.create({
      name,
      description,
      monthlyPrice,
      quarterlyPrice,
      halfYearlyPrice,
      yearlyPrice,
      features,
      category,
      isActive,
      order
    })
    res.status(201).json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updatePlan = async (req, res) => {
  try {
    // Whitelist allowed fields to prevent mass assignment
    const allowedUpdates = {}
    const {
      name, description, monthlyPrice, quarterlyPrice, halfYearlyPrice, yearlyPrice,
      features, category, isActive, order
    } = req.body

    if (name !== undefined) allowedUpdates.name = name
    if (description !== undefined) allowedUpdates.description = description
    if (monthlyPrice !== undefined) allowedUpdates.monthlyPrice = monthlyPrice
    if (quarterlyPrice !== undefined) allowedUpdates.quarterlyPrice = quarterlyPrice
    if (halfYearlyPrice !== undefined) allowedUpdates.halfYearlyPrice = halfYearlyPrice
    if (yearlyPrice !== undefined) allowedUpdates.yearlyPrice = yearlyPrice
    if (features !== undefined) allowedUpdates.features = features
    if (category !== undefined) allowedUpdates.category = category
    if (isActive !== undefined) allowedUpdates.isActive = isActive
    if (order !== undefined) allowedUpdates.order = order

    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, allowedUpdates, { new: true, runValidators: true })
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deletePlan = async (req, res) => {
  try {
    await MembershipPlan.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ success: true, message: 'Plan deactivated' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.uploadOffer = async (req, res) => {
  try {
    const updates = {}
    if (req.body.title !== undefined) updates['offer.title'] = req.body.title
    if (req.file) updates['offer.image'] = req.file.path
    if (req.body.startDate !== undefined) updates['offer.startDate'] = req.body.startDate || null
    if (req.body.endDate !== undefined) updates['offer.endDate'] = req.body.endDate || null
    if (req.body.isActive !== undefined) updates['offer.isActive'] = req.body.isActive === 'true' || req.body.isActive === true
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.removeOffer = async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, { $unset: { offer: '' } }, { new: true })
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json({ success: true, plan })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.purchasePlan = async (req, res) => {
  try {
    const { planId, billingCycle, paymentMethod, transactionId } = req.body

    // Validate planId
    if (!planId) return res.status(400).json({ message: 'Plan ID is required' })

    const plan = await MembershipPlan.findById(planId)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })

    // Validate plan is active
    if (!plan.isActive) return res.status(400).json({ message: 'Cannot purchase inactive plan' })

    // Validate billingCycle
    const validBillingCycles = ['monthly', 'quarterly', 'half-yearly', 'yearly']
    if (billingCycle && !validBillingCycles.includes(billingCycle)) {
      return res.status(400).json({ message: 'Invalid billing cycle' })
    }

    const billingMap = {
      monthly:      { months: 1,  priceKey: 'monthlyPrice' },
      quarterly:    { months: 3,  priceKey: 'quarterlyPrice' },
      'half-yearly':{ months: 6,  priceKey: 'halfYearlyPrice' },
      yearly:       { months: 12, priceKey: 'yearlyPrice' },
    }
    const { months, priceKey } = billingMap[billingCycle] || billingMap.monthly
    const amount = plan[priceKey] || plan.monthlyPrice

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid plan pricing' })
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + months)

    const isPending = ['cash', 'qr'].includes(paymentMethod)

    const payment = await Payment.create({
      user: req.user.id,
      plan: planId,
      amount,
      paymentMethod: paymentMethod === 'qr' ? 'upi' : paymentMethod,
      billingCycle,
      status: isPending ? 'pending' : 'success',
      transactionId: transactionId || undefined,
      startDate,
      endDate,
    })

    if (!isPending) {
      await User.findByIdAndUpdate(req.user.id, {
        'membership.plan': planId,
        'membership.startDate': startDate,
        'membership.endDate': endDate,
        'membership.status': 'active',
      })
    }

    res.status(201).json({ success: true, payment, pending: isPending })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
