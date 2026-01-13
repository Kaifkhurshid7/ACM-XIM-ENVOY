import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            alert("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="auth-wrapper">
            {/* Shared animated tech background */}
            <div className="auth-bg"></div>

            <div className="auth-card">
                {/* Header */}
                <header>
                    <h1>Anti</h1>
                    <h3>ACM Student Chapter</h3>
                    <p>
                        Official media & engagement platform for ACM student members.
                        Sign in to access chapter updates, events, and discussions.
                    </p>
                </header>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Institute Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <button type="submit">Sign In</button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <span></span>
                </div>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Are you a chapter coordinator or core committee member?
                    </p>
                    <span onClick={() => navigate('/admin-login')}>
                        Restricted Admin Access →
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Login;
