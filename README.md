# 📚 Courses Platform — Backend API

A full-featured **online learning platform** backend built with **NestJS**, **PostgreSQL**, and **Prisma ORM**. The platform supports two user roles (Student & Instructor), full course lifecycle management, quizzes, real-time notifications, and social authentication.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS (Node.js) |
| Language | TypeScript |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Authentication | JWT (Access + Refresh Tokens), Google OAuth2, Facebook OAuth2 |
| Real-time | Socket.IO (WebSockets) |
| File Upload | Cloudinary |
| Email | Nodemailer + @nestjs-modules/mailer |
| API Docs | Swagger / OpenAPI |
| Containerization | Docker + Docker Compose |
| Background Jobs | @nestjs/schedule (Cron Jobs) |

---

## ✅ Completed Features

### 🔐 Authentication (`/api/v1/auth`)

- **Register** — Create a new account with email/password, sends a verification email
- **Email Verification** — Token-based email confirmation
- **Resend Verification Email** — Re-send verification if token expired
- **Login** — Local login with JWT access + refresh token (HttpOnly cookie)
- **Refresh Token** — Rotate access token using a valid refresh token
- **Forgot Password** — Send password-reset link via email
- **Reset Password** — Reset password using the emailed token
- **Change Password** — Change password while authenticated
- **Restore Account** — Recover a soft-deleted account
- **Logout** — Invalidate the refresh token
- **Google OAuth2** — Sign in / register via Google
- **Facebook OAuth2** — Sign in / register via Facebook
- **Select Role** — After social login, user selects STUDENT or INSTRUCTOR role

> Auth uses an **Outbox Pattern** to reliably deliver emails — emails are queued in DB and processed by a background cron job every 30 seconds.

---

### 👤 User (`/api/v1/user`)

- Get current user profile
- Update profile information
- Upload/update profile photo (Cloudinary)
- Soft-delete account
- **Admin Panel** — List all users, manage accounts

---

### 👨‍🏫 Instructor (`/api/v1/instructor`)

- Instructor profile management
- View instructor's own courses and stats

---

### 🎓 Student (`/api/v1/student`)

- Student profile management
- Track enrolled courses and progress

---

### 📂 Categories (`/api/v1/categories`)

- List all course categories (public)
- **Admin Only** — Create, update, delete categories

---

### 📖 Courses (`/api/v1/course`)

- Create a course (Instructor)
- Update course details & thumbnail (Instructor)
- List all published courses (public, with filters)
- Get single course details
- Publish / unpublish course

---

### 📑 Sections (`/api/v1/sections`)

- Add sections to a course (Instructor)
- Update / delete sections
- Reorder sections

---

### 🎬 Lessons (`/api/v1/lessons`)

- Add lessons to a section (Instructor)
- Upload lesson video/content (Cloudinary)
- Update / delete lessons
- Manage lesson status (published/draft)
- **Lesson Progress** — Students mark lessons as complete, progress is tracked

---

### 📝 Reviews (`/api/v1/reviews`)

- Students can leave a review & rating on an enrolled course
- Update / delete own review
- Get all reviews for a course

---

### 📋 Enrollment (`/api/v1/enrollment`)

- Enroll in a course (Student)
- View enrolled courses
- Track overall course completion percentage

---

### 🧠 Quizzes (`/api/v1/quiz`)

- Create a quiz for a lesson (Instructor)
- Add questions and answer choices to a quiz
- Students can attempt a quiz
- Auto-grade quiz attempts and store results
- View quiz attempt history and scores

---

### 🔔 Notifications (`/api/v1/notification`)

- Real-time notifications via **Socket.IO WebSockets**
- Notifications triggered on key events (enrollment, quiz results, etc.)
- Get all notifications for current user
- Mark notifications as read

---

### ⚙️ Background Jobs (Cron)

| Job | Schedule | Purpose |
|---|---|---|
| `OutboxJob` | Every 30 seconds | Process pending email queue (Outbox Pattern) |
| `OutboxCleanupJob` | Scheduled | Remove old processed outbox records |
| `UserCleanupJob` | Scheduled | Permanently delete soft-deleted accounts after grace period |

---

## 🗃️ Database Models

```
User          ← base user (email, password, role)
├── Student   ← student profile
├── Instructor ← instructor profile
└── Admin     ← admin profile

Course
├── Section
│   └── Lesson
│       ├── LessonProgress
│       └── Quiz
│           ├── Question
│           └── QuizAttempt
├── Enrollment
├── Review
└── Category

Notification
UserToken     ← refresh tokens
Outbox        ← reliable email queue
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL 15
- Docker (optional)

### Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/Mohamed-Shahata/Courses_platform.git
cd Courses_platform

# 2. Install dependencies
npm install

# 3. Copy and fill environment variables
cp .env.example .env

# 4. Run database migrations
npx prisma migrate dev

# 5. Start in development mode
npm run start:dev
```

### Docker Setup

```bash
# Make sure .env.docker is configured, then:
docker-compose up --build
```

---

## 📄 API Documentation

Once the server is running, visit:

```
http://localhost:3000/api/docs
```

The Swagger UI lists all endpoints, request bodies, and responses. Authentication is via Bearer JWT token.

---

## 🌐 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `FACEBOOK_APP_ID` | Facebook OAuth2 app ID |
| `FACEBOOK_APP_SECRET` | Facebook OAuth2 app secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `MAIL_HOST` | SMTP host |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |
| `PORT` | Server port (default: 3000) |

---

## 📁 Project Structure

```
src/
├── main.ts                  # App entry point + Swagger setup
├── app.module.ts            # Root module
├── jobs/                    # Background cron jobs
│   ├── outbox.job.ts
│   ├── outbox-cleanup.job.ts
│   └── user-cleanup.job.ts
├── modules/
│   ├── auth/                # Authentication (JWT, OAuth, Outbox)
│   ├── user/                # User profile & admin
│   ├── instructor/          # Instructor profile
│   ├── student/             # Student profile
│   ├── categories/          # Course categories
│   ├── course/              # Courses
│   ├── sections/            # Course sections
│   ├── lessons/             # Lessons & progress
│   ├── enrollment/          # Course enrollment
│   ├── reviews/             # Course reviews
│   ├── quiz/                # Quizzes
│   ├── question/            # Quiz questions
│   ├── quizAttempt/         # Quiz attempts
│   ├── notification/        # Real-time notifications
│   └── db/                  # Prisma database module
└── shared/
    ├── cloudinary/          # File upload service
    ├── mail/                # Email service
    ├── guards/              # JWT & role guards
    ├── decorators/          # Custom decorators
    ├── interceptors/        # Response formatting
    ├── enums/               # App-wide enums
    ├── constants/           # Messages & variables
    └── utils/               # Helpers (cookies, generators)

prisma/
├── schema.prisma
└── models/                  # Split Prisma model files
    ├── user/
    ├── course/
    ├── quiz/
    ├── lesson/
    ├── notification/
    └── enums.prisma
```

---

## 🔒 Role-Based Access Control

The platform supports two user roles enforced via guards:

- **STUDENT** — Can enroll, watch lessons, take quizzes, leave reviews
- **INSTRUCTOR** — Can create and manage courses, sections, lessons, and quizzes
- **ADMIN** — Can manage users and categories (admin controllers)

---

## 🚧 Work In Progress

The project is still under active development. Planned upcoming features include:

- Payment integration
- Course search & advanced filtering
- Student dashboard analytics
- Instructor revenue dashboard

---

## 🧑‍💻 Author

**Mohamed Shahata**  
GitHub: [@Mohamed-Shahata](https://github.com/Mohamed-Shahata) 
GitHub: [@Farha-Ashraf](https://github.com/farha-158)
