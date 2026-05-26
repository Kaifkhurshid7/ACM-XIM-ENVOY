/**
 * App Component - Root Application Router
 * 
 * Defines the client-side routing structure for the SPA.
 * All routes are publicly accessible; page-level components
 * handle their own authentication checks where needed.
 * 
 * Route Structure:
 * - /           → Home (main feed with posts)
 * - /login      → Student login
 * - /register   → Student registration
 * - /forum      → Community discussion forum
 * - /events     → Chapter events listing
 * - /news       → External tech news aggregator
 * - /admin      → Admin dashboard (self-protected)
 * - /admin-login → Admin authentication page
 * 
 * @component
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forum from "./pages/Forum";
import Events from "./pages/Events";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import News from "./pages/News";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/events" element={<Events />} />
        <Route path="/news" element={<News />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
  );
};

export default App;
