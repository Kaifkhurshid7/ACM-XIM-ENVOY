# ACM Media Backend

`acmmedia-backend` is the Node.js and Express API for the ACM chapter media platform. It handles authentication, announcements, comments, forum discussions, events, admin analytics, image uploads, external tech news, and Socket.IO updates for live admin and community features.

## What This Project Does

This service provides the backend used by the ACM chapter frontend. It stores application data in MongoDB, secures protected routes with JWT authentication, and exposes REST endpoints under `/api`.

Core capabilities include:

- member and admin registration/login
- university email domain validation during signup
- admin-managed posts and events with complete CRUD
- post likes and comments
- forum threads and replies
- chapter analytics for admins
- image uploads for admin content workflows
- external technology news aggregation with in-memory caching
- realtime updates over Socket.IO

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication with `jsonwebtoken`
- password hashing with `bcryptjs`
- Socket.IO
- Multer for uploads
- Axios for external news requests
- NodeCache for API response caching

## Project Structure

```text
config/       Database and JWT configuration
middleware/   Authentication and role guards
models/       Mongoose models
routes/       REST API route modules
services/     Shared backend services such as analytics
uploads/      Uploaded image files served statically
server.js     Express bootstrap and route registration
socket.js     Socket.IO bootstrap and event helpers
```

## Quick Start

### Prerequisites

- Node.js 18 or newer recommended
- npm
- MongoDB database connection string

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Run in production

```bash
npm start
```

The API runs on `http://localhost:5000` by default.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the server with `nodemon` |
| `npm start` | Start the server with Node.js |

## API Base URL

All application routes are mounted under `/api/v1`.

Interactive API docs are available at `/api-docs` (Swagger UI).

Health checks:

- `GET /` returns a plain server health message
- `GET /api` returns a plain API health message
- `GET /api/v1` returns a versioned API health message

## Main API Routes

### Authentication

Base path: `/api/v1/auth`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/me` | Authenticated | Return current user without password |
| `POST` | `/register` | Public | Register a member or admin |
| `POST` | `/create-admin` | Admin | Create another admin account |
| `POST` | `/login` | Public | Return JWT token |

Registration is restricted to official XIM domains:

- `@xim.edu.in`
- `@stu.xim.edu.in`

### Posts

Base path: `/api/v1/posts`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List all posts |
| `GET` | `/:id` | Public | Get a single post by id |
| `POST` | `/` | Admin | Create a post |
| `PATCH` | `/:id` | Admin | Update a post |
| `PUT` | `/like/:id` | Authenticated | Toggle like on a post |
| `DELETE` | `/:id` | Admin | Delete a post |

### Comments

Base path: `/api/v1/comments`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/:postId` | Public | List comments for a post |
| `POST` | `/` | Authenticated | Add a comment to a post |
| `DELETE` | `/:id` | Admin | Delete a comment |

### Forum

Base path: `/api/v1/forum`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List discussion threads |
| `POST` | `/` | Authenticated | Create a thread |
| `POST` | `/reply/:id` | Authenticated | Add a reply to a thread |
| `DELETE` | `/:id` | Admin-only check inside route | Delete a thread |

### Events

Base path: `/api/v1/events`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | List events sorted by date |
| `GET` | `/:id` | Public | Get event by id |
| `POST` | `/` | Admin | Create an event |
| `PATCH` | `/:id` | Admin | Update an event |
| `DELETE` | `/:id` | Admin | Delete an event |

### Admin Analytics

Base path: `/api/v1/admin`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/stats` | Admin | Return platform analytics |

Current analytics include:

- total users
- total posts
- total comments
- total likes across all posts

### External News

Base path: `/api/v1/external-news`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Fetch technology headlines from NewsAPI |

Notes:

- news responses are cached in memory for 30 minutes
- if the news API key is missing, the route returns a fallback placeholder response instead of crashing

### Uploads

Base path: `/api/v1/upload`

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Admin | Upload an image using multipart form-data |
| `GET` | `/` | Admin | List uploaded images |

Upload details:

- expected field name: `image`
- allowed file types: `jpg`, `jpeg`, `png`, `gif`, `webp`
- max file size: 5 MB
- uploaded files are served statically from `/uploads/...`

## Authentication

Protected routes expect an `Authorization` header:

```http
Authorization: Bearer <token>
```

The JWT payload contains:

- user id
- user role

Role checks are handled by middleware for routes that require admin permissions.

## Socket.IO

Socket.IO is initialized on the same HTTP server as Express.

Current behavior:

- clients can emit `auth` with a JWT token
- admin sockets join the `admins` room after token verification
- analytics updates are emitted to admins with `analytics:update`
- post likes are broadcast with `post:like-update`
- new forum replies are broadcast with `forum:new-reply`

## Data Models

### User

- `name`
- `email`
- `password`
- `role`

### Post

- `title`
- `content`
- `author`
- `likes`
- `createdAt`

### Comment

- `postId`
- `user`
- `text`
- `createdAt`

### Forum

- `title`
- `description`
- `author`
- `replies`
- `createdAt`

### Event

- `title`
- `description`
- `date`
- `location`
- `registrationLink`
- `isPast`
- `createdAt`

## Frontend Integration

This backend is designed to work with the ACM frontend and exposes the route groups used there for:

- auth flows
- home feed posts
- comments and likes
- forum threads and replies
- events
- external news
- admin analytics
- realtime status updates

## Deployment Notes

- `vercel.json` is present in this repository, but this project itself is an Express backend rather than a static frontend
- CORS is currently open via `app.use(cors())`
- uploaded files are stored on the local filesystem under `uploads/`

## Scalability Note

- routes, middleware, and services are modularized for easier horizontal growth
- API versioning under `/api/v1` supports backward-compatible evolution
- JWT auth enables stateless API servers behind load balancers
- MongoDB indexing on high-traffic fields (email, post/event dates, forum timestamps) is the next optimization step
- response caching is already used for external news and can be expanded to hot read endpoints
- horizontal scaling via multiple Node instances + load balancer is straightforward with the current stateless pattern
- Redis is the recommended next step for distributed caching, rate limiting, and pub/sub coordination

## Important Notes For Contributors

- the codebase currently includes fallback values for the database connection, JWT secret, and admin secret
- analytics are emitted after key mutations such as registration, comments, likes, post deletion, and thread deletion
- the news cache is in-memory, so it resets whenever the server restarts
