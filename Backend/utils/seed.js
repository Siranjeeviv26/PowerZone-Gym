const mongoose = require('mongoose')
require('dotenv').config()
const User = require('../models/User')
const MembershipPlan = require('../models/MembershipPlan')
const Trainer = require('../models/Trainer')

const plans = [
  { name: 'Basic', monthlyPrice: 999, yearlyPrice: 9990, color: '#4361ee', order: 1, features: ['Gym access', 'Locker room', '2 group classes/week', 'Free WiFi'] },
  { name: 'Pro', monthlyPrice: 1999, yearlyPrice: 19990, color: '#e63946', isPopular: true, order: 2, features: ['All equipment', 'Unlimited classes', '4 PT sessions/month', 'Nutrition plan', 'Progress tracking'] },
  { name: 'Elite', monthlyPrice: 3499, yearlyPrice: 34990, color: '#f4a261', order: 3, features: ['VIP locker room', 'Unlimited PT', 'Weekly nutrition consult', 'Priority booking', 'Advanced analytics'] },
]

const adminUser = { name: 'Admin User', email: 'admin@powerzone.com', password: 'admin123', role: 'admin' }
const testUser = { name: 'John Doe', email: 'user@powerzone.com', password: 'user123', role: 'user' }

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/powerzone-gym')
  console.log('Connected to MongoDB')

  await User.deleteMany({})
  await MembershipPlan.deleteMany({})
  await Trainer.deleteMany({})

  await User.create([adminUser, testUser])
  console.log('✅ Users seeded (admin@powerzone.com / admin123)')

  await MembershipPlan.create(plans)
  console.log('✅ Plans seeded')

  console.log('🌱 Database seeded successfully!')
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
