/**
 * Navbar Component
 * 
 * Responsive navigation bar with desktop and mobile layouts.
 * Displays user profile dropdown when authenticated, or
 * login/register links for guests.
 * 
 * Features:
 * - Responsive hamburger menu for mobile
 * - Active route highlighting
 * - User profile dropdown with role badge
 * - Admin dashboard link (visible to admins only)
 * - Click-outside detection to close dropdown
 * 
 * @component
 */
// Navbar with modern account panel dropdown
import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "./assets/Transparent-Logo-min.png";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Close panel on outside click or ESC
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setShowPanel(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const isActive = (path) => location.pathname === path;
  const initial = user?.name?.charAt(0).toUpperCase() || "?";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const handleAction = (path) => {
    setShowPanel(false);
    navigate(path);
  };

  return (
    <header className="news-navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img src={logo} alt="ACM XIM" className="navbar-logo" />
        </Link>

        <div className="nav-right-group">
          <nav className="desktop-nav">
            <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>
            <Link to="/news" className={isActive("/news") ? "active" : ""}>News</Link>
            <Link to="/events" className={isActive("/events") ? "active" : ""}>Events</Link>
            <Link to="/forum" className={isActive("/forum") ? "active" : ""}>Forum</Link>
            {user?.role === "admin" && (
              <Link to="/admin" className={`${isActive("/admin") ? "active" : ""} admin-link`}>Dashboard</Link>
            )}
          </nav>

          <div className="auth-interaction-zone">
            {user ? (
              <div className="profile-wrapper" ref={panelRef}>
                {/* Trigger pill */}
                <button
                  className="user-pill-div"
                  onClick={() => setShowPanel(!showPanel)}
                  aria-expanded={showPanel}
                  aria-haspopup="true"
                  aria-label="Account menu"
                >
                  <div className="avatar-circle">{initial}</div>
                  <span className="pill-name">{user.name?.split(" ")[0]}</span>
                  <svg className={`pill-chevron ${showPanel ? "open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {/* Account panel */}
                {showPanel && (
                  <div className="account-panel" role="menu" aria-label="Account panel">
                    {/* User header */}
                    <div className="ap-header">
                      <div className="ap-avatar">{initial}</div>
                      <div className="ap-identity">
                        <div className="ap-name-row">
                          <span className="ap-name">{user.name}</span>
                          <span className={`ap-role-badge ${user.role}`}>
                            {user.role === "admin" ? "Admin" : "Member"}
                          </span>
                        </div>
                        <span className="ap-email">{user.email}</span>
                        {memberSince && <span className="ap-joined">Joined {memberSince}</span>}
                      </div>
                    </div>

                    <div className="ap-divider" />

                    {/* Actions */}
                    <div className="ap-actions">
                      <button className="ap-action-item" onClick={() => handleAction("/profile")} role="menuitem">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>Manage Account</span>
                      </button>
                      {user.role === "admin" && (
                        <button className="ap-action-item" onClick={() => handleAction("/admin")} role="menuitem">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                    </div>

                    <div className="ap-divider" />

                    {/* Logout */}
                    <button
                      className="ap-logout"
                      onClick={() => { setShowPanel(false); logout(); }}
                      role="menuitem"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="guest-actions">
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/register" className="register-pill">Register</Link>
              </div>
            )}

            <button className={`hamburger-box ${open ? "open" : ""}`} onClick={() => setOpen(!open)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile overlay */}
        <div className={`mobile-overlay ${open ? "active" : ""}`}>
          <nav className="mobile-links">
            <Link to="/" onClick={() => setOpen(false)}>Home</Link>
            <Link to="/news" onClick={() => setOpen(false)}>News</Link>
            <Link to="/events" onClick={() => setOpen(false)}>Events</Link>
            <Link to="/forum" onClick={() => setOpen(false)}>Forum</Link>
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setOpen(false)} style={{ color: "var(--color-neon-lime)" }}>Dashboard</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
