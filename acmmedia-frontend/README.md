# ACM-XIM-ENVOY Frontend

`ACM-XIM-ENVOY` is the frontend for the ACM student chapter media and engagement platform. It gives members and admins a single place to view announcements, browse events, join discussions, read global tech news, and manage chapter content.

## What This Project Does

This application is the public and authenticated UI layer for the ACM chapter platform. It connects to a backend API for data and a Socket.IO server for realtime updates.

Core flows include:

- member registration and login
- admin-only authentication and dashboard access
- chapter announcements on the home feed
- forum discussions with live replies
- events discovery and registration links
- external technology news through `TechPulse`
- realtime admin analytics and connection status indicators

## Tech Stack

- React 18
- Vite 4
- React Router DOM 6
- Axios
- Socket.IO Client
- plain CSS styles under `src/styles`
- Vercel SPA rewrites via `vercel.json`

## Main Screens

| Route | Description |
| --- | --- |
| `/` | Main chapter feed with announcements and live status |
| `/login` | Member sign-in |
| `/register` | Registration for members and admins |
| `/news` | External tech news grid |
| `/events` | Chapter events and registration links |
| `/forum` | Community discussions and replies |
| `/admin-login` | Restricted admin login |
| `/admin` | Admin dashboard for publishing and analytics |

## Folder Structure

```text
src/
  api/         API wrapper functions for auth, posts, forum, events, news
  components/  Shared UI building blocks
  context/     Auth and socket providers
  pages/       Route-level pages
  styles/      Global and page-specific styles
public/        Static assets
dist/          Production build output
```

## Quick Start

### Prerequisites

- Node.js 18 or newer recommended
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Vite will usually start the app at `http://localhost:5173`.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Generate the production build |
| `npm run preview` | Preview the production build locally |

## Backend Integration

The frontend currently expects a backend that provides:

- authentication endpoints
- posts and likes
- forum threads and replies
- events management
- external news aggregation
- Socket.IO events for forum and analytics updates

### REST endpoints used by the app

- `/auth/login`
- `/auth/register`
- `/auth/me`
- `/posts`
- `/posts/like/:id`
- `/forum`
- `/forum/reply/:id`
- `/events`
- `/external-news`

## Environment Configuration

The frontend now supports Vite environment variables for backend configuration.

Create a local `.env` file in the project root:

```env
VITE_API_BASE_URL=https://acmmedia-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://acmmedia-backend.onrender.com
```

You can use `.env.example` as the starting point.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for Axios API requests |
| `VITE_SOCKET_URL` | Base URL for Socket.IO connection |

If these values are not set, the app falls back to the current Render backend URLs.

## Backend Configuration Notes

`vite.config.js` still includes a dev proxy for `/api`. That is fine, but the app itself now uses environment variables as the primary configuration source, which makes switching between local and hosted backends much easier.

## Authentication Behavior

- JWT tokens are stored in `localStorage`
- Axios automatically attaches `Authorization: Bearer <token>` when a token exists
- registration is restricted to official university email domains:
  - `@stu.xim.edu.in`
  - `@xim.edu.in`
- admin routes are protected by authenticated role checks

## Realtime Features

Socket.IO is used for:

- live forum reply updates
- admin analytics refreshes
- live connection badges on key pages

If the socket connection fails, the app still tries to show fallback data where possible.

## Deployment Notes

- `vercel.json` rewrites all routes to `index.html`, which is required for React Router on static hosting
- the repository already contains a `dist/` folder, but it is generated output and can be rebuilt with `npm run build`

## Important Notes For Contributors

- this repository is the frontend only
- the old README previously described a separate `backend/` and `frontend/` monorepo layout, which does not match the current codebase
- use `.env.example` to configure backend URLs for your environment
