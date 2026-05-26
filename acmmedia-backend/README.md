# ACM Media Backend

Express.js REST API with Socket.IO real-time communication for the ACM-XIM-ENVOY platform.

## Architecture

```
server.js (entry point)
└── src/
    ├── config/         → Database, JWT, app configuration
    ├── constants/      → Enums, shared values
    ├── docs/           → Swagger/OpenAPI spec
    ├── middlewares/    → Auth, RBAC, validation, error handling
    ├── models/         → Mongoose schemas
    ├── routes/         → Express route handlers
    ├── services/       → Business logic layer
    ├── socket.js       → Socket.IO setup
    └── utils/          → Response helpers
```

## Quick Start

```bash
npm install
cp .env.example .env
# Configure MONGO_URI and JWT_SECRET
npm run dev
```

## Key Design Decisions

- **Service Layer**: Business logic separated from route handlers for testability
- **Centralized Error Handling**: AppError class + global error middleware
- **Input Validation**: express-validator chains with consistent error responses
- **Socket.IO Rooms**: Admin-only analytics room for security
- **News Caching**: 30-min cache reduces external API dependency

## Deployment

Deployed on Render as a Node.js service. Entry point is `server.js`.
Also supports Vercel serverless via `vercel.json`.
