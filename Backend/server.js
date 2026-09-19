require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { apiLimiter } = require('./middleware/rateLimit')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')


const app = express()

// Security middleware
app.use(helmet())
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // In development, allow any localhost origin + no-origin (curl/mobile) to avoid CORS during HMR/proxy
    if (!origin) return callback(null, true)
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Apply general API rate limiting
app.use('/api/', apiLimiter)

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

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'PowerZone Gym API Docs',
  customCss: '.swagger-ui .topbar { background-color: #e63946; }',
}))

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'Backend is Running', timestamp: new Date() }))

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
    const server = app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use — another backend is running. Kill it with: netstat -ano | findstr :${PORT}  then  taskkill /PID <pid> /F  or  Stop-Process -Id <pid> -Force`)
        console.error('   Do NOT run both `node server.js` and `npm run dev` at the same time — use only one.')
        process.exit(1)
      } else {
        console.error(err)
        process.exit(1)
      }
    })
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
