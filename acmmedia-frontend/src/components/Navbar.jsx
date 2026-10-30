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
import AnnouncementBar from "./AnnouncementBar";
import { SOCIALS } from "./ui/SocialIcons";

const Chevron = () => (
  <svg className="nav-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.9 5.6L19.5 9l-5.6 1.9L12 16.5l-1.9-5.6L4.5 9l5.6-1.4L12 2zm6 12l.9 2.6 2.6.9-2.6.9L18 21l-.9-2.6-2.6-.9 2.6-.9L18 14z" />
  </svg>
);

const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const mIcon = (children) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const MOBILE_ICONS = {
  "/": mIcon(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>),
  "/news": mIcon(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="9" x2="17" y2="9" /><line x1="7" y1="13" x2="17" y2="13" /><line x1="7" y1="17" x2="12" y2="17" /></>),
  "/events": mIcon(<><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>),
  "/forum": mIcon(<path d="M4 5h16v11H9l-5 4z" />),
  connect: mIcon(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  resources: mIcon(<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /><line x1="9" y1="8" x2="15" y2="8" /></>),
  admin: mIcon(<><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></>),
};

const ChevronRight = ({ open }) => (
  <svg className={`m-chevron ${open ? "open" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
);

/*
 * Dropdown menus (Home and the admin Dashboard stay plain links).
 * An item has either `path` (in-app route) or `href` (external link).
 * `show` filters an item by auth state; `footer` adds a call-to-action row.
 */
const MENUS = [
  {
    id: "explore",
    label: "Explore",
    icon: "/news",
    items: [
      { label: "News", desc: "Chapter updates and tech headlines", path: "/news" },
      { label: "Events", desc: "Workshops, hackathons and seminars", path: "/events" },
      { label: "Forum", desc: "Ask questions, share ideas, get answers", path: "/forum", badge: "Live" },
    ],
    footer: { label: "See upcoming events", path: "/events" },
  },
  {
    id: "community",
    label: "Community",
    icon: "/forum",
    items: [
      { label: "Join the chapter", desc: "Create your free member account", path: "/register", show: (u) => !u },
      { label: "Sign in", desc: "Pick up where you left off", path: "/login", show: (u) => !u },
      { label: "My profile", desc: "Your details, bookmarks and privacy", path: "/profile", show: (u) => !!u },
      { label: "Security settings", desc: "Password, sessions and login history", path: "/security", show: (u) => !!u },
      { label: "Admin portal", desc: "For chapter administrators", path: "/admin-login", show: (u) => u?.role !== "admin" },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    icon: "resources",
    items: [
      { label: "Chapter website", desc: "Everything about ACM XIM", href: "https://www.acmxim.space/" },
      { label: "GitHub", desc: "Open-source projects from the chapter", href: "https://github.com/ACM-XIM" },
      { label: "API docs", desc: "Explore the platform API in Swagger", href: "https://acmmedia-backend.onrender.com/api-docs" },
      { label: "ACM Digital Library", desc: "Papers, journals and proceedings", href: "https://dl.acm.org/" },
    ],
  },
  {
    id: "connect",
    label: "Connect",
    icon: "connect",
    items: [
      { label: "Instagram", href: "https://www.instagram.com/xim_acm/" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/xim-acm/" },
      { label: "GitHub", href: "https://github.com/ACM-XIM" },
      { label: "Chapter website", href: "https://www.acmxim.space/" },
    ],
  },
];

const visibleItems = (menu, user) => menu.items.filter((i) => !i.show || i.show(user));

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileSection, setMobileSection] = useState(null);
  const panelRef = useRef(null);
  const menusRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false);
      if (menusRef.current && !menusRef.current.contains(e.target)) setOpenMenu(null);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") { setShowPanel(false); setMobileOpen(false); setOpenMenu(null); }
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
    // Start the open menu from the top so it lines up under the header
    if (mobileOpen) window.scrollTo(0, 0);
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path;
  const initial = user?.name?.charAt(0).toUpperCase() || "?";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const handleNav = (path) => { setMobileOpen(false); setShowPanel(false); navigate(path); };

  // Close any open dropdown after navigating
  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  return (
    <>
      <AnnouncementBar />
      <header className="site-navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            {/* Logo */}
            <Link to="/" className="navbar-brand">
              <img src={logo} alt="ACM XIM" className="navbar-logo" />
            </Link>

            {/* Desktop nav links */}
            <nav className="navbar-links" ref={menusRef} aria-label="Primary">
              <Link to="/" className={isActive("/") ? "active" : ""}>Home</Link>

              {MENUS.map((menu) => {
                const open = openMenu === menu.id;
                const items = visibleItems(menu, user);
                const childActive = items.some((i) => i.path && isActive(i.path));
                const compact = items.every((i) => !i.desc);
                return (
                  <div
                    key={menu.id}
                    className={`nav-dropdown ${open ? "open" : ""}`}
                    onMouseEnter={() => setOpenMenu(menu.id)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <button
                      type="button"
                      className={`nav-dropdown-trigger ${childActive ? "active" : ""}`}
                      aria-haspopup="true"
                      aria-expanded={open}
                      onClick={() => setOpenMenu(open ? null : menu.id)}
                    >
                      {menu.label}
                      <Chevron />
                    </button>
                    {open && (
                      <div className={`nav-dropdown-panel ${compact ? "nav-dropdown-panel--compact" : ""}`} role="menu">
                        {items.map((item) => {
                          const body = (
                            <>
                              <span className="nav-dropdown-head">
                                <span className="nav-dropdown-title">{item.label}</span>
                                {item.badge && <span className="nav-dropdown-badge">{item.badge}</span>}
                                {item.href && <ExternalIcon />}
                              </span>
                              {item.desc && <span className="nav-dropdown-desc">{item.desc}</span>}
                            </>
                          );
                          return item.href ? (
                            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" role="menuitem" className="nav-dropdown-item">
                              {body}
                            </a>
                          ) : (
                            <Link key={item.label} to={item.path} role="menuitem" className={`nav-dropdown-item ${isActive(item.path) ? "active" : ""}`}>
                              {body}
                            </Link>
                          );
                        })}
                        {menu.footer && (
                          <Link to={menu.footer.path} role="menuitem" className="nav-dropdown-footer">
                            {menu.footer.label} <span aria-hidden="true">→</span>
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {user?.role === "admin" && (
                <Link to="/admin" className={`${isActive("/admin") ? "active" : ""} nav-admin`}>Dashboard</Link>
              )}
            </nav>
          </div>

          {/* Right section */}
          <div className="navbar-right">
            {user ? (
              <div className="profile-wrapper" ref={panelRef}>
                <button className="nav-user-btn" onClick={() => setShowPanel(!showPanel)} aria-label="Account">
                  <span className="nav-avatar">{initial}</span>
                </button>

                {showPanel && (
                  <div className="account-panel" role="menu">
                    {/* Mini membership card */}
                    <div className="ap-card">
                      <div className="ap-card-sheen" aria-hidden="true" />
                      <div className="ap-card-top">
                        <span className="ap-card-brand">ACM · XIM</span>
                        <span className={`ap-badge ${user.role}`}>{user.role === "admin" ? "Admin" : "Member"}</span>
                      </div>
                      <div className="ap-card-id">
                        <div className="ap-avatar">{initial}</div>
                        <div className="ap-identity">
                          <span className="ap-name">{user.name}</span>
                          <span className="ap-email" title={user.email}>{user.email}</span>
                        </div>
                      </div>
                      {memberSince && <span className="ap-meta">Member since {memberSince}</span>}
                    </div>

                    <div className="ap-list">
                      {[
                        { label: "Manage account", sub: "Profile & bookmarks", path: "/profile", d: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></> },
                        { label: "Security", sub: "Password & sessions", path: "/security", d: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
                        { label: "Community forum", sub: "Join the discussion", path: "/forum", d: <path d="M4 5h16v11H9l-5 4z" /> },
                        ...(user.role === "admin"
                          ? [{ label: "Admin dashboard", sub: "Manage the chapter", path: "/admin", d: <><rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="5" rx="1" /><rect x="13" y="10" width="8" height="11" rx="1" /><rect x="3" y="13" width="8" height="8" rx="1" /></> }]
                          : []),
                      ].map((it) => (
                        <button key={it.path} className="ap-item" onClick={() => handleNav(it.path)} role="menuitem">
                          <span className="ap-item-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{it.d}</svg>
                          </span>
                          <span className="ap-item-text">
                            <strong>{it.label}</strong>
                            <span>{it.sub}</span>
                          </span>
                          <span className="ap-arrow">→</span>
                        </button>
                      ))}
                    </div>

                    <button className="ap-signout" onClick={() => { setShowPanel(false); logout(); }} role="menuitem">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/register" className="nav-cta">
                  <span className="nav-cta-inner"><SparkIcon />Join Chapter</span>
                </Link>
                <Link to="/login" className="nav-signin" aria-label="Sign in">
                  <UserIcon />
                </Link>
              </>
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
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} aria-hidden={!mobileOpen}>
        <div className="mobile-menu-content">
          <nav className="mobile-nav-links" aria-label="Mobile">
            <button className="mobile-nav-item" onClick={() => handleNav("/")}>
              <span className="m-index" aria-hidden="true">01</span>
              <span className="m-label">Home</span>
            </button>

            {MENUS.filter((m) => m.id !== "connect").map((menu, i) => {
              const open = mobileSection === menu.id;
              return (
                <React.Fragment key={menu.id}>
                  <button
                    className={`mobile-nav-item ${open ? "is-open" : ""}`}
                    aria-expanded={open}
                    onClick={() => setMobileSection(open ? null : menu.id)}
                  >
                    <span className="m-index" aria-hidden="true">{String(i + 2).padStart(2, "0")}</span>
                    <span className="m-label">{menu.label}</span>
                    <ChevronRight open={open} />
                  </button>
                  {open && (
                    <div className="mobile-subnav">
                      {visibleItems(menu, user).map((item) =>
                        item.href ? (
                          <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="mobile-social-item">
                            <span>{item.label}</span><ExternalIcon />
                          </a>
                        ) : (
                          <button key={item.label} className="mobile-social-item mobile-sub-btn" onClick={() => handleNav(item.path)}>
                            <span>{item.label}{item.badge && <span className="nav-dropdown-badge">{item.badge}</span>}</span>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {user?.role === "admin" && (
              <button className="mobile-nav-item" onClick={() => handleNav("/admin")}>
                <span className="m-index" aria-hidden="true">AD</span>
                <span className="m-label m-label--accent">Dashboard</span>
                <ChevronRight />
              </button>
            )}
          </nav>

          {/* Socials + oversized wordmark, echoing the footer */}
          <div className="mobile-connect">
            <p>Find us online</p>
            <ul className="mobile-social-icons">
              {SOCIALS.map((so) => (
                <li key={so.name}>
                  <a href={so.href} target="_blank" rel="noopener noreferrer" aria-label={so.name}>{so.svg}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mobile-more">
            <p>More</p>
            <ul>
              <li><button type="button" onClick={() => handleNav("/privacy")}>Privacy Policy</button></li>
              <li><button type="button" onClick={() => handleNav("/terms")}>Terms &amp; Conditions</button></li>
              <li><button type="button" onClick={() => handleNav("/conduct")}>Code of Conduct</button></li>
              <li><a href="https://dl.acm.org/" target="_blank" rel="noopener noreferrer">ACM Digital Library</a></li>
              <li><a href="https://acmmedia-backend.onrender.com/api-docs" target="_blank" rel="noopener noreferrer">API docs</a></li>
              <li><a href="https://github.com/ACM-XIM" target="_blank" rel="noopener noreferrer">Source code</a></li>
            </ul>
          </div>
          <div className="mobile-wordmark" aria-hidden="true">ACM XIM</div>
        </div>

        {/* Pinned bottom bar */}
        <div className="mobile-bottom-bar">
          {user ? (
            <button className="mobile-bottom-link mobile-logout" onClick={() => { setMobileOpen(false); logout(); }}>
              Sign out
            </button>
          ) : (
            <button className="mobile-join" onClick={() => handleNav("/register")}>
              <SparkIcon />Join Chapter
            </button>
          )}
          <button className="mobile-bottom-link" onClick={() => handleNav(user ? "/profile" : "/login")}>
            <UserIcon />{user ? "My account" : "Sign in"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
