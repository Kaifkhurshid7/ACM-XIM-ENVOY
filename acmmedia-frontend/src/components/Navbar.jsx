import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import logo from './assets/Transparent-Logo-min.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <header className="news-navbar">
            <div className="nav-container">
                {/* BRAND */}
                <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
                    <img src={logo} alt="ACM XIM Logo" className="navbar-logo" />
                </Link>

                <div className="nav-right-group">
                    {/* Desktop Links */}
                    <nav className="desktop-nav">
                        <Link to="/" className={isActive('/') ? 'active' : ''}>HOME</Link>
                        <Link to="/news" className={isActive('/news') ? 'active' : ''}>NEWS</Link>
                        <Link to="/events" className={isActive('/events') ? 'active' : ''}>EVENTS</Link>
                        <Link to="/forum" className={isActive('/forum') ? 'active' : ''}>FORUM</Link>

                        {/* FIXED: Show Admin Dashboard link if user is admin */}
                        {user && user.role === 'admin' && (
                            <Link
                                to="/admin"
                                className={isActive('/admin') ? 'active admin-link' : 'admin-link'}
                                style={{ color: '#ffd700' }}
                            >
                                DASHBOARD
                            </Link>
                        )}
                    </nav>

                    <div className="auth-interaction-zone">
                        {user ? (
                            <div className="profile-wrapper" ref={dropdownRef}>
                                <div className="user-pill-div" onClick={() => setShowProfile(!showProfile)}>
                                    <div className="avatar-circle">{user.name?.charAt(0).toUpperCase()}</div>
                                    <span className="pill-name">{user.name.split(' ')[0]}</span>
                                    <span className={`pill-arrow ${showProfile ? 'up' : ''}`}>▼</span>
                                </div>

                                {showProfile && (
                                    <div className="editorial-dropdown">
                                        <div className="info-rect-box">
                                            <div className="rect-row">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                <div className="rect-text">
                                                    <label>NAME</label>
                                                    <p>{user.name}</p>
                                                </div>
                                            </div>
                                            <div className="rect-divider"></div>
                                            <div className="rect-row">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                                <div className="rect-text">
                                                    <label>EMAIL</label>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="drop-status-section">
                                            <label className="drop-label">MEMBERSHIP ROLE</label>
                                            <div className={`status-badge-pill ${user.role}`}>
                                                {user.role === 'admin' ? (
                                                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg><span>Administrator</span></>
                                                ) : (
                                                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg><span>Chapter Member</span></>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={logout} className="logout-red-btn">SECURE LOGOUT</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="guest-actions">
                                <Link to="/login" className="login-link">Login</Link>
                                <Link to="/register" className="register-pill">Register</Link>
                            </div>
                        )}

                        <button className={`hamburger-box ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
                            <span></span><span></span><span></span>
                        </button>
                    </div>
                </div>

                {/* MOBILE OVERLAY */}
                <div className={`mobile-overlay ${open ? 'active' : ''}`}>
                    <nav className="mobile-links">
                        <Link to="/" onClick={() => setOpen(false)}>HOME</Link>
                        <Link to="/news" onClick={() => setOpen(false)}>NEWS</Link>
                        <Link to="/events" onClick={() => setOpen(false)}>EVENTS</Link>
                        <Link to="/forum" onClick={() => setOpen(false)}>FORUM</Link>

                        {/* MOBILE ADMIN LINK */}
                        {user && user.role === 'admin' && (
                            <Link to="/admin" onClick={() => setOpen(false)} style={{ color: '#ffd700' }}>DASHBOARD</Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Navbar;