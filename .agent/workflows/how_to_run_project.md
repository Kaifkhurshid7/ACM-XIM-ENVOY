---
description: How to start the whole ACM Media project
---

# How to Run ACM Media Project

Follow these steps to start both the backend and frontend servers.

### Prerequisites
- Node.js installed
- MongoDB installed and running locally

### 1. Start the Backend Server

Open a terminal and run:

```powershell
cd backend
npm install
# Ensure .env exists with MONGO_URI, JWT_SECRET, and NEWS_API_KEY
npm run dev
```

The backend will start on **http://localhost:5000**.

### 2. Start the Frontend Application

Open a **new** terminal (keep the backend running) and run:

```powershell
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173** (or similar).

### 3. Open in Browser

Visit **http://localhost:5173** to use the application.

---
**Troubleshooting:**
- If you see `EADDRINUSE` errors, kill existing node processes: `taskkill /F /IM node.exe`
