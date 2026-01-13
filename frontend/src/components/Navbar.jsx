import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [open, setOpen] = useState(false);

    return (
        <header className="news-navbar">
            <div className="nav-container">
                {/* Brand */}
                <Link to="/" className="nav-brand">
                    <span className="brand-title">ACM-XIM-ENVOY</span>
                    <span className="brand-subtitle">

                    </span>
                </Link>

                {/* Hamburger */}
                <button
                    className="hamburger"
                    onClick={() => setOpen(true)}
                    aria-label="Open menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Full Screen Menu */}
                <nav className={`nav-menu ${open ? 'open' : ''}`}>
                    {/* CLOSE BUTTON (THIS WAS MISSING) */}
                    <button
                        className="menu-close"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>

                    <ul className="nav-links">
                        <li>
                            <Link to="/" onClick={() => setOpen(false)}>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/news" onClick={() => setOpen(false)}>
                                Global News
                            </Link>
                        </li>
                        <li>
                            <Link to="/events" onClick={() => setOpen(false)}>
                                Events
                            </Link>
                        </li>
                        <li>
                            <Link to="/forum" onClick={() => setOpen(false)}>
                                Forum
                            </Link>
                        </li>

                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <li>
                                        <Link
                                            to="/admin"
                                            className="admin-link"
                                            onClick={() => setOpen(false)}
                                        >
                                            Admin Desk
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setOpen(false);
                                        }}
                                        className="logout-btn"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link
                                        to="/login"
                                        onClick={() => setOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/register"
                                        className="register-link"
                                        onClick={() => setOpen(false)}
                                    >
                                        Register
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
