import { env } from 'cloudflare:workers'
import { httpServerHandler } from 'cloudflare:node'

// Wrangler vars and secrets must be on process.env BEFORE the CommonJS app
// loads (upload.js, mailer.js and rateLimit.js read env at module scope), so
// server.js is imported dynamically rather than with a static import.
Object.assign(process.env, env)

const { default: app } = await import('./server.js')

const PORT = 8787
const server = app.listen(PORT)

export default httpServerHandler(server)
