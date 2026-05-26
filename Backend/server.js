const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/trainers', require('./routes/trainers'))
app.use('/api/plans', require('./routes/plans'))
app.use('/api/gallery', require('./routes/gallery'))
app.use('/api/contact', require('./routes/contact'))
app.use('/api/workouts', require('./routes/workouts'))
app.use('/api/diet', require('./routes/diet'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/branches', require('./routes/branches'))
app.use('/api/settings', require('./routes/settings'))
app.use('/api/legal', require('./routes/legal'))
app.use('/api/activities', require('./routes/activities'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/testimonials', require('./routes/testimonials'))
app.use('/api/site-content', require('./routes/siteContent'))
app.use('/api/v1', require('./routes/masterData'))
app.use('/api/offers', require('./routes/offers'))

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'OK', timestamp: new Date() }))

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/powerzone-gym')
  .then(() => {
    console.log('✅ MongoDB connected')
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
