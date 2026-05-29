# PowerZone Gym — Full Stack Web Application

A production-ready gym management platform built with React 18, Node.js/Express, and MongoDB.
Covers a public marketing website, member self-service dashboard, trainer portal, and a
comprehensive admin panel — all with dynamic theming, live content editing, and Cloudinary
image management.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, Framer Motion |
| State | Redux Toolkit + React Context |
| Routing | React Router v6 |
| Backend | Node.js, Express 4 |
| Database | MongoDB + Mongoose 7 |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Storage | Cloudinary (images + videos) |
| Email | Nodemailer (Gmail SMTP) |
| HTTP Client | Axios |
| Icons | React Icons (Font Awesome 5) |

---

## Project Structure

```
gym-website/
├── README.md
├── API_DOCS.md
├── WORK_GUIDE.md
│
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # register, login, forgot/reset password
│   │   ├── userController.js        # profile, avatar, attendance, progress
│   │   ├── trainerController.js     # trainer CRUD + self-service routes
│   │   └── adminController.js       # dashboard stats, assign plans, transfers
│   ├── middleware/
│   │   ├── auth.js                  # protect + authorize middleware
│   │   ├── upload.js                # multer + Cloudinary storage config
│   │   └── validate.js              # express-validator helpers
│   ├── models/                      # 18 Mongoose schemas
│   ├── routes/                      # 18 Express route files
│   ├── utils/
│   │   └── mailer.js                # Nodemailer with branded HTML template
│   └── server.js                    # Express app + DB connection
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/
        │   │   ├── Layout.jsx        # Root layout wrapping all public pages
        │   │   ├── Navbar.jsx        # Public site navigation + user menu
        │   │   └── Footer.jsx        # Footer with social links and legal modal
        │   └── shared/
        │       ├── ProtectedRoute.jsx
        │       ├── AdminRoute.jsx
        │       ├── TrainerRoute.jsx
        │       ├── AnimatedSection.jsx
        │       ├── NotificationBell.jsx
        │       ├── PageHero.jsx
        │       ├── PhoneInput.jsx
        │       ├── SectionTitle.jsx
        │       └── LegalModal.jsx
        ├── context/
        │   ├── ThemeContext.jsx       # Fetches theme from DB, applies CSS vars
        │   └── SiteContentContext.jsx # Pre-loads all page content sections
        ├── pages/
        │   ├── Home.jsx
        │   ├── About.jsx
        │   ├── Trainers.jsx
        │   ├── Membership.jsx
        │   ├── Workouts.jsx
        │   ├── DietPlans.jsx
        │   ├── Gallery.jsx
        │   ├── Branches.jsx
        │   ├── Contact.jsx
        │   ├── BMICalculator.jsx
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── ForgotPassword.jsx
        │   ├── ResetPassword.jsx
        │   ├── UserDashboard.jsx
        │   ├── TrainerDashboard.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── ManageUsers.jsx
        │       ├── ManageTrainers.jsx
        │       ├── ManagePlans.jsx
        │       ├── ManageBranches.jsx
        │       ├── ManageWorkouts.jsx
        │       ├── ManageDietPlans.jsx
        │       ├── ManageGallery.jsx
        │       ├── ManageActivities.jsx
        │       ├── ManageTestimonials.jsx
        │       ├── ManageContent.jsx
        │       ├── ManageNavbar.jsx
        │       ├── ManageFooter.jsx
        │       ├── ManageTheme.jsx
        │       ├── ManageTransfer.jsx
        │       ├── ManageLegal.jsx
        │       └── ManageMasterData.jsx
        ├── store/
        │   └── slices/authSlice.js   # User auth state (Redux Toolkit)
        └── utils/
            ├── api.js                # Axios instance with JWT interceptor
            └── validate.js           # Form validation helpers
```

---

## Environment Setup

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/powerzone-gym
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> **Email:** If `EMAIL_USER` / `EMAIL_PASS` are not set, the forgot-password endpoint returns the reset URL directly in the API response (dev-only fallback).

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Quick Start

```bash
# Clone and install
cd backend  && npm install
cd ../frontend && npm install

# Run both (two terminals)
cd backend  && npm run dev   # http://localhost:5000
cd frontend && npm run dev   # http://localhost:3000
```

---

## User Roles

| Role | Route | Access |
|---|---|---|
| `user` | `/dashboard` | Public site + Member self-service dashboard |
| `trainer` | `/trainer` | Public site + Trainer client-management portal |
| `admin` | `/admin` | Full admin panel + all above |

---

## Feature Overview

### Public Site (10 pages)

| Page | Path | Notes |
|---|---|---|
| Home | `/` | Hero, stats, features, trainers, plans, testimonials — fully editable |
| About | `/about` | Story, values, milestones, team section |
| Trainers | `/trainers` | Trainer cards with ratings and review modal |
| Membership | `/membership` | Pricing cards with plan purchase flow |
| Workouts | `/workouts` | Workout library with filter by category/level |
| Diet Plans | `/diet-plans` | Meal plan library with macro breakdown |
| Gallery | `/gallery` | Image grid with category filter |
| Branches | `/branches` | Branch cards with map links |
| Contact | `/contact` | Enquiry form saved to DB |
| BMI Calculator | `/bmi-calculator` | Interactive BMI tool with result guidance |

All page text, images, and headings are editable by the admin via **Site Content** without redeployment.

### Auth Pages

| Page | Path | Features |
|---|---|---|
| Login | `/login` | JWT login, dynamic content, forgot-password link |
| Register | `/register` | Account creation, dynamic content + perks section |
| Forgot Password | `/forgot-password` | Email reset link (dev fallback: URL in API response) |
| Reset Password | `/reset-password/:token` | New password with strength indicator, 1-hour token expiry |

All auth pages hide the main Navbar/Footer and support custom background images + text via admin.

### Member Dashboard (`/dashboard`)

| Tab | Features |
|---|---|
| Overview | Banner with avatar, membership status, streak counter, quick-action cards |
| Workouts | Full assigned workout plan with day-by-day exercise accordion |
| Activities | Browse and register for gym activities |
| Progress | Weight/body-fat/muscle log with chart, edit/delete entries |
| Diet | Full assigned meal plan with macros table grouped by meal time |
| Profile | Edit name/phone/goal, click-to-upload avatar (Cloudinary), personal + class trainer cards |

### Trainer Dashboard (`/trainer`)

| Section | Features |
|---|---|
| Dashboard | Stats (Total/Personal/Active clients), quick-link cards, recent clients list |
| My Clients | Stats row, All Clients / Personal Clients filter, search, paginated table, click to open client detail |
| Client Detail | Attendance history, assigned diet + workout plan viewer, mark attendance, assign diet, assign workout |
| My Activities | Upcoming gym activities, sessions assigned to this trainer highlighted |
| My Profile | View trainer stats (rating, clients, experience), edit bio + phone, click-to-upload photo |

Trainer profile photo is synced to `User.avatar` on upload so it appears in the public Navbar immediately.

### Admin Panel (`/admin`)

| Page | Path | Features |
|---|---|---|
| Dashboard | `/admin` | Live stats (members, trainers, revenue, signups), recent users table |
| Members | `/admin/users` | CRUD, filter by status/branch, assign trainers, manage membership, avatar upload |
| Trainers | `/admin/trainers` | CRUD with photo upload, assign branches, view client list |
| Plans & Offers | `/admin/plans` | Membership tier CRUD with 4 price points, feature list, popular flag; Offers tab for standalone promo banners (image + date range) |
| Branches | `/admin/branches` | Branch CRUD (name, address, manager, transfer fee) |
| Transfer | `/admin/transfer` | Branch transfer, name transfer, configurable fee items |
| Activities | `/admin/activities` | Create/edit gym events, assign trainers + branches, manage registrations |
| Site Content | `/admin/content` | Rich editor for every public page section (text, images, links) |
| Navbar | `/admin/navbar` | Reorder, rename, toggle visibility of nav links |
| Footer | `/admin/footer` | Contact info, opening hours, social media links with per-platform visibility toggles |
| Theme | `/admin/theme` | 8 color presets + 4 custom color pickers, live preview, one-click save |
| Master Data | `/admin/master-data` | Generic dropdown store — tabs: Plan / Workout / Diet Plan |
| Workouts | `/admin/workouts` | Site plans + member plans, day-by-day exercise builder |
| Diet Plans | `/admin/diet-plans` | Full meal plan builder with macro auto-totals |
| Gallery | `/admin/gallery` | Upload/delete/categorize images |
| Testimonials | `/admin/testimonials` | Create/edit reviews, toggle featured |
| Legal | `/admin/legal` | Rich text editor for Terms of Service and Privacy Policy |

Admin header avatar is click-to-upload (photo saved to Cloudinary, Redux + localStorage synced immediately).

---

## Dynamic Theme System

Admin can change the site's color scheme at `/admin/theme`.

- **8 built-in presets** (Red, Blue, Green, Purple, Orange, Pink, Cyan, Gold)
- **4 custom color pickers** (Primary, Primary Dark, Primary Light, Secondary)
- Changes apply **instantly as live preview** using CSS custom properties
- **Save Theme** persists to MongoDB — survives page refresh across all roles

Colors are stored as hex values and converted to RGB channels for Tailwind opacity compatibility:
```css
--color-primary: 230 57 70;   /* enables: bg-primary/20, text-primary/50 etc. */
```

---

## Image Upload Architecture

All images are stored on **Cloudinary** — no local file storage.

- Images → `powerzone-gym/images` folder, auto-optimized (max 1200px, format: auto)
- Videos → `powerzone-gym/videos` folder
- File size limits: 5 MB (images), 100 MB (videos)
- `req.file.path` = full Cloudinary HTTPS URL (stored in MongoDB)

---

## Password Reset Flow

1. User submits email → `POST /api/auth/forgot-password`
2. Backend creates a raw 32-byte crypto token → hashes it with SHA-256 → stores hash in DB (1-hour expiry)
3. Sends branded HTML email with `https://frontend/reset-password/<raw-token>`
4. User submits new password → `POST /api/auth/reset-password/:token`
5. Backend hashes the token, matches against DB, updates password, clears token fields

---

## Database Models (19 total)

| Model | Collection | Purpose |
|---|---|---|
| User | users | All accounts (member / trainer / admin), avatar, membership, attendance, progress |
| Trainer | trainers | Trainer profile linked to User (speciality, image, bio, clients, reviews) |
| MembershipPlan | membershipplans | Plan tiers with 4 price points and feature lists |
| Offer | offers | Standalone promotional banners (image, title, description, date range, active flag) |
| Payment | payments | Payment records per user/plan with invoice numbers |
| WorkoutProgram | workoutprograms | Site-wide and member-assigned plans with day/exercise structure |
| DietPlan | dietplans | Meal plans with per-food macro tracking |
| Branch | branches | Gym locations with contact and transfer fee |
| Activity | activities | Scheduled events with trainer and participant management |
| Gallery | galleries | Cloudinary image records with category |
| Testimonial | testimonials | Customer reviews with rating and featured flag |
| Contact | contacts | Visitor enquiries with admin reply tracking |
| Notification | notifications | In-app alerts (activity updates, general) |
| LegalContent | legalcontents | Terms of Service and Privacy Policy sections |
| SiteContent | sitecontents | Key-value store for all dynamic page content |
| FooterSettings | footersettings | Footer contact info, hours, social links |
| MasterData | masterdatas | Generic dropdown option store (type + code + label) |
| NameTransfer | nametransfers | Membership ownership transfer records |
| Settings | settings | Global app config (fees, transfer rules) |

---

## Security

- **Helmet** — HTTP security headers on all responses
- **CORS** — Restricted to `FRONTEND_URL` env variable
- **Rate Limiting** — 100 requests per 15 minutes per IP on all `/api/*` routes
- **JWT** — 7-day expiry, stored in `localStorage`, sent as `Authorization: Bearer` header
- **bcryptjs** — Password hashing before storage
- **Crypto** — SHA-256 hashed reset tokens stored in DB, raw token sent only in email
- **Input Validation** — express-validator on all mutation routes
- **Role Guard** — `authorize('admin')` / `authorize('trainer', 'admin')` middleware on protected routes

---

## Live Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | `https://power-zone-gym-frontend.vercel.app` |
| Backend API (Render) | `https://powerzone-gym-backend.onrender.com/api` |
| Swagger API Docs | `https://powerzone-gym-backend.onrender.com/api/docs` |

> **Note:** The backend runs on Render's free tier — it sleeps after 15 min of inactivity. The first request after a sleep period may take 30–60 seconds to respond.

---

## API Documentation (Swagger UI)

Interactive API docs are available at `/api/docs` (served by `swagger-ui-express`).

- **Local:** `http://localhost:5000/api/docs`
- **Production:** `https://powerzone-gym-backend.onrender.com/api/docs`

Click **Authorize** in the Swagger UI, paste your JWT token (from `/auth/login`), and use **Try it out** to test any endpoint directly in the browser.

---

## CORS Configuration

The backend allows requests from these origins (configured in `server.js`):

```js
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,   // set to Vercel URL in production
]
```

Update `FRONTEND_URL` in Render's environment variables whenever the frontend URL changes.

---

## Scripts Reference

### Backend
```bash
npm run dev    # nodemon watch mode (development)
npm start      # production start (Render uses this)
npm run seed   # seed database with sample data (dev only)
```

### Frontend
```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # Production build → dist/
npm run preview  # Preview the production build locally
```
