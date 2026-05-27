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

// Chapter social links
const SOCIALS = [
  { name: "Instagram", url: "https://www.instagram.com/xim_acm/" },
  { name: "LinkedIn", url: "https://www.linkedin.com/company/xim-acm/" },
  { name: "GitHub", url: "https://github.com/ACM-XIM" },
  { name: "Chapter Website", url: "https://www.acmxim.space/" },
];

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") { setShowPanel(false); setMobileOpen(false); }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path;
  const initial = user?.name?.charAt(0).toUpperCase() || "?";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const handleNav = (path) => { setMobileOpen(false); setShowPanel(false); navigate(path); };

  const NAV_LINKS = [
    { label: "Home", path: "/" },
    { label: "News", path: "/news" },
    { label: "Events", path: "/events" },
    { label: "Forum", path: "/forum" },
  ];

  return (
    <>
      <header className="site-navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img src={logo} alt="ACM XIM" className="navbar-logo" />
          </Link>

          {/* Desktop nav links */}
          <nav className="navbar-links">
            {NAV_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={isActive(link.path) ? "active" : ""}>
                {link.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link to="/admin" className={`${isActive("/admin") ? "active" : ""} nav-admin`}>Dashboard</Link>
            )}
          </nav>

          {/* Right section */}
          <div className="navbar-right">
            {user ? (
              <div className="profile-wrapper" ref={panelRef}>
                <button className="nav-user-btn" onClick={() => setShowPanel(!showPanel)} aria-label="Account">
                  <span className="nav-avatar">{initial}</span>
                </button>

                {showPanel && (
                  <div className="account-panel" role="menu">
                    <div className="ap-header">
                      <div className="ap-avatar">{initial}</div>
                      <div className="ap-identity">
                        <div className="ap-name-row">
                          <span className="ap-name">{user.name}</span>
                          <span className={`ap-badge ${user.role}`}>{user.role === "admin" ? "Admin" : "Member"}</span>
                        </div>
                        <span className="ap-email">{user.email}</span>
                        {memberSince && <span className="ap-meta">Joined {memberSince}</span>}
                      </div>
                    </div>
                    <div className="ap-divider" />
                    <button className="ap-item" onClick={() => handleNav("/profile")} role="menuitem">
                      Manage Account
                      <span className="ap-arrow">→</span>
                    </button>
                    {user.role === "admin" && (
                      <button className="ap-item" onClick={() => handleNav("/admin")} role="menuitem">
                        Admin Dashboard
                        <span className="ap-arrow">→</span>
                      </button>
                    )}
                    <div className="ap-divider" />
                    <button className="ap-item ap-logout" onClick={() => { setShowPanel(false); logout(); }} role="menuitem">
                      Sign Out
                      <span className="ap-arrow">→</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/register" className="nav-cta">Join Chapter</Link>
            )}

            {/* Hamburger */}
            <button className={`nav-hamburger ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-menu-content">
          {/* Nav links */}
          <nav className="mobile-nav-links">
            {NAV_LINKS.map((link) => (
              <button key={link.path} className="mobile-nav-item" onClick={() => handleNav(link.path)}>
                <span>{link.label}</span>
                <span className="mobile-arrow">→</span>
              </button>
            ))}
            {user?.role === "admin" && (
              <button className="mobile-nav-item" onClick={() => handleNav("/admin")}>
                <span style={{ color: "var(--color-neon-lime)" }}>Dashboard</span>
                <span className="mobile-arrow">→</span>
              </button>
            )}
          </nav>

          {/* Auth actions */}
          <div className="mobile-auth">
            {user ? (
              <>
                <button className="mobile-nav-item" onClick={() => handleNav("/profile")}>
                  <span>My Account</span><span className="mobile-arrow">→</span>
                </button>
                <button className="mobile-nav-item mobile-logout" onClick={() => { setMobileOpen(false); logout(); }}>
                  <span>Sign Out</span><span className="mobile-arrow">→</span>
                </button>
              </>
            ) : (
              <>
                <button className="mobile-nav-item" onClick={() => handleNav("/login")}>
                  <span>Sign In</span><span className="mobile-arrow">→</span>
                </button>
                <button className="mobile-nav-item" onClick={() => handleNav("/register")}>
                  <span style={{ color: "var(--color-neon-lime)" }}>Join Chapter</span><span className="mobile-arrow">→</span>
                </button>
              </>
            )}
          </div>

          {/* Social links */}
          <div className="mobile-socials">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="mobile-social-item">
                <span>{s.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
