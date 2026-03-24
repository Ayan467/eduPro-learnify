# EduPro — Online Learning Platform

A production-ready full-stack online learning platform built with React, Node.js, MongoDB, and Socket.io.

---

## Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, React Router v6, Axios, Socket.io Client  
**Backend:** Node.js, Express.js, MongoDB + Mongoose, JWT Auth, Socket.io, Multer, PDFKit  
**Payment:** Razorpay (mock integration included)

---

## Project Structure

```
eduPro/
├── backend/
│   ├── controllers/       # Business logic
│   ├── routes/            # Express routes
│   ├── models/            # Mongoose schemas
│   ├── middleware/        # Auth, upload middleware
│   ├── utils/             # Socket.io, seed data
│   ├── config/            # DB config
│   ├── uploads/           # Uploaded files (gitignore)
│   ├── server.js          # Entry point
│   └── .env.example
└── frontend/
    └── src/
        ├── components/    # Reusable UI components
        ├── pages/         # Route pages
        │   └── admin/     # Admin-only pages
        ├── context/       # React Context (Auth, Course)
        ├── hooks/         # Custom hooks
        ├── services/      # API + Socket services
        └── utils/
```

---

## Quick Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Git

---

### Step 1 — Clone & Install

```bash
# Clone the project
git clone <your-repo-url>
cd eduPro

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 2 — Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/edupro
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

> **MongoDB Atlas Setup:**
> 1. Go to https://cloud.mongodb.com
> 2. Create a free cluster
> 3. Click Connect → Connect your application
> 4. Copy the connection string and replace `<user>/<password>`
> 5. Add your IP to Network Access whitelist (or use 0.0.0.0/0 for dev)

---

### Step 3 — Create Upload Directories

```bash
cd backend
mkdir -p uploads/images uploads/videos uploads/materials uploads/misc
```

---

### Step 4 — Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- **Admin:** admin@edupro.com / admin123
- **Student:** student@edupro.com / student123
- 3 sample courses

---

### Step 5 — Run the App

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App running on http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/update-profile | Update profile |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | List all courses |
| GET | /api/courses/:id | Get single course |
| POST | /api/courses | Create course (admin) |
| PUT | /api/courses/:id | Update course (admin) |
| DELETE | /api/courses/:id | Delete course (admin) |

### Enrollments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/enroll | Enroll in a course |
| GET | /api/enroll/my-courses | Get my enrollments |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/quizzes/:courseId | Get course quizzes |
| POST | /api/quizzes | Create quiz (admin) |
| POST | /api/quizzes/:id/submit | Submit quiz answers |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/progress/:courseId | Get course progress |
| POST | /api/progress/:courseId/lecture/:lectureId | Mark lecture complete |
| GET | /api/progress/all | All my progress |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |
| GET | /api/payments/my-payments | Payment history |

### Certificates
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/certificates/my | My certificates |
| GET | /api/certificates/:id/download | Download PDF |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/students | All students |
| PUT | /api/admin/students/:id/toggle | Toggle student status |
| GET | /api/admin/courses/stats | Course stats |

---

## Real-Time Features (Socket.io Events)

| Event | Direction | Description |
|-------|-----------|-------------|
| join_course | Client → Server | Join course chat room |
| send_message | Client → Server | Send chat message |
| new_message | Server → Client | Receive chat message |
| progress_update | Client → Server | Broadcast progress |
| broadcast_notification | Admin → Server | Send to all users |
| notification | Server → Client | Receive notification |

---

## Payment Integration (Razorpay)

For real payments:
1. Create account at https://razorpay.com
2. Get test API keys from Dashboard → Settings → API Keys
3. Add to `.env`
4. In production: replace mock verification in `PaymentModal.jsx` with Razorpay Checkout SDK

---

## Deployment

### Backend (Render.com — free)
1. Push backend to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set root directory to `backend`
4. Add all environment variables
5. Build command: `npm install`
6. Start command: `npm start`

### Frontend (Vercel — free)
1. Push frontend to GitHub
2. Go to https://vercel.com → Import Project
3. Set root directory to `frontend`
4. Add env variable: `VITE_API_URL=https://your-backend.render.com`
5. Update `vite.config.js` proxy to point to deployed backend

### MongoDB
Use MongoDB Atlas free tier (512MB storage).

---

## Features Checklist

- [x] JWT Authentication (register/login)
- [x] Role-based access (Admin / Student)
- [x] Protected routes
- [x] Browse & search courses
- [x] Enroll in courses (free + paid)
- [x] Video lecture player
- [x] Progress tracking per lecture
- [x] Module-based quizzes with scoring
- [x] Auto certificate generation on 100% completion
- [x] PDF certificate download
- [x] Real-time chat (Socket.io)
- [x] Discussion forum per course
- [x] Real-time notifications
- [x] Razorpay payment (mock + real ready)
- [x] Admin dashboard with stats
- [x] Admin course CRUD
- [x] Admin student management
- [x] File uploads (Multer)
- [x] Rate limiting
- [x] Input validation
- [x] Loading skeletons
- [x] Toast notifications
- [x] Responsive design (mobile-first)

---

## License
MIT

---

## v2 Updates — 3-Role System

### New Roles
| Role | Access |
|------|--------|
| **Student** | Browse, enroll, learn, quiz, certificate, wishlist, chat |
| **Instructor** | Create courses, manage curriculum, view students, track earnings |
| **Admin** | Full platform control, verify instructors, manage all users/courses |

### New Features Added
- ✅ Instructor role with full dashboard, earnings, student tracking
- ✅ Wishlist for students
- ✅ Course ratings & reviews system
- ✅ Real-time notifications (bell icon with badge)
- ✅ Password change & forgot-password flow
- ✅ Admin can verify instructors
- ✅ Instructor course submission → Admin approval workflow
- ✅ Per-course revenue breakdown for instructors
- ✅ Monthly revenue chart

### Demo Accounts (after seed)
```
Admin:       admin@edupro.com      / admin123
Instructor:  priya@edupro.com      / instructor123
Instructor:  amit@edupro.com       / instructor123
Student:     student@edupro.com    / student123
```

### Registration Roles
Students and Instructors can self-register by passing `role` in register request:
- `"role": "student"` (default)
- `"role": "instructor"`

Admins are created only via seeder script.
