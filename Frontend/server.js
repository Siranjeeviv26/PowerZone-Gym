// On Cloudflare Workers there is no .env file and vars come from Wrangler —
// dotenv is a no-op there, but never let it break module loading.
try { require('dotenv').config() } catch (_) { /* workers */ }
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { apiLimiter } = require('./middleware/rateLimit')

// True when running inside workerd rather than plain Node
const IS_WORKERS = typeof caches !== 'undefined'


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

// morgan compiles string formats with `new Function`, which workerd forbids —
// pass a plain function on Workers instead of the 'dev' format string.
const workersRequestLog = (tokens, req, res) =>
  `${tokens.method(req, res)} ${tokens.url(req, res)} ${tokens.status(req, res)} ` +
  `${tokens['response-time'](req, res)} ms`

if (process.env.NODE_ENV === 'development') app.use(morgan(IS_WORKERS ? workersRequestLog : 'dev'))

// Apply general API rate limiting
app.use('/api/', apiLimiter)

// Health check (deliberately before the DB gate so monitors can reach it)
app.get('/api/health', (_, res) => res.json({ status: 'Backend is Running', timestamp: new Date() }))

// --- Database gate -------------------------------------------------------
// Node (Render): connects once at boot in the bootstrap below.
// Workers: connects lazily on the first request. NOTE: on workerd a TCP socket
// created inside a request is tied to that request, so this connection only
// serves requests that arrive before it is torn down — a real Workers
// deployment needs Hyperdrive (connect per request) or a Durable Object.
let dbPromise = null
const ensureDb = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve()
  if (!dbPromise) {
    dbPromise = mongoose
      .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/powerzone-gym', { serverSelectionTimeoutMS: 8000 })
      .then(() => true)
      .catch((err) => {
        dbPromise = null // allow the next request to retry
        throw err
      })
  }
  return dbPromise
}

app.use(async (req, res, next) => {
  try {
    await ensureDb()
    next()
  } catch (err) {
    next(err)
  }
})
// -------------------------------------------------------------------------

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

// swagger-ui-express calls getAbsoluteFSPath() (which touches __dirname) at
// module load, so it must never be required on Workers — require it lazily
// inside this guard instead of at the top of the file.
if (!IS_WORKERS) {
  const swaggerUi = require('swagger-ui-express')
  const swaggerSpec = require('./swagger')
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'PowerZone Gym API Docs',
    customCss: '.swagger-ui .topbar { background-color: #e63946; }',
  }))
}

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

// --- Bootstrap -----------------------------------------------------------
// Under plain Node (`node server.js` / `npm start`) we connect and listen.
// Under Workers the entrypoint (worker.mjs) imports this file and calls
// app.listen() itself, so this block must not run there.
if (require.main === module) {
  ensureDb()
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
}

module.exports = app

