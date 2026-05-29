# PowerZone Gym — Developer Work Guide

Everything you need to work on this codebase without breaking things.

---

## 1. How the Stack Connects

```
Browser (React/Vite :3000)
    │
    │  Axios (src/utils/api.js) — auto-attaches JWT
    ▼
Express Server (:5000)
    │  protect middleware reads JWT → attaches req.user
    │  authorize middleware checks req.user.role
    ▼
MongoDB (powerzone-gym)  ←→  Cloudinary (all images/videos)
```

The frontend never stores images locally. Every file upload goes to Cloudinary and the returned HTTPS URL is saved in MongoDB.

---

## 2. Authentication Flow

### Login
1. `POST /api/auth/login` → backend returns `{ token, user }`
2. Token + user object saved to `localStorage` + Redux state (`authSlice`)
3. All subsequent API calls include `Authorization: Bearer <token>` (injected by `api.js` interceptor)

### Trainer login special case
When a trainer logs in with no `user.avatar`, the login handler automatically fetches `Trainer.image` and injects it into the response `user.avatar` — so the Navbar shows their photo from the first login.

### Accessing auth on the frontend
```js
const { user, token } = useSelector((s) => s.auth)
```

### Updating the Redux user (e.g. after avatar upload)
```js
import { setUser } from '../store/slices/authSlice'
dispatch(setUser(updatedUserObject))
// also persists to localStorage automatically
```

### All auth actions available
| Action | Type | Notes |
|---|---|---|
| `loginUser(credentials)` | Thunk | POST /auth/login |
| `registerUser(userData)` | Thunk | POST /auth/register |
| `updateProfile(data)` | Thunk | PUT /users/profile |
| `logout()` | Reducer | Clears state + localStorage |
| `setUser(userObj)` | Reducer | Sync any user update + localStorage |
| `clearError()` | Reducer | Clears error state |

---

## 3. Password Reset Flow

1. User submits email → `POST /api/auth/forgot-password`
2. Backend generates 32-byte raw token via `crypto.randomBytes(32)`
3. SHA-256 hash of token stored in `user.resetPasswordToken`, expiry in `user.resetPasswordExpire` (1 hour)
4. Raw token sent in branded HTML email as `<FRONTEND_URL>/reset-password/<rawToken>`
5. **Dev fallback:** if `EMAIL_USER`/`EMAIL_PASS` are not configured, the API response includes `resetUrl` directly
6. User submits new password → `POST /api/auth/reset-password/:token`
7. Backend hashes the URL token, queries `{ resetPasswordToken: hash, resetPasswordExpire: { $gt: now } }`
8. On match: sets new password, clears token fields, returns new JWT

---

## 4. Dynamic Theme System

### How it works end-to-end

```
Admin saves colors (hex) → PUT /api/site-content/theme
ThemeContext fetches theme on app load → converts hex to RGB channels
→ writes to document.documentElement CSS custom properties
→ Tailwind reads the variables for all color utilities
```

### CSS variables set
```css
--color-primary: 230 57 70;         /* rgb format for Tailwind opacity support */
--color-primary-dark: 193 18 31;
--color-primary-light: 255 107 107;
--color-secondary: 244 162 97;
```

### Why RGB channels, not hex?
Tailwind's opacity modifiers (e.g. `bg-primary/20`) inject `<alpha-value>` into the color.
This only works with the `rgb(R G B / <alpha-value>)` format — not hex strings.

### Using theme colors in components
```jsx
// Tailwind classes (recommended)
className="bg-primary text-white border border-primary/20 hover:bg-primary-dark"

// Inline style (when dynamic value is needed)
style={{ backgroundColor: 'rgb(var(--color-primary))' }}
style={{ color: `rgb(var(--color-primary) / 0.5)` }}
```

### Available Tailwind color tokens
| Token | Maps to |
|---|---|
| `primary` | `--color-primary` |
| `primary-dark` | `--color-primary-dark` |
| `primary-light` | `--color-primary-light` |
| `secondary` | `--color-secondary` |
| `dark` | `#0a0a0a` |
| `dark-100` | `#111111` |
| `dark-200` | `#161616` |
| `dark-300` | `#1a1a1a` |
| `dark-400` | `#222222` |
| `dark-500` | `#2a2a2a` |

---

## 5. Site Content (Dynamic Page Text)

Any public page text editable by the admin uses the `SiteContent` system.

### Architecture
1. `SiteContentContext` fetches `GET /api/site-content` once on app load → caches all sections
2. Pages use the `useSiteContent(sectionKey, DEFAULTS)` hook
3. If a key isn't in the DB yet, `DEFAULTS` values are used as fallback

### Using it in a page
```jsx
import { useSiteContent } from '../context/SiteContentContext'

const DEFAULTS = {
  headline: 'Default Headline',
  subtitle: 'Default subtitle text',
  bgImage: '',
}

export default function MyPage() {
  const c = useSiteContent('my_section_key', DEFAULTS)
  return (
    <div style={{ backgroundImage: c.bgImage ? `url(${c.bgImage})` : undefined }}>
      <h1>{c.headline}</h1>
      <p>{c.subtitle}</p>
    </div>
  )
}
```

### Adding a new editable section

**Backend:** No changes needed — the `PUT /api/site-content/:section` route accepts any JSON.

**Frontend (admin):** Add editor fields in `ManageContent.jsx` under the relevant tab.

**Frontend (page):** Add the section key + `DEFAULTS` + `useSiteContent()` in the page component.

### Section keys currently in use
`home_hero` | `home_about` | `home_stats` | `home_features` | `about_hero` | `about_story` | `about_values` | `about_milestones` | `about_team` | `page_login` | `page_register` | `page_forgot` | `theme` | `navbar`

---

## 6. Image Uploads (Cloudinary)

All uploads use `backend/middleware/upload.js` which configures `multer-storage-cloudinary`.

### Three storage configs

| Export | Folder | For |
|---|---|---|
| `upload` (default) | `powerzone-gym/images` | All image uploads |
| `upload.uploadVideo` | `powerzone-gym/videos` | Video uploads |
| `upload.uploadAny` | auto-detect | Mixed image+video |

### Adding an upload endpoint (backend)
```js
const upload = require('../middleware/upload')

// Single image field named "image"
router.post('/my-route', protect, upload.single('image'), async (req, res) => {
  const imageUrl = req.file.path   // full Cloudinary HTTPS URL
  await MyModel.create({ image: imageUrl })
  res.json({ success: true, url: imageUrl })
})
```

### Calling from frontend
```js
const fd = new FormData()
fd.append('image', fileInputRef.current.files[0])

const { data } = await api.post('/my-route', fd, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
// data.url = Cloudinary URL
```

### Image file limits
- Max size: 5 MB (images), 100 MB (videos)
- Allowed image formats: jpg, jpeg, png, webp, gif
- Auto transformation: max 1200px wide, quality auto, format auto

---

## 7. Trainer vs User Profile Images

Trainers have **two separate image fields** in different models:

| Field | Model | Used by |
|---|---|---|
| `User.avatar` | User | Public Navbar, Redux state |
| `Trainer.image` | Trainer | Trainer profile cards, Trainer Dashboard header |

### Sync rules implemented

**On login (`authController.login`):**
If `user.role === 'trainer'` and `user.avatar` is empty → fetches `Trainer.image` → injects into login response. No extra client-side call needed.

**On trainer profile image upload (`trainerController.updateMyProfile`):**
After saving `Trainer.image`, also writes the same URL to `User.avatar` via:
```js
await User.findByIdAndUpdate(req.user.id, { avatar: req.file.path })
```

**On the frontend (`TrainerDashboard.jsx`):**
After upload response, also dispatches:
```js
dispatch(setUser({ ...user, avatar: data.trainer.image }))
```

This triple-sync ensures the Navbar, Redux, localStorage, and both DB fields all stay consistent.

---

## 8. Adding a New Backend Route

```js
// backend/routes/myFeature.js
const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')

router.get('/', myController.getAll)                              // public
router.post('/', protect, authorize('admin'), myController.create)  // admin only
router.put('/:id', protect, authorize('trainer', 'admin'), myController.update)
router.delete('/:id', protect, authorize('admin'), myController.remove)

module.exports = router
```

Mount in `backend/server.js`:
```js
app.use('/api/my-feature', require('./routes/myFeature'))
```

Call from frontend:
```js
const { data } = await api.get('/my-feature')
await api.post('/my-feature', { name: 'test' })
```

---

## 9. Adding a New Admin Page

### Step 1 — Create the page
Copy the sidebar block from any existing admin page. The sidebar `navItems` array is defined at the top — add your entry there.

`frontend/src/pages/admin/ManageMyFeature.jsx`:
```jsx
import { AdminLayout } from './AdminDashboard'
// or copy-paste the full sidebar pattern from any existing admin page
```

### Step 2 — Register in `App.jsx`
```jsx
import ManageMyFeature from './pages/admin/ManageMyFeature'

// Inside <Routes>:
<Route path="admin/my-feature" element={<AdminRoute><ManageMyFeature /></AdminRoute>} />
```

### Step 3 — Add the nav item to ALL admin pages
Every admin page has its own `navItems` array (not a shared component). Add your entry to each of the 17 admin pages:

```js
{ to: '/admin/my-feature', label: 'My Feature', icon: FaYourIcon },
```

Also add the icon to the import block at the top of each file.

---

## 10. Master Data System

A generic dropdown option store with `type` + `code` + `label.en` structure.

### Currently used types
| Type | Used for |
|---|---|
| `plan` | Membership duration options (Monthly, Quarterly, etc.) |
| `workout` | Workout category options |
| `diet` | Diet goal options |

### Fetching in a component
```js
const { data } = await api.get('/v1/master?type=plan')
// Returns: [{ code: 'MONTHLY', label: { en: 'Monthly' }, isActive: true }, ...]
```

### Using in a `<select>` dropdown
```jsx
<select value={selected} onChange={(e) => setSelected(e.target.value)}>
  <option value="">Select option</option>
  {masterItems.map((item) => (
    <option key={item.code} value={item.code}>
      {item.label?.en || item.code}
    </option>
  ))}
</select>
```

### Adding a new type
1. Go to `/admin/master-data`
2. Data is created per-type via the existing form
3. To add a new TYPE TAB, add an entry to the `TYPES` array in `ManageMasterData.jsx`

---

## 11. Form Validation

`frontend/src/utils/validate.js` provides a lightweight validation system.

```js
import { validate, positiveNum, fieldClass } from '../utils/validate'

// Define rules
const RULES = {
  name:     [(v) => !v && 'Name is required'],
  email:    [(v) => !v && 'Required', (v) => !/\S+@\S+/.test(v) && 'Invalid email'],
  duration: [positiveNum('Duration')],   // must be a positive number
}

// Run validation
const errors = validate(form, RULES)
if (Object.keys(errors).length) { setErrors(errors); return }

// In JSX
<input className={fieldClass(errors, 'name', 'input-field')} />
<p className="text-red-400 text-xs mt-1">{errors.name}</p>
```

`fieldClass(errors, field, baseClass)` — appends `border-red-500` to `baseClass` if the field has an error.

---

## 12. Frontend API Utility

`frontend/src/utils/api.js` is a pre-configured Axios instance.

```js
import api from '../utils/api'

const { data } = await api.get('/users')                          // GET
const { data } = await api.get('/users', { params: { role: 'trainer' } })  // GET with query params
const { data } = await api.post('/auth/login', { email, password })        // POST JSON
const { data } = await api.put('/users/profile', { name: 'John' })         // PUT JSON
await api.delete(`/gallery/${id}`)                                          // DELETE

// File upload
const fd = new FormData()
fd.append('image', file)
const { data } = await api.post('/gallery', fd, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

The JWT is automatically attached from `localStorage` on every request. If a 401 is returned, the user is NOT automatically logged out — handle that manually in your component if needed.

---

## 13. Route Protection

### Backend
```js
const { protect, authorize } = require('../middleware/auth')

router.get('/public')                                    // no middleware = public
router.get('/any-user', protect, handler)                // any logged-in user
router.get('/trainer-or-admin', protect, authorize('trainer', 'admin'), handler)
router.get('/admin-only', protect, authorize('admin'), handler)
```

### Frontend
```jsx
// Any logged-in user (redirects to /login if not authenticated)
<Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

// Trainer role only
<Route path="trainer" element={<TrainerRoute><TrainerDashboard /></TrainerRoute>} />

// Admin role only
<Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
```

### Hiding Navbar/Footer on specific pages

In `Layout.jsx`, the `isAdmin` variable controls whether Navbar and Footer render.
Auth pages and dashboards are added to this check so they don't show the public nav:
```js
const isAdmin = pathname.startsWith('/admin')
  || pathname === '/trainer'
  || pathname === '/dashboard'
  || pathname === '/login'
  || pathname === '/register'
  || pathname === '/forgot-password'
  || pathname.startsWith('/reset-password')
```

---

## 14. Notifications System

Notifications are created server-side (e.g., when a new activity is created) and fetched by the client.

### Reading notifications (frontend)
```js
const { data } = await api.get('/notifications')
const unread = data.notifications.filter((n) => !n.isRead).length
```

### Marking as read
```js
await api.put('/notifications/mark-all-read')
await api.put(`/notifications/${id}/read`)
```

### The `NotificationBell` component
Located at `src/components/shared/NotificationBell.jsx` — drop it anywhere in a header to show the bell icon with unread count badge.

---

## 15. Mongoose Upsert Warning (Mongoose 7)

When doing a `findOneAndUpdate` with `upsert: true`, always use `{ $set: { ... } }` instead of a plain object:

```js
// WRONG — acts as a replacement document, drops required fields
await SiteContent.findOneAndUpdate({ section }, { data: req.body }, { upsert: true })

// CORRECT
await SiteContent.findOneAndUpdate({ section }, { $set: { data: req.body } }, { upsert: true, new: true })
```

This affects every upsert in `siteContent.js`. The bug causes the `section` (required field) to be dropped on first insert.

---

## 16. Footer Social Media Visibility Toggles

Each social media platform (Facebook, Instagram, Twitter, YouTube) has a boolean flag that controls whether its icon appears on the public site footer.

### How it works end-to-end

```
Admin toggles eye icon in /admin/footer
    → form state: showFacebook / showInstagram / showTwitter / showYoutube
    → PUT /api/settings/footer saves all fields to FooterSettings
    → Public Footer.jsx fetches GET /api/settings/footer on load
    → socials array filters out platforms where showXxx === false
    → icon is not rendered on the public site
```

### Relevant files

| File | Role |
|---|---|
| `backend/models/FooterSettings.js` | Defines Boolean fields with `default: true` |
| `frontend/src/pages/admin/ManageFooter.jsx` | Eye/EyeSlash toggle buttons, `showXxx` in form state |
| `frontend/src/components/layout/Footer.jsx` | Reads `showXxx` flags, filters socials array |

### Key pattern in Footer.jsx
```js
const socials = [
  settings.showFacebook && { icon: FaFacebook, href: settings.facebook },
  settings.showInstagram && { icon: FaInstagram, href: settings.instagram },
  settings.showTwitter && { icon: FaTwitter, href: settings.twitter },
  settings.showYoutube && { icon: FaYoutube, href: settings.youtube },
].filter(Boolean)
```
`&&` short-circuits to `false` when hidden; `.filter(Boolean)` removes the falsy entries.

### Mongoose strict mode caveat
Mongoose silently discards fields that are not defined in the schema. If you add new settings fields, **always add them to `FooterSettings.js` first** — otherwise `PUT /settings/footer` will appear to succeed but the new fields will never be stored.

---

## 17. Custom Tailwind Classes Reference

| Class | Description |
|---|---|
| `btn-primary` | Filled primary-color button with hover scale |
| `btn-secondary` | Secondary-color button |
| `glass-card` | Dark card with subtle border and background |
| `input-field` | Styled dark-theme form input |
| `bg-dark` | Main page background (`#0a0a0a`) |
| `bg-dark-100` | Sidebar / header panel |
| `bg-dark-200` | Table header / slightly lighter panel |
| `bg-dark-300` | Card inner sections |
| `bg-dark-400` | Border and divider color |
| `bg-dark-500` | Deepest border / inactive |
| `text-primary` | Primary accent color text |
| `text-secondary` | Secondary accent color text |
| `bg-primary/20` | Primary at 20% opacity |
| `border-primary/20` | Primary border at 20% opacity |
| `glow-red` | Box shadow using primary color (legacy name) |

---

## 18. Deployment Checklist

### Backend → Render (Web Service)

| Field | Value |
|---|---|
| Source repo | `github.com/Siranjeeviv26/PowerZone-Gym-backend` |
| Root Directory | `Backend` (capital B — files live in a subfolder) |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Region | Singapore |

**Environment Variables to set in Render dashboard:**

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://<user>:<pass>@cluster0.../powerzone-gym?appName=Cluster0` |
| `JWT_SECRET` | your secret key |
| `JWT_EXPIRE` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | your Cloudinary name |
| `CLOUDINARY_API_KEY` | your Cloudinary key |
| `CLOUDINARY_API_SECRET` | your Cloudinary secret |
| `FRONTEND_URL` | `https://power-zone-gym-frontend.vercel.app` |
| `EMAIL_SERVICE` | `gmail` |
| `EMAIL_USER` | your Gmail address |
| `EMAIL_PASS` | your Gmail app password |

> Do **NOT** set `PORT` — Render injects it automatically.

**Live backend URL:** `https://powerzone-gym-backend.onrender.com`

---

### Frontend → Vercel

| Field | Value |
|---|---|
| Source repo | your frontend GitHub repo |
| Root Directory | `Frontend` (capital F) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

**Environment Variable in Vercel dashboard:**

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://powerzone-gym-backend.onrender.com/api` |

**`vercel.json`** (required for React Router — must be in the `Frontend/` folder):
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Live frontend URL:** `https://power-zone-gym-frontend.vercel.app`

---

### MongoDB Atlas
- [ ] Network Access → Add IP → Allow from Anywhere (`0.0.0.0/0`) — required for Render (dynamic IPs)
- [ ] DB user must have `readWrite` on `powerzone-gym`
- [ ] Connection string format: `mongodb+srv://user:pass@cluster.mongodb.net/powerzone-gym?appName=Cluster0`

### Cloudinary
- [ ] All three env vars set: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Folders `powerzone-gym/images` and `powerzone-gym/videos` are auto-created on first upload

### Render Free Tier — Cold Start
Render free services sleep after 15 minutes of inactivity. First request wakes it up in 30–60 seconds.
To prevent sleeping, use [UptimeRobot](https://uptimerobot.com) to ping `/api/health` every 5 minutes.

---

## 18. Standalone Offers System

Offers are promotional banners shown on the Membership page. They are **independent of membership plans** — an offer is a single image with title, description, and optional date range.

### Data flow
```
Admin → /admin/plans (Offers tab) → POST /api/offers → Offer model
Membership page → GET /api/offers → filters isActive === true → renders as image cards
Navbar → GET /api/offers → shows OFFER badge if any isActive === true
```

### Key files
| File | Role |
|---|---|
| `backend/models/Offer.js` | Mongoose schema (title, image, description, startDate, endDate, isActive) |
| `backend/controllers/offerController.js` | CRUD handlers |
| `backend/routes/offers.js` | Mounted at `/api/offers` |
| `frontend/src/pages/admin/ManagePlans.jsx` | Offers tab with Add/Edit/Delete modals |
| `frontend/src/pages/Membership.jsx` | Fetches offers, renders above plan cards |
| `frontend/src/components/layout/Navbar.jsx` | Polls offers for the live OFFER badge |

### Creating an offer (frontend pattern)
```js
const fd = new FormData()
fd.append('image', file)
fd.append('title', 'Summer Special')
fd.append('description', '30% off all plans in June')
fd.append('startDate', '2026-06-01')
fd.append('endDate', '2026-06-30')
fd.append('isActive', 'true')            // must be a string, not boolean

await api.post('/offers', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
```

### Editing an offer (image optional)
```js
const fd = new FormData()
fd.append('title', 'Updated title')
// Omit 'image' field entirely if not changing the photo
await api.put(`/offers/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
```

---

## 19. Swagger API Documentation

Interactive API docs are generated from `backend/swagger.js` and served by `swagger-ui-express`.

| Environment | URL |
|---|---|
| Local | `http://localhost:5000/api/docs` |
| Production | `https://powerzone-gym-backend.onrender.com/api/docs` |

### How it works
- `backend/swagger.js` exports a plain OpenAPI 3.0 spec object (no `swagger-jsdoc` annotations needed)
- `backend/server.js` mounts it at `/api/docs` via `swaggerUi.serve` + `swaggerUi.setup(swaggerSpec)`
- The top bar is branded red (`#e63946`) to match the PowerZone theme

### Testing protected endpoints in Swagger UI
1. Call `POST /auth/login` using **Try it out**
2. Copy the `token` from the response
3. Click **Authorize** (top right) → paste `Bearer <your-token>`
4. All `🔒` endpoints will now include your JWT automatically

### Adding a new route to the docs
Open `backend/swagger.js` and add a new path key under `paths`:
```js
'/my-route': {
  get: {
    tags: ['MyTag'],
    summary: 'What this does',
    security: [{ BearerAuth: [] }],   // omit if public
    responses: { 200: { description: 'Success' } },
  },
},
```

---

## 20. Folder Quick Reference

```
backend/
├── controllers/
│   ├── authController.js       register, login, forgot-password, reset-password
│   ├── userController.js       profile, avatar upload, attendance, progress
│   ├── trainerController.js    trainer CRUD, self-profile, client management
│   └── adminController.js      dashboard stats, assign trainer/plan, transfers
├── middleware/
│   ├── auth.js                 protect (JWT verify) + authorize (role check)
│   ├── upload.js               multer + Cloudinary (image, video, auto)
│   └── validate.js             express-validator error handler
├── models/                     19 Mongoose schemas (includes Offer)
├── routes/                     19 Express routers (includes offers.js)
├── swagger.js                  OpenAPI 3.0 spec — served at /api/docs
└── utils/
    └── mailer.js               Nodemailer transporter + branded HTML template

frontend/src/
├── components/
│   ├── layout/
│   │   ├── Layout.jsx          Wraps all public pages — conditionally shows Navbar+Footer
│   │   ├── Navbar.jsx          Public nav with user menu, avatar, role-based links
│   │   └── Footer.jsx          Footer with social links, legal modal trigger
│   └── shared/
│       ├── ProtectedRoute.jsx  Redirects to /login if not authenticated
│       ├── AdminRoute.jsx      Redirects to / if role !== admin
│       ├── TrainerRoute.jsx    Redirects to / if role !== trainer
│       ├── NotificationBell.jsx Bell icon with unread count badge
│       ├── AnimatedSection.jsx Framer Motion scroll-reveal wrapper
│       ├── PageHero.jsx        Reusable hero banner component
│       ├── SectionTitle.jsx    Section heading with underline accent
│       ├── PhoneInput.jsx      Phone number input with country prefix
│       └── LegalModal.jsx      Terms/Privacy modal using LegalContent API
├── context/
│   ├── ThemeContext.jsx        Fetches theme → converts hex → sets CSS vars on <html>
│   └── SiteContentContext.jsx  Fetches all site-content once → provides useSiteContent hook
├── pages/
│   ├── admin/                  17 admin pages (see Admin Panel section in README)
│   ├── UserDashboard.jsx       6-tab member dashboard (Overview/Workouts/Activities/Progress/Diet/Profile)
│   ├── TrainerDashboard.jsx    4-section trainer portal (Dashboard/Clients/Activities/Profile)
│   ├── Login.jsx               Dynamic content, JWT login, forgot-password link
│   ├── Register.jsx            Dynamic content, account creation
│   ├── ForgotPassword.jsx      Email reset form, success state
│   └── ResetPassword.jsx       New password + strength indicator, auto-redirect on success
├── store/
│   └── slices/authSlice.js     User auth state — user, token, loading, error
└── utils/
    ├── api.js                  Axios instance → baseURL from VITE_API_URL + JWT interceptor
    └── validate.js             validate(), positiveNum(), fieldClass() helpers
```
