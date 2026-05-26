# PowerZone Gym — API Documentation

| Environment | Base URL |
|---|---|
| Production | `https://powerzone-gym-backend.onrender.com/api` |
| Local | `http://localhost:5000/api` |

> **Interactive Docs (Swagger UI):**
> - Production: `https://powerzone-gym-backend.onrender.com/api/docs`
> - Local: `http://localhost:5000/api/docs`
>
> Click **Authorize** in Swagger UI and paste your JWT token to test protected endpoints directly in the browser.

**Authentication:** Protected routes require the header:
```
Authorization: Bearer <jwt_token>
```

**Roles:** `user` | `trainer` | `admin`

**Rate limit:** 100 requests / 15 min / IP on all `/api/*` routes

---

## Auth — `/api/auth`

### POST `/auth/register`
Create a new user account.

**Body**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "phone": "+91 98765 43210",
  "goal": "Build Muscle"
}
```
`goal` values: `Lose Weight` | `Build Muscle` | `Improve Fitness` | `Athletic Training` | `General Health`

**Response 201**
```json
{ "success": true, "token": "eyJ...", "user": { "_id": "...", "name": "John Doe", "role": "user", ... } }
```

---

### POST `/auth/login`
Login with email and password.

**Body**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Response 200**
```json
{ "success": true, "token": "eyJ...", "user": { "_id": "...", "name": "...", "role": "...", "avatar": "..." } }
```

> For trainer accounts: if `user.avatar` is empty, the login response automatically populates it from `Trainer.image` so the public Navbar shows their photo immediately.

---

### GET `/auth/me`
Get the currently authenticated user. **Protected**

**Response 200**
```json
{ "success": true, "user": { ... } }
```

---

### PUT `/auth/update-password`
Change the logged-in user's password. **Protected**

**Body**
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```

---

### POST `/auth/forgot-password`
Trigger a password reset email.

**Body**
```json
{ "email": "john@example.com" }
```

**Response 200**
```json
{ "success": true, "message": "Password reset email sent" }
```

> **Dev mode (no email configured):** Response also includes `"resetUrl": "http://localhost:3000/reset-password/..."` for testing without email setup.

---

### POST `/auth/reset-password/:token`
Set a new password using the token from the reset email. Token expires after **1 hour**.

**Body**
```json
{ "password": "mynewpassword123" }
```

**Response 200** — Returns new JWT and user object (auto login).

---

## Users — `/api/users`

### GET `/users/profile`
Get the logged-in user's full profile. **Protected**

Returns the user document with populated: `membership.plan`, `branch`, `personalTrainer` (name, speciality, image, email, phone, trainerId), `classTrainer` (same fields), `attendance[]`, `progress[]`.

---

### PUT `/users/profile`
Update own profile. **Protected**

**Body**
```json
{ "name": "John Doe", "phone": "+91 99999 00000", "goal": "Lose Weight" }
```

---

### PUT `/users/profile/avatar`
Upload a profile photo. **Protected** — `multipart/form-data`

| Field | Type | Notes |
|---|---|---|
| `avatar` | File (image) | Max 5 MB, auto-uploaded to Cloudinary |

**Response 200**
```json
{ "success": true, "user": { "avatar": "https://res.cloudinary.com/...", ...rest } }
```

> After upload, dispatch `setUser(data.user)` in Redux to update the Navbar immediately.

---

### POST `/users/checkin`
Log a gym attendance session. **Protected**

**Body**
```json
{ "duration": 60, "workoutType": "Chest & Triceps", "notes": "Great session" }
```

---

### GET `/users/attendance`
Get own attendance records. **Protected**

---

### POST `/users/weight`
Log a body measurement entry. **Protected**

**Body**
```json
{ "weight": 75.5, "bodyFat": 18.2, "muscleMass": 45.1, "notes": "Morning, fasted" }
```

---

### GET `/users/progress`
Get all logged progress records. **Protected**

---

### PUT `/users/progress/:id`
Update a progress entry's notes. **Protected**

**Body**
```json
{ "notes": "Updated note" }
```

---

### DELETE `/users/progress/:id`
Delete a progress entry. **Protected**

---

### GET `/users/my-diet-plan`
Get the diet plan assigned to the logged-in user. **Protected**

---

### GET `/users/my-workout-plan`
Get the workout plan assigned to the logged-in user. **Protected**

---

### Admin-Only User Routes

| Method | Path | Description |
|---|---|---|
| GET | `/users` | List all users (filterable by role, branch, status) |
| POST | `/users` | Create a user account directly |
| PUT | `/users/:id` | Update any user's data |
| DELETE | `/users/:id` | Deactivate / delete a user |

---

## Trainers — `/api/trainers`

### GET `/trainers`
Get all active trainers. **Public**

**Query params:** `?branch=<id>` | `?speciality=Yoga`

---

### GET `/trainers/:id`
Get a single trainer by ID (includes reviews, rating, clients count). **Public**

---

### POST `/trainers/:id/reviews`
Add a review to a trainer. **Protected**

**Body**
```json
{ "rating": 5, "comment": "Best trainer I've had!" }
```

---

### GET `/trainers/me/profile`
Get the logged-in trainer's own full profile. **Protected (Trainer / Admin)**

---

### PUT `/trainers/me/profile`
Update own bio, phone, or profile photo. **Protected (Trainer / Admin)** — `multipart/form-data`

| Field | Type | Notes |
|---|---|---|
| `bio` | String | Optional |
| `phone` | String | Optional |
| `image` | File (image) | Optional — auto-uploaded to Cloudinary |

> Also writes the new image URL to `User.avatar` so the public Navbar updates.

---

### GET `/trainers/me/clients`
Get all members assigned to this trainer (personal + class). **Protected (Trainer / Admin)**

---

### GET `/trainers/me/clients/:userId`
Get full detail for a specific client. **Protected (Trainer / Admin)**

**Response includes:** `client` profile, `dietPlan` (full plan with meals), `workoutPlan` (full plan with days/exercises).

---

### POST `/trainers/me/clients/:userId/attendance`
Mark attendance for a client. **Protected (Trainer / Admin)**

**Body**
```json
{ "duration": 60, "workoutType": "Leg Day — Day 3", "notes": "Good form today" }
```

---

### POST `/trainers/me/clients/:userId/diet`
Assign a diet plan to a client. **Protected (Trainer / Admin)**

**Body**
```json
{ "planId": "<dietPlanId>" }
```

---

### POST `/trainers/me/clients/:userId/workout`
Assign a workout plan to a client. **Protected (Trainer / Admin)**

**Body**
```json
{ "planId": "<workoutProgramId>" }
```

---

### Admin-Only Trainer Routes

| Method | Path | Description |
|---|---|---|
| POST | `/trainers` | Create trainer profile (with image upload via multipart) |
| PUT | `/trainers/:id` | Update any trainer |
| DELETE | `/trainers/:id` | Soft-delete a trainer |

---

## Membership Plans — `/api/plans`

### GET `/plans`
Get all active membership plans. **Public**

---

### POST `/plans`
Create a plan. **Admin**

**Body**
```json
{
  "name": "Elite",
  "description": "Unlimited access + personal training",
  "monthlyPrice": 4999,
  "quarterlyPrice": 12999,
  "halfYearlyPrice": 23999,
  "yearlyPrice": 39999,
  "features": ["Pool Access", "Sauna", "Personal Trainer", "Nutrition Plan"],
  "isPopular": true,
  "color": "#8b5cf6"
}
```

---

### PUT `/plans/:id` / DELETE `/plans/:id`
Update or delete a plan. **Admin**

---

### POST `/plans/purchase`
Purchase a membership plan. **Protected**

**Body**
```json
{
  "planId": "<planId>",
  "billingCycle": "monthly",
  "paymentMethod": "card"
}
```
`billingCycle`: `monthly` | `quarterly` | `half-yearly` | `annual`
`paymentMethod`: `card` | `upi` | `netbanking` | `cash` | `wallet`

---

## Offers — `/api/offers`

Standalone promotional offers (not tied to any membership plan). Displayed on the Membership page and indicated in the Navbar when an active offer exists.

### GET `/offers`
Get all offers. **Public**

**Response 200**
```json
{
  "offers": [
    {
      "_id": "...",
      "title": "Summer Special – 30% Off",
      "image": "https://res.cloudinary.com/...",
      "description": "Join before June 30 and save 30% on any plan.",
      "startDate": "2026-06-01T00:00:00.000Z",
      "endDate": "2026-06-30T00:00:00.000Z",
      "isActive": true,
      "createdAt": "..."
    }
  ]
}
```

---

### POST `/offers`
Create a new offer. **Admin** — `multipart/form-data`

| Field | Type | Notes |
|---|---|---|
| `image` | File (image) | Required — uploaded to Cloudinary |
| `title` | String | Required |
| `description` | String | Optional |
| `startDate` | ISO date string | Optional |
| `endDate` | ISO date string | Optional |
| `isActive` | `"true"` / `"false"` | Defaults to `true` |

---

### PUT `/offers/:id`
Update an offer. **Admin** — `multipart/form-data`

Same fields as POST. `image` field is optional — if omitted, existing image is kept.

---

### DELETE `/offers/:id`
Delete an offer. **Admin**

---

## Gallery — `/api/gallery`

### GET `/gallery`
Get all active gallery images. **Public**

**Query params:** `?category=Gym Floor`

`category` values: `Gym Floor` | `Classes` | `Trainers` | `Members` | `Events`

---

### POST `/gallery`
Upload an image. **Admin** — `multipart/form-data`

| Field | Type |
|---|---|
| `image` | File (image) |
| `title` | String |
| `category` | String (enum above) |

---

### PUT `/gallery/:id` / DELETE `/gallery/:id`
Update metadata or delete an image. **Admin**

---

## Contact — `/api/contact`

### POST `/contact`
Submit a contact enquiry. **Public**

**Body**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+91 99999 00000",
  "subject": "Membership Query",
  "message": "What plans do you offer for students?"
}
```

---

### GET `/contact`
List all enquiries. **Admin**

---

### PUT `/contact/:id/reply`
Reply to an enquiry (stores reply and sends email if configured). **Admin**

**Body**
```json
{ "reply": "Thank you for reaching out. Here are our student plans..." }
```

---

## Workouts — `/api/workouts`

### GET `/workouts`
Get workout programs. **Public**

**Query params:** `?planType=site` | `?planType=member` | `?admin=true` (includes inactive)

---

### POST `/workouts`
Create a workout program. **Admin / Trainer**

**Body**
```json
{
  "title": "8-Week Strength Builder",
  "planType": "member",
  "category": "Strength",
  "level": "Beginner",
  "levelNumber": 1,
  "completionWeeks": 8,
  "promotionNote": "Complete this to unlock Level 2",
  "targetPackages": ["monthly", "quarterly"],
  "days": [
    {
      "dayNumber": 1,
      "dayName": "Chest & Triceps",
      "coachGuided": false,
      "exercises": [
        { "name": "Bench Press", "sets": 4, "reps": "8-10" },
        { "name": "Tricep Dips", "sets": 3, "reps": "12" }
      ]
    }
  ]
}
```

`planType`: `site` (public library) | `member` (assigned to specific members)
`category`: `Strength` | `Cardio` | `HIIT` | `Flexibility` | `Combat` | `Dance`

---

### PUT `/workouts/:id` / DELETE `/workouts/:id`
Update or delete. **Admin / Trainer**

---

## Diet Plans — `/api/diet`

### GET `/diet`
Get diet plans. **Public**

**Query params:** `?planType=site` | `?admin=true`

---

### POST `/diet`
Create a meal plan. **Admin / Trainer**

**Body**
```json
{
  "title": "High-Protein Weight Loss Plan",
  "goal": "Weight Loss",
  "totalCalories": 1800,
  "totalProtein": 150,
  "totalCarbs": 180,
  "totalFat": 50,
  "planType": "member",
  "meals": [
    {
      "time": "Breakfast",
      "name": "Oats with Whey",
      "quantity": 100,
      "calories": 380,
      "protein": 28,
      "carbs": 52,
      "fat": 6,
      "instructions": "Mix with water, add banana"
    }
  ]
}
```

`goal`: `Weight Loss` | `Muscle Gain` | `Maintenance` | `Vegan`
`time` (meal slot): `Breakfast` | `Mid-Breakfast` | `Lunch` | `Snacks` | `Dinner`

---

### PUT `/diet/:id` / DELETE `/diet/:id`
Update or delete. **Admin / Trainer**

---

## Admin — `/api/admin`

### GET `/admin/dashboard`
Get dashboard statistics. **Admin**

**Response**
```json
{
  "stats": {
    "totalUsers": 245,
    "totalTrainers": 12,
    "monthlyRevenue": 485000,
    "newSignups": 18
  },
  "recentUsers": [ { "name": "...", "email": "...", "membership": {...} } ]
}
```

---

### POST `/admin/assign-trainer`
Assign a trainer to a member. **Admin**

**Body**
```json
{ "userId": "<userId>", "trainerId": "<trainerId>", "role": "Personal Trainer" }
```
`role`: `Personal Trainer` | `Class Trainer`

---

### POST `/admin/assign-workout`
Assign a workout plan directly to a user. **Admin**

**Body**
```json
{ "userId": "<userId>", "planId": "<workoutId>" }
```

---

### POST `/admin/assign-diet`
Assign a diet plan directly to a user. **Admin**

**Body**
```json
{ "userId": "<userId>", "planId": "<dietPlanId>" }
```

---

### POST `/admin/branch-transfer`
Transfer a member to another branch. **Admin**

**Body**
```json
{ "userId": "<userId>", "toBranch": "<branchId>", "fee": 500, "notes": "Requested by member" }
```

---

### GET `/admin/transfers`
List all branch transfer records. **Admin**

---

### DELETE `/admin/transfers/:userId/:transferId`
Remove a transfer record. **Admin**

---

### Name Transfer Routes

| Method | Path | Description |
|---|---|---|
| GET | `/admin/name-transfers` | List all name transfers |
| POST | `/admin/name-transfer` | Create a membership name transfer |
| DELETE | `/admin/name-transfers/:id` | Delete a name transfer record |

**POST body**
```json
{
  "fromUserId": "<userId>",
  "toUserId": "<userId>",
  "fee": 500,
  "transferMembership": true,
  "notes": "Transferred to spouse"
}
```

---

### Transfer Fee Routes (configurable fee items)

| Method | Path | Description |
|---|---|---|
| GET | `/admin/transfer-fees` | List all fee items |
| POST | `/admin/transfer-fees` | Create a fee item |
| PUT | `/admin/transfer-fees/:id` | Update a fee item |
| DELETE | `/admin/transfer-fees/:id` | Delete a fee item |

---

## Branches — `/api/branches`

### GET `/branches`
Get all branches. **Public**

---

### POST `/branches`
Create a branch. **Admin**

**Body**
```json
{
  "name": "South Branch",
  "location": "Koramangala, Bengaluru",
  "address": "12, 5th Block, Koramangala, Bengaluru 560034",
  "phone": "+91 80 1234 5678",
  "manager": "Ravi Kumar",
  "transferFee": 500
}
```

---

### PUT `/branches/:id` / DELETE `/branches/:id`
Update or delete. **Admin**

---

## Activities — `/api/activities`

### GET `/activities`
Get all upcoming/active activities. **Public / Protected**

---

### POST `/activities`
Create a gym activity / event. **Admin**

**Body**
```json
{
  "title": "Saturday Zumba Class",
  "activityType": "Dance",
  "description": "High-energy cardio dance session for all levels",
  "date": "2026-06-21",
  "time": "08:00 AM",
  "registrationDeadline": "2026-06-20",
  "maxParticipants": 30,
  "trainers": ["<trainerId>"],
  "branch": "<branchId>"
}
```

---

### PUT `/activities/:id` / DELETE `/activities/:id`
Update or delete. **Admin**

---

### POST `/activities/:id/register`
Register the logged-in user for an activity. **Protected**

---

### POST `/activities/:id/unregister`
Unregister from an activity. **Protected**

---

### POST `/activities/:id/add-user` / POST `/activities/:id/remove-user`
Force-add or force-remove a user (admin override). **Admin**

**Body**
```json
{ "userId": "<userId>" }
```

---

## Testimonials — `/api/testimonials`

### GET `/testimonials`
Get active testimonials. **Public**

---

### GET `/testimonials/admin/all`
Get all (including inactive). **Admin**

---

### POST `/testimonials`
Create a testimonial. **Admin**

**Body**
```json
{
  "name": "Priya Sharma",
  "role": "Software Engineer",
  "text": "Lost 12 kg in 3 months. Incredible trainers!",
  "rating": 5,
  "result": "Lost 12 kg",
  "featured": true
}
```

---

### PUT `/testimonials/:id` / DELETE `/testimonials/:id`
Update or delete. **Admin**

---

## Notifications — `/api/notifications`

### GET `/notifications`
Get all notifications for the logged-in user. **Protected**

**Response**
```json
{
  "notifications": [
    { "_id": "...", "type": "activity", "title": "New Zumba Class", "isRead": false, "createdAt": "..." }
  ]
}
```

---

### PUT `/notifications/mark-all-read`
Mark all as read. **Protected**

---

### PUT `/notifications/:id/read`
Mark a single notification as read. **Protected**

---

### DELETE `/notifications/:id`
Delete a notification. **Protected**

---

## Legal — `/api/legal`

### GET `/legal/:type`
Get legal content. **Public**

`type`: `terms` | `privacy`

**Response**
```json
{
  "legal": {
    "type": "terms",
    "lastUpdated": "2026-05-25T...",
    "sections": [
      { "heading": "1. Acceptance", "body": "<p>By using...</p>" }
    ]
  }
}
```

---

### PUT `/legal/:type`
Update legal content. **Admin**

**Body**
```json
{
  "sections": [
    { "heading": "1. Acceptance of Terms", "body": "<p>By accessing...</p>" }
  ]
}
```

---

## Settings — `/api/settings`

### GET `/settings/footer`
Get footer configuration. **Public**

---

### PUT `/settings/footer`
Update footer content. **Admin**

**Body**
```json
{
  "address": "123 Fitness Avenue, New Delhi 110001",
  "phone": "+91 11 2345 6789",
  "email": "info@powerzone.com",
  "weekdayHours": "6:00 AM – 10:00 PM",
  "weekendHours": "7:00 AM – 8:00 PM",
  "facebook": "https://facebook.com/powerzone",
  "instagram": "https://instagram.com/powerzone",
  "twitter": "https://twitter.com/powerzone",
  "youtube": "https://youtube.com/@powerzone"
}
```

---

## Site Content — `/api/site-content`

Dynamic key-value store for all editable page content. Each `section` maps to a JSON blob.

### GET `/site-content`
Get all content sections. **Public**

---

### GET `/site-content/:section`
Get a single section. **Public**

**Section keys in use:**

| Key | Used by |
|---|---|
| `home_hero` | Home page hero section |
| `home_about` | Home about snapshot |
| `home_stats` | Home counter stats |
| `home_features` | Home features/benefits |
| `about_hero` | About page hero |
| `about_story` | About story section |
| `about_values` | About core values |
| `about_milestones` | About timeline milestones |
| `about_team` | About team section |
| `page_login` | Login page background + text |
| `page_register` | Register page background + text |
| `page_forgot` | Forgot password page background + text |
| `theme` | Active color theme (hex values) |
| `navbar` | Nav links config (label, href, visible, order) |

---

### PUT `/site-content/:section`
Upsert (create or update) a section. **Admin**

**Body** — Any JSON object matching the section's shape. Uses `$set` to avoid dropping required fields on upsert.

---

### POST `/site-content/upload/image`
Upload an image for use in content. **Admin** — `multipart/form-data`

| Field | Type |
|---|---|
| `image` | File (image) |

**Response**
```json
{ "success": true, "url": "https://res.cloudinary.com/..." }
```

---

## Master Data — `/api/v1`

Generic dropdown option store used across the application.

### GET `/v1/master`
Get all active entries. **Public**

**Query params:** `?type=plan` | `?type=workout` | `?type=diet`

**Response**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "plan",
      "code": "MONTHLY",
      "label": { "en": "Monthly" },
      "description": "30-day subscription",
      "isActive": true
    }
  ]
}
```

---

### GET `/v1/master/:type/:code`
Get a single entry by type and code. **Public**

---

### GET `/v1/admin/master`
Get all entries including inactive. **Admin**

**Query params:** `?type=workout`

---

### POST `/v1/admin/master`
Create a new dropdown option. **Admin**

**Body**
```json
{
  "type": "plan",
  "code": "WEEKLY",
  "label": { "en": "Weekly" },
  "description": "7-day subscription option",
  "isActive": true
}
```

> `code` is stored uppercase automatically. Compound unique index on `{ type, code }`.

---

### PUT `/v1/admin/master/:id`
Update an entry. **Admin**

---

### DELETE `/v1/admin/master/:id`
Delete an entry. **Admin**

---

## Payments — `/api/payments`

### GET `/payments/my`
Get logged-in user's payment history. **Protected**

---

### GET `/payments`
Get all payments. **Admin**

---

## Health Check

### GET `/api/health`

**Response**
```json
{ "status": "OK", "timestamp": "2026-05-25T10:00:00.000Z" }
```

---

## Standard Error Responses

```json
{ "message": "Human-readable description of the error" }
```

| Status | Meaning |
|---|---|
| 400 | Bad request / validation error |
| 401 | Missing or invalid token |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Complete Route Map

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                                          🔒
PUT    /api/auth/update-password                             🔒
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token

GET    /api/users/profile                                    🔒
PUT    /api/users/profile                                    🔒
PUT    /api/users/profile/avatar                             🔒 multipart
POST   /api/users/checkin                                    🔒
GET    /api/users/attendance                                 🔒
POST   /api/users/weight                                     🔒
GET    /api/users/progress                                   🔒
PUT    /api/users/progress/:id                               🔒
DELETE /api/users/progress/:id                               🔒
GET    /api/users/my-diet-plan                               🔒
GET    /api/users/my-workout-plan                            🔒
GET    /api/users                                            🔒 admin
POST   /api/users                                            🔒 admin
PUT    /api/users/:id                                        🔒 admin
DELETE /api/users/:id                                        🔒 admin

GET    /api/trainers
GET    /api/trainers/:id
POST   /api/trainers/:id/reviews                             🔒
GET    /api/trainers/me/profile                              🔒 trainer
PUT    /api/trainers/me/profile                              🔒 trainer multipart
GET    /api/trainers/me/clients                              🔒 trainer
GET    /api/trainers/me/clients/:userId                      🔒 trainer
POST   /api/trainers/me/clients/:userId/attendance           🔒 trainer
POST   /api/trainers/me/clients/:userId/diet                 🔒 trainer
POST   /api/trainers/me/clients/:userId/workout              🔒 trainer
POST   /api/trainers                                         🔒 admin multipart
PUT    /api/trainers/:id                                     🔒 admin
DELETE /api/trainers/:id                                     🔒 admin

GET    /api/plans
POST   /api/plans                                            🔒 admin
PUT    /api/plans/:id                                        🔒 admin
DELETE /api/plans/:id                                        🔒 admin
POST   /api/plans/purchase                                   🔒

GET    /api/offers
POST   /api/offers                                           🔒 admin multipart
PUT    /api/offers/:id                                       🔒 admin multipart
DELETE /api/offers/:id                                       🔒 admin

GET    /api/gallery
POST   /api/gallery                                          🔒 admin multipart
PUT    /api/gallery/:id                                      🔒 admin
DELETE /api/gallery/:id                                      🔒 admin

POST   /api/contact
GET    /api/contact                                          🔒 admin
PUT    /api/contact/:id/reply                                🔒 admin

GET    /api/workouts
POST   /api/workouts                                         🔒 trainer/admin
PUT    /api/workouts/:id                                     🔒 trainer/admin
DELETE /api/workouts/:id                                     🔒 admin

GET    /api/diet
POST   /api/diet                                             🔒 trainer/admin
PUT    /api/diet/:id                                         🔒 trainer/admin
DELETE /api/diet/:id                                         🔒 admin

GET    /api/admin/dashboard                                  🔒 admin
POST   /api/admin/assign-trainer                             🔒 admin
POST   /api/admin/assign-workout                             🔒 admin
POST   /api/admin/assign-diet                                🔒 admin
POST   /api/admin/branch-transfer                            🔒 admin
GET    /api/admin/transfers                                  🔒 admin
DELETE /api/admin/transfers/:userId/:transferId              🔒 admin
GET    /api/admin/name-transfers                             🔒 admin
POST   /api/admin/name-transfer                              🔒 admin
DELETE /api/admin/name-transfers/:id                         🔒 admin
GET    /api/admin/transfer-fees                              🔒 admin
POST   /api/admin/transfer-fees                              🔒 admin
PUT    /api/admin/transfer-fees/:id                          🔒 admin
DELETE /api/admin/transfer-fees/:id                          🔒 admin
GET    /api/admin/transfer-settings                          🔒 admin
PUT    /api/admin/transfer-settings                          🔒 admin

GET    /api/payments/my                                      🔒
GET    /api/payments                                         🔒 admin

GET    /api/branches
POST   /api/branches                                         🔒 admin
PUT    /api/branches/:id                                     🔒 admin
DELETE /api/branches/:id                                     🔒 admin

GET    /api/settings/footer
PUT    /api/settings/footer                                  🔒 admin

GET    /api/notifications                                    🔒
PUT    /api/notifications/mark-all-read                      🔒
PUT    /api/notifications/:id/read                           🔒
DELETE /api/notifications/:id                                🔒

GET    /api/legal/:type
PUT    /api/legal/:type                                      🔒 admin

GET    /api/activities
POST   /api/activities                                       🔒 admin
PUT    /api/activities/:id                                   🔒 admin
DELETE /api/activities/:id                                   🔒 admin
POST   /api/activities/:id/register                          🔒
POST   /api/activities/:id/unregister                        🔒
POST   /api/activities/:id/add-user                          🔒 admin
POST   /api/activities/:id/remove-user                       🔒 admin

GET    /api/testimonials
GET    /api/testimonials/admin/all                           🔒 admin
POST   /api/testimonials                                     🔒 admin
PUT    /api/testimonials/:id                                 🔒 admin
DELETE /api/testimonials/:id                                 🔒 admin

GET    /api/site-content
GET    /api/site-content/:section
PUT    /api/site-content/:section                            🔒 admin
POST   /api/site-content/upload/image                        🔒 admin multipart

GET    /api/v1/master
GET    /api/v1/master/:type/:code
GET    /api/v1/admin/master                                  🔒 admin
POST   /api/v1/admin/master                                  🔒 admin
PUT    /api/v1/admin/master/:id                              🔒 admin
DELETE /api/v1/admin/master/:id                              🔒 admin

GET    /api/health
```
