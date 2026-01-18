
# 🚀 ACM-XIM-ENVOY  
### Intelligent Chapter Media & Engagement Platform

ACM-XIM-ENVOY is a **full-stack web platform** built to centralize **news publishing, event management, discussion forums, and live technology updates** for an ACM Student Chapter.  
It provides a secure, scalable, and responsive solution for managing official chapter communications and member engagement.

## 🧠 Overview

ACM-XIM-ENVOY is designed as a **centralized digital hub** for ACM Student Chapters to:

- Publish official announcements
- Manage chapter events
- Host technical discussions
- Display live global tech news
- Provide role-based access for admins and members

The platform follows **modern MERN stack best practices**, supports **JWT authentication**, and integrates **external APIs** for real-time data.

---

## ❗ Problem Statement

Student chapters often rely on fragmented tools like WhatsApp groups, emails, and social media for communication, resulting in:

- Missed announcements  
- Poor content organization  
- No centralized engagement tracking  
- Limited scalability  

**ACM-XIM-ENVOY solves this problem** by providing a single, secure, and extensible platform for all chapter-level interactions.

---

## ✨ Key Features

### 🔐 Authentication & Authorization
- Secure login & registration using JWT
- Role-based access control (Admin / Member)
- Protected routes for admin actions

### 📰 News & Announcements
- Admin-only announcement creation
- Like system for engagement tracking
- Clean editorial-style UI

### 📅 Event Management
- Create and manage chapter events
- Event date, location, and registration links
- Public visibility for all users

### 💬 Discussion Forum
- Topic-based discussion threads
- Comments and replies
- Admin moderation support

### 🌍 Live Tech News
- Real-time global tech news integration
- Powered by **NewsAPI**
- Grid and ticker display modes

### 📊 Admin Dashboard
- Centralized admin control panel
- Content creation & moderation
- Analytics-ready architecture

### 📱 Responsive Design
- Mobile-first UI
- Full-screen mobile navigation
- Black / gray / white editorial theme

---

## 🛠️ Tech Stack

### Frontend
- **React.js**
- **React Router**
- **Context API**
- **Custom CSS (Editorial Theme)**

### Backend
- **Node.js**
- **Express.js**
- **JWT Authentication**
- **Role-based Middleware**

### Database
- **MongoDB Atlas**
- **Mongoose ODM**

### External APIs
- **NewsAPI.org** – Live global tech news

---

## 🏗️ System Architecture

```

Client (React)
↓
REST API (Express + Node.js)
↓
MongoDB Atlas (Data Storage)
↓
External APIs (NewsAPI)

```

- Stateless REST architecture
- Secure token-based authentication
- Scalable and modular backend structure

---

## 🌐 API Integrations

### 🔹 NewsAPI
Used to fetch real-time global technology news.

```

GET /api/external-news

````

Data is processed and displayed in:
- News grid layout
- Horizontal scrolling ticker

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/acm-xim-envoy.git
cd acm-xim-envoy
````

### 2️⃣ Backend Setup

```bash
cd acmmedia-backend
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd acmmedia-frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NEWS_API_KEY=your_newsapi_key
```

---

## 📁 Project Structure

```
acmmedia/
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── api/
│   └── styles/
```


## 📄 License

This project is licensed under the **MIT License**.
Free to use, modify, and distribute.

---

## 👨‍💻 Author

**Kaif Khurshid**
ACM XIM Student Chapter | CHAIRPERSON

---

⭐ If you found this project helpful, consider giving it a star!


