# ACM Media Frontend

React SPA built with Vite for the ACM-XIM-ENVOY platform.

## Architecture

```
src/
├── api/            → Axios API modules (one per resource)
├── components/     → Reusable UI components
│   └── ui/         → Generic UI primitives
├── constants/      → Shared constants & enums
├── context/        → React Context providers (Auth, Socket)
├── hooks/          → Custom React hooks
├── pages/          → Route-level page components
├── styles/         → CSS stylesheets
└── utils/          → Helper functions
```

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Key Design Decisions

- **Centralized API Client**: Single Axios instance with token interceptor
- **Context-based Auth**: Global auth state without external state libraries
- **Custom Hooks**: Reusable connection status and socket hooks
- **Constants Module**: Shared enums prevent typos across components
- **Utility Functions**: Defensive API response parsing

## Deployment

Deployed on Vercel as a static SPA. `vercel.json` handles SPA routing.
Build command: `npm run build` → outputs to `dist/`.
