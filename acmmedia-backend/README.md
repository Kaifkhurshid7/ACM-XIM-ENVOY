# ACM Media Backend

Production-grade Express.js REST API with Socket.IO real-time communication, optimized for 100+ concurrent users.

## Architecture

```
server.js (entry point)
└── src/
    ├── config/         → Database, JWT, indexes, app configuration
    ├── constants/      → Enums, shared values, socket events
    ├── docs/           → Swagger/OpenAPI specification
    ├── middlewares/    → Security, auth, RBAC, validation, rate limiting, errors
    ├── models/         → Mongoose schemas (indexed)
    ├── routes/         → Express route handlers (paginated, lean)
    ├── services/       → Business logic (analytics, news caching)
    ├── socket.js       → Socket.IO (debounced, room-scoped)
    └── utils/          → Logger (Pino), pagination, response helpers
```

## Security Stack

| Middleware | Purpose |
|-----------|---------|
| Helmet | Secure HTTP headers (XSS, clickjacking, MIME) |
| CORS | Origin whitelist with preflight caching |
| express-mongo-sanitize | NoSQL injection prevention |
| HPP | HTTP parameter pollution protection |
| express-rate-limit | Brute-force & DDoS protection |
| Body limits (10KB) | Payload-based DoS prevention |
| Input validation | express-validator sanitization |

## Performance Optimizations

- **Database indexes** on all frequently queried fields
- **Lean queries** (3x faster serialization)
- **Pagination** on all list endpoints (default 20, max 50)
- **Response compression** (gzip, 60-80% reduction)
- **Debounced Socket.IO** analytics (prevents N queries on rapid mutations)
- **Graceful shutdown** for zero-downtime deploys

## Quick Start

```bash
npm install
cp .env.example .env
# Configure MONGO_URI, JWT_SECRET
npm run dev
```

Server: `http://localhost:5000`
API docs: `http://localhost:5000/api-docs`

## Deployment

Deployed on Render as a Node.js service. Entry point is `server.js`.
Also supports Vercel serverless via `vercel.json`.

Health check: `GET /` → "Server: Health OK"
