# ACM-XIM-ENVOY

A production-grade, full-stack community platform built for the **ACM Student Chapter at XIM University**. Provides real-time news, event management, discussion forums, and administrative tools for chapter coordinators.

**Live Demo:** [Frontend](https://acmmedia-frontend.vercel.app) | [Backend API](https://acmmedia-backend.onrender.com)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│  Vercel CDN → React Router → Axios → Socket.IO Client           │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼──────────────────────────────────┐
│                     SERVER (Express.js API)                       │
│  Render → Express → Mongoose → MongoDB Atlas                     │
│                    → Socket.IO (real-time)                        │
│                    → NewsAPI (external feed)                      │
└─────────────────────────────────────────────────────────────────┘
```

**Monorepo Structure:**
```
ACM-XIM-ENVOY/
├── acmmedia-backend/          # Express.js REST API + Socket.IO
│   ├── server.js              # Entry point (deployment target)
│   ├── src/
│   │   ├── config/            # Database, JWT, app configuration
│   │   ├── constants/         # Enums, magic strings, shared values
│   │   ├── docs/              # Swagger/OpenAPI specification
│   │   ├── middlewares/       # Auth, RBAC, validation, error handling
│   │   ├── models/            # Mongoose schemas (User, Post, Event, Forum, Comment)
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # Business logic (analytics, news)
│   │   ├── socket.js          # Socket.IO initialization & events
│   │   └── utils/             # Response helpers
│   ├── uploads/               # User-uploaded images (gitignored)
│   ├── vercel.json            # Vercel serverless deployment config
│   └── package.json
│
├── acmmedia-frontend/         # React + Vite SPA
│   ├── src/
│   │   ├── api/               # Axios API modules (auth, posts, events, etc.)
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/            # Generic UI primitives (badges, etc.)
│   │   ├── constants/         # Frontend constants & enums
│   │   ├── context/           # React Context providers (Auth, Socket)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Route-level page components
│   │   ├── styles/            # CSS stylesheets
│   │   └── utils/             # Helper functions
│   ├── vercel.json            # Vercel SPA rewrite config
│   └── package.json
│
└── README.md                  # This file
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18, Vite, React Router 6 | SPA with client-side routing |
| State | React Context API | Auth state, Socket connection |
| Real-time | Socket.IO Client | Live likes, replies, analytics |
| HTTP | Axios | API communication with interceptors |
| Backend | Express.js 4 | REST API server |
| Database | MongoDB (Mongoose 7) | Document storage |
| Auth | JWT + bcrypt | Stateless authentication |
| Validation | express-validator | Request validation & sanitization |
| Real-time | Socket.IO 4 | WebSocket server |
| Docs | Swagger UI + swagger-jsdoc | Interactive API documentation |
| External | NewsAPI | Technology news aggregation |
| Hosting | Vercel (frontend), Render (backend) | Production deployment |

---

## Features

### Public Features
- **News Feed** — Chapter announcements with like/comment interactions
- **Tech News** — Aggregated technology headlines (cached, with fallback)
- **Events** — Upcoming workshops, hackathons, and seminars
- **Discussion Forum** — Threaded community discussions with real-time replies
- **Responsive Design** — Mobile-first with hamburger navigation

### Authenticated Features
- **Like Posts** — Toggle likes with real-time count updates
- **Comment** — Participate in post discussions
- **Create Threads** — Start forum discussions
- **Reply to Threads** — Contribute to existing discussions

### Admin Features
- **Content Management** — Create/delete posts and events
- **Content Moderation** — Delete comments and forum threads
- **Live Analytics** — Real-time platform metrics (users, posts, likes, comments)
- **Admin Creation** — Create additional admin accounts
- **File Upload** — Image upload for platform content

### Technical Features
- **Real-time Updates** — Socket.IO for live likes, replies, and analytics
- **Role-Based Access** — Member vs Admin permission system
- **Input Validation** — Comprehensive server-side validation
- **Error Handling** — Centralized error middleware with consistent responses
- **API Documentation** — Swagger UI at `/api-docs`
- **News Caching** — 30-minute cache with graceful fallback

---

## Authentication Flow

```
┌─────────┐     POST /auth/login      ┌─────────┐
│  Client │ ─────────────────────────► │  Server │
│         │ ◄───────────────────────── │         │
│         │     { token: "jwt..." }    │         │
│         │                            │         │
│         │  GET /auth/me              │         │
│         │  Authorization: Bearer jwt │         │
│         │ ─────────────────────────► │         │
│         │ ◄───────────────────────── │         │
│         │     { name, email, role }  │         │
└─────────┘                            └─────────┘
```

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens contain user ID and role
- Admin registration requires a secret key
- University email domain restriction (client + server)

---

## Role-Based Access Control

| Action | Guest | Member | Admin |
|--------|-------|--------|-------|
| View posts/events/forum | ✓ | ✓ | ✓ |
| Like posts | ✗ | ✓ | ✓ |
| Comment on posts | ✗ | ✓ | ✓ |
| Create forum threads | ✗ | ✓ | ✓ |
| Reply to threads | ✗ | ✓ | ✓ |
| Create posts/events | ✗ | ✗ | ✓ |
| Delete any content | ✗ | ✗ | ✓ |
| View analytics | ✗ | ✗ | ✓ |
| Upload files | ✗ | ✗ | ✓ |

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | — | Register new user |
| POST | /auth/login | — | Login, receive JWT |
| GET | /auth/me | Bearer | Get current user profile |
| POST | /auth/create-admin | Admin | Create admin account |
| GET | /posts | — | List all posts |
| POST | /posts | Admin | Create post |
| PATCH | /posts/:id | Admin | Update post |
| DELETE | /posts/:id | Admin | Delete post |
| PUT | /posts/like/:id | Bearer | Toggle like |
| GET | /comments/:postId | — | Get post comments |
| POST | /comments | Bearer | Add comment |
| DELETE | /comments/:id | Admin | Delete comment |
| GET | /events | — | List events |
| POST | /events | Admin | Create event |
| PATCH | /events/:id | Admin | Update event |
| DELETE | /events/:id | Admin | Delete event |
| GET | /forum | — | List threads |
| POST | /forum | Bearer | Create thread |
| POST | /forum/reply/:id | Bearer | Reply to thread |
| DELETE | /forum/:id | Admin | Delete thread |
| GET | /external-news | — | Tech news (cached) |
| GET | /admin/stats | Admin | Platform analytics |
| POST | /upload | Admin | Upload image |

Full interactive documentation: `/api-docs` (Swagger UI)

---

## Environment Variables

### Backend (`acmmedia-backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| MONGO_URI | Yes | MongoDB connection string |
| JWT_SECRET | Yes (prod) | JWT signing secret |
| ADMIN_SECRET | No | Secret for admin registration |
| NEWS_API_KEY | No | NewsAPI.org API key |
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | Environment (development/production) |

### Frontend (`acmmedia-frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_BASE_URL | No | Backend API URL (auto-detected) |
| VITE_SOCKET_URL | No | Socket.IO server URL |

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm

### Backend

```bash
cd acmmedia-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run dev
```

Server starts at `http://localhost:5000`
API docs at `http://localhost:5000/api-docs`

### Frontend

```bash
cd acmmedia-frontend
npm install
cp .env.example .env
# Edit .env if needed (defaults work for local dev)
npm run dev
```

App starts at `http://localhost:5173`
Vite proxies `/api` requests to the backend automatically.

---

## Deployment

### Backend (Render)
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Entry Point:** `server.js`
- Environment variables configured in Render dashboard

### Frontend (Vercel)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- SPA routing handled by `vercel.json` rewrites

Both services are independently deployable. The frontend communicates with the backend via the configured API URL.

---

## Real-Time Architecture

Socket.IO enables live features without polling:

- **Post Likes** — Like count updates broadcast to all connected clients
- **Forum Replies** — New replies appear instantly for all viewers
- **Admin Analytics** — Dashboard metrics update in real-time on content changes

Admin clients authenticate via token to join a privileged "admins" room, ensuring analytics data is only sent to authorized users.

---

## Future Improvements

- [ ] Password reset via email
- [ ] User profile editing
- [ ] Post image attachments
- [ ] Notification system
- [ ] Search functionality
- [ ] Pagination for posts/events
- [ ] Rate limiting
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Dark/light theme toggle

---

## License

MIT

---

Built with care by the ACM Student Chapter, XIM University.
