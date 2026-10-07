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
| Email | Resend (transactional HTML mail) |
| Invoices | PDFKit (GST invoice attached to receipt emails) |
| Payments | Razorpay + Cash / QR (admin-approved) |
| HTTP Client | Axios |
| Icons | React Icons (Font Awesome 5) |

---

## Project Structure

```
PowerZone-Gym/
├── README.md
├── API_DOCS.md
├── WORK_GUIDE.md
│
├── Backend/
│   ├── controllers/
│   │   ├── authController.js        # register, login, forgot/reset password
│   │   ├── userController.js        # profile, avatar, check-in, attendance, progress
│   │   ├── trainerController.js     # trainer CRUD + self-service routes
│   │   ├── planController.js        # plans CRUD, purchase, Razorpay order/verify
│   │   ├── offerController.js       # standalone promotional banners
│   │   └── testimonialController.js # testimonial CRUD
│   ├── middleware/
│   │   ├── auth.js                  # protect + authorize middleware
│   │   ├── upload.js                # multer + Cloudinary storage config
│   │   ├── rateLimit.js             # express-rate-limit configs
│   │   └── validate.js              # express-validator helpers
│   ├── models/                      # 20 Mongoose schemas
│   ├── routes/                      # 19 Express route files
│   │   ├── admin.js                 # dashboard stats, assignments, transfers (inline handlers)
│   │   └── payments.js              # payment listing, pending queue, approve/reject
│   ├── utils/
│   │   ├── mailer.js                # Resend emails + PDFKit invoice generator
│   │   ├── razorpay.js              # Razorpay payment integration
│   │   └── seed.js                  # database seeder (dev only)
│   ├── swagger.js                   # OpenAPI 3.0 spec served at /api/docs
│   └── server.js                    # Express app + DB connection
│
└── Frontend/
    └── src/
        ├── components/
        │   ├── admin/
        │   │   └── MemberPurchaseHistory.jsx  # Purchase History tab inside member view
        │   ├── layout/
        │   │   ├── Layout.jsx        # Root layout wrapping all public pages
        │   │   ├── Navbar.jsx        # Public site navigation + user menu
        │   │   └── Footer.jsx        # Footer with social links and legal modal
        │   └── shared/
        │       ├── PaymentModal.jsx   # Cash / QR / Razorpay checkout
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
        │   └── admin/                  # 19 admin pages
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
        │       ├── ManageMasterData.jsx
        │       ├── ManageOffers.jsx
        │       └── ManagePayments.jsx
        ├── store/
        │   └── slices/authSlice.js   # User auth state (Redux Toolkit)
        └── utils/
            ├── api.js                # Axios instance with JWT interceptor
            └── validate.js           # Form validation helpers
```

---

## Environment Setup

### Backend — `Backend/.env`

Create `Backend/.env` with the following keys:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/powerzone-gym
JWT_SECRET=your_strong_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_xxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> **Email:** All transactional mail is sent through Resend. If `RESEND_API_KEY` is unset, no emails are attempted and the forgot-password endpoint returns the reset URL directly in the API response (dev-only fallback).

> **Payments:** `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are only needed for online checkout. Cash and QR payments work without them. Razorpay keys can also be managed at runtime from **Admin → Payments → Settings**.

### Frontend — `Frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

> **Note:** Demo credentials are only shown in development mode (`NODE_ENV=development`). They are hidden in production builds.

---

## Quick Start

```bash
# Install dependencies
cd Backend  && npm install
cd ../Frontend && npm install

# Run both (two terminals)
cd Backend  && npm run dev   # http://localhost:5000
cd Frontend && npm run dev   # http://localhost:5173
```

### Demo Credentials

Created by `npm run seed` (Backend) and available at `/login`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@powerzone.com` | `admin123` |
| User (Member) | `user@powerzone.com` | `user123` |

> Seeded accounts only — reset or remove them before going to production.

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
| Home | `/` | Hero, stats, features, trainers, programs, CTA — fully editable |
| About | `/about` | Story, values, milestones, team section |
| Trainers | `/trainers` | Trainer cards with ratings and review modal |
| Membership | `/membership` | Pricing cards with 4 billing cycles, plan purchase flow, active offers banner |
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
| Members | `/admin/users` | CRUD, filter by status/branch, assign trainers, manage membership, avatar upload; member view has **Membership** and **Purchase History** tabs |
| Trainers | `/admin/trainers` | CRUD with photo upload, assign branches, view client list |
| Plans & Offers | `/admin/plans` | Membership tier CRUD with 4 price points, feature list, popular flag; Offers tab for standalone promo banners (image + date range) |
| Payments | `/admin/payments` | Pending approvals tab (cash/QR), full payment log, revenue stats, **Settings** tab to toggle Cash / Razorpay / QR and edit UPI ID + instructions |
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

### Why RGB channels?
Tailwind's opacity modifiers (e.g. `bg-primary/20`) inject `<alpha-value>` into the color. This only works with the `rgb(R G B / <alpha-value>)` format — not hex strings.

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

## Image Upload Architecture

All images are stored on **Cloudinary** — no local file storage.

- Images → `powerzone-gym/images` folder, auto-optimized (max 1200px, format: auto)
- Videos → `powerzone-gym/videos` folder
- File size limits: 5 MB (images), 100 MB (videos)
- `req.file.path` = full Cloudinary HTTPS URL (stored in MongoDB)

### Three storage configs in `Backend/middleware/upload.js`
| Export | Folder | For |
|---|---|---|
| `upload` (default) | `powerzone-gym/images` | All image uploads |
| `upload.uploadVideo` | `powerzone-gym/videos` | Video uploads |
| `upload.uploadAny` | auto-detect | Mixed image+video |

---

## Password Reset Flow

1. User submits email → `POST /api/auth/forgot-password`
2. Backend creates a raw 32-byte crypto token → hashes it with SHA-256 → stores hash in DB (1-hour expiry)
3. Sends branded HTML email with `${FRONTEND_URL}/reset-password/<raw-token>`
4. User submits new password → `POST /api/auth/reset-password/:token`
5. Backend hashes the token, matches against DB, updates password, clears token fields

---

## Transactional Emails (Resend)

All outbound mail goes through `Backend/utils/mailer.js`, which wraps the Resend SDK with a shared branded HTML template. Every send is **fire-and-forget** (`.catch()` logged) so a mail failure never blocks an API response, and each send is skipped entirely when `RESEND_API_KEY` is absent.

| Email | Trigger | Function |
|---|---|---|
| Password reset | `POST /api/auth/forgot-password` | `sendResetEmail(to, name, resetUrl)` |
| Welcome + credentials | **Admin creates a member** (`POST /api/users`) | `sendWelcomeEmail(...)` |
| Payment receipt + PDF invoice | Plan purchase, Razorpay verify, admin payment approval | `sendPaymentReceipt(...)` |

> **Welcome email is intentionally NOT sent on self-registration** — members set their own password during sign-up, so there are no credentials to deliver.

### Invoice PDF

`sendPaymentReceipt` attaches a single-page PDF generated with **PDFKit** (`generateInvoicePDF`):

- Invoice number, invoice date, payment method and transaction ID
- **BILL TO** block with member name, email, phone and `Reg No`
- **MEMBERSHIP & PAYMENT DETAILS** (plan, billing cycle, membership period) opposite BILL TO
- Amount breakdown with **18% GST** (HSN/SAC `999711`), taxable value, CGST/SGST split
- Amount in words (`numberToWords`), totals, and a footer note positioned above the page edge

Optional custom TTF fonts are picked up from `Backend/utils/fonts/` when present (`NotoSans-Regular.ttf` / `NotoSans-Bold.ttf`); otherwise PDFKit's built-in fonts are used.

---

## Payments & Checkout

Plans are purchased from the public **Membership** page through `PaymentModal`, which loads enabled methods from `GET /api/settings/payment`.

| Method | How it works |
|---|---|
| **Razorpay** | `POST /api/plans/razorpay/order` → checkout widget → `POST /api/plans/razorpay/verify` (HMAC signature check) → payment saved as `success` |
| **Cash** | Payment saved as `pending`; member is told to pay at the front desk |
| **QR / UPI** | QR image + UPI ID shown from payment settings; member submits a transaction ID; payment saved as `pending` |

Cash and QR payments stay **pending until an admin approves them**:

```
Member selects Cash/QR → Payment (status: pending)
    → Admin → /admin/payments → Pending Approvals
    → PUT /api/payments/:id/approve
        • status → success
        • user.membership activated with the purchased plan + dates
        • receipt email with PDF invoice sent
    (or) PUT /api/payments/:id/reject → status: failed
```

**Payment settings** are a singleton `PaymentSettings` document edited at **Admin → Payments → Settings** (`GET/PUT /api/settings/payment`):

- `cashEnabled` / `razorpayEnabled` / `qrEnabled` flags
- `qrCodeImage` (Cloudinary upload), `qrCodeLabel`, `upiId`
- Per-method instruction text

The checkout UI reads these flags with **strict boolean checks** (`settings.cashEnabled === true`) so a missing or malformed value never renders a method that is effectively disabled.

### Purchase History (Admin)

Opening a member in **Admin → Members → view** shows two tabs. The **Purchase History** tab renders `components/admin/MemberPurchaseHistory.jsx`, which fetches `GET /api/payments?user=<id>&limit=100` and shows:

- Summary cards — total purchases and total spent (successful payments only)
- Status filter chips with counts (All / Completed / Pending / Failed / Refunded)
- Per-payment rows: plan, invoice number, date, method, amount
- Invoice detail modal with membership period, transaction ID copy, and receipt download

`GET /api/payments` accepts `user`, `status`, `page` and `limit` query params; filtering by `user` defaults the page size to 100.

---

## Database Models (20 total)

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
| FooterSettings | footersettings | Footer contact info, hours, social links + visibility toggles |
| MasterData | masterdatas | Generic dropdown option store (type + code + label) |
| NameTransfer | nametransfers | Membership ownership transfer records |
| Settings | settings | Global app config (fees, transfer rules) |
| PaymentSettings | paymentsettingss | Checkout config — enabled methods, QR image, UPI ID, per-method instructions |

---

## Security

- **Helmet** — HTTP security headers on all responses
- **CORS** — Restricted to `FRONTEND_URL` env variable (allows any localhost in dev)
- **Rate Limiting** — 100 requests per 15 minutes per IP on all `/api/*` routes; 10 requests per 15 minutes for auth endpoints
- **JWT** — 7-day expiry, stored in `localStorage`, sent as `Authorization: Bearer` header
- **bcryptjs** — Password hashing before storage
- **Crypto** — SHA-256 hashed reset tokens stored in DB, raw token sent only in email
- **Input Validation** — express-validator on all mutation routes; server-side validation for membership, social links, attendance, progress; check-in requires both a `workoutType` and a `duration > 0`
- **Payment Integrity** — Razorpay signatures verified with HMAC before marking a payment successful; cash/QR payments can only be flipped to `success` by an admin approval route
- **Role Guard** — `authorize('admin')` / `authorize('trainer', 'admin')` middleware on protected routes
- **XSS Prevention** — HTML content sanitized before rendering with `dangerouslySetInnerHTML`
- **Mass Assignment Prevention** — Field whitelisting on all update endpoints
- **Regex Injection Prevention** — Special characters escaped in search queries
- **Atomic Operations** — Race condition prevention in check-in and registration number generation

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
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,   // set to Vercel URL in production
].filter(Boolean)
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

---

## Key Implementation Details

### Site Content System (Dynamic Page Text)

Any public page text editable by the admin uses the `SiteContent` system.

**Architecture:**
1. `SiteContentContext` fetches `GET /api/site-content` once on app load → caches all sections
2. Pages use the `useSiteContent(sectionKey, DEFAULTS)` hook
3. If a key isn't in the DB yet, `DEFAULTS` values are used as fallback

**Adding a new editable section:**
- **Backend:** No changes needed — the `PUT /api/site-content/:section` route accepts any JSON
- **Frontend (admin):** Add editor fields in `ManageContent.jsx` under the relevant tab
- **Frontend (page):** Add the section key + `DEFAULTS` + `useSiteContent()` in the page component

**Section keys currently in use:**
`home_hero` | `home_stats` | `home_features` | `home_programs` | `home_cta` | `page_about` | `page_trainers` | `page_membership` | `page_workouts` | `page_dietplans` | `page_gallery` | `page_branches` | `page_contact` | `page_login` | `page_register` | `page_forgot` | `theme` | `navbar`

### Trainer vs User Profile Images

Trainers have **two separate image fields** in different models:

| Field | Model | Used by |
|---|---|---|
| `User.avatar` | User | Public Navbar, Redux state |
| `Trainer.image` | Trainer | Trainer profile cards, Trainer Dashboard header |

**Sync rules implemented:**

**On login (`authController.login`):**
If `user.role === 'trainer'` and `user.avatar` is empty → fetches `Trainer.image` → injects into login response.

**On trainer profile image upload (`trainerController.updateMyProfile`):**
After saving `Trainer.image`, also writes the same URL to `User.avatar`:
```js
await User.findByIdAndUpdate(req.user.id, { avatar: req.file.path })
```

**On the frontend (`TrainerDashboard.jsx`):**
After upload response, also dispatches:
```js
dispatch(setUser({ ...user, avatar: data.trainer.image }))
```

This triple-sync ensures the Navbar, Redux, localStorage, and both DB fields all stay consistent.

### Footer Social Media Visibility Toggles

Each social media platform (Facebook, Instagram, Twitter, YouTube) has a boolean flag that controls whether its icon appears on the public site footer.

**How it works:**
```
Admin toggles eye icon in /admin/footer
    → form state: showFacebook / showInstagram / showTwitter / showYoutube
    → PUT /api/settings/footer saves all fields to FooterSettings
    → Public Footer.jsx fetches GET /api/settings/footer on load
    → socials array filters out platforms where showXxx === false
    → icon is not rendered on the public site
```

**Key pattern in Footer.jsx:**
```js
const socials = [
  settings.showFacebook && { icon: FaFacebook, href: settings.facebook },
  settings.showInstagram && { icon: FaInstagram, href: settings.instagram },
  settings.showTwitter && { icon: FaTwitter, href: settings.twitter },
  settings.showYoutube && { icon: FaYoutube, href: settings.youtube },
].filter(Boolean)
```

### Standalone Offers System

Offers are promotional banners shown on the Membership page. They are **independent of membership plans** — an offer is a single image with title, description, and optional date range.

**Data flow:**
```
Admin → /admin/plans (Offers tab) → POST /api/offers → Offer model
Membership page → GET /api/offers → filters isActive === true → renders as image cards
Navbar → GET /api/offers → shows OFFER badge if any isActive === true
```

### Master Data System

A generic dropdown option store with `type` + `code` + `label.en` structure.

**Currently used types:**
| Type | Used for |
|---|---|
| `plan` | Membership duration options (Monthly, Quarterly, etc.) |
| `workout` | Workout category options |
| `diet` | Diet goal options |

**Fetching in a component:**
```js
const { data } = await api.get('/v1/master?type=plan')
// Returns: [{ code: 'MONTHLY', label: { en: 'Monthly' }, isActive: true }, ...]
```

---

## Mongoose Upsert Warning (Mongoose 7)

When doing a `findOneAndUpdate` with `upsert: true`, always use `{ $set: { ... } }` instead of a plain object:

```js
// WRONG — acts as a replacement document, drops required fields
await SiteContent.findOneAndUpdate({ section }, { data: req.body }, { upsert: true })

// CORRECT
await SiteContent.findOneAndUpdate({ section }, { $set: { data: req.body } }, { upsert: true, new: true })
```

This affects every upsert in `siteContent.js`. The bug causes the `section` (required field) to be dropped on first insert.

---

## Deployment Checklist

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
| `RESEND_API_KEY` | your Resend API key (re_xxxxxxxxxxxx) |
| `RAZORPAY_KEY_ID` | your Razorpay key ID (rzp_xxxxxxxxxxxx) — optional, enables online checkout |
| `RAZORPAY_KEY_SECRET` | your Razorpay key secret |

> Do **NOT** set `PORT` — Render injects it automatically.

**Live backend URL:** `https://powerzone-gym-backend.onrender.com`

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

## Folder Quick Reference

```
Backend/
├── controllers/
│   ├── authController.js       register, login, forgot-password, reset-password
│   ├── userController.js       profile, avatar upload, check-in, attendance, progress
│   ├── trainerController.js    trainer CRUD, self-profile, client management
│   ├── planController.js       membership plans, purchase, Razorpay order/verify
│   ├── offerController.js      standalone promotional banners
│   └── testimonialController.js testimonial CRUD
├── middleware/
│   ├── auth.js                 protect (JWT verify) + authorize (role check)
│   ├── upload.js               multer + Cloudinary (image, video, auto)
│   ├── rateLimit.js            express-rate-limit configs
│   └── validate.js             express-validator error handler
├── models/                     20 Mongoose schemas (incl. Offer, PaymentSettings)
├── routes/                     19 Express routers (incl. offers.js, payments.js)
│   └── admin.js                dashboard stats, assignments, transfers (inline handlers)
├── swagger.js                  OpenAPI 3.0 spec — served at /api/docs
└── utils/
    ├── mailer.js               Resend emails + PDFKit invoice generator
    ├── razorpay.js             Razorpay payment integration
    └── seed.js                 database seeder (dev only)

Frontend/src/
├── components/
│   ├── admin/
│   │   └── MemberPurchaseHistory.jsx  Purchase History tab (list, filters, invoice modal)
│   ├── layout/
│   │   ├── Layout.jsx          Wraps all public pages — conditionally shows Navbar+Footer
│   │   ├── Navbar.jsx          Public nav with user menu, avatar, role-based links
│   │   └── Footer.jsx          Footer with social links, legal modal trigger
│   └── shared/
│       ├── PaymentModal.jsx    Cash / QR / Razorpay checkout driven by payment settings
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
│   ├── admin/                  19 admin pages (see Admin Panel section in README)
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