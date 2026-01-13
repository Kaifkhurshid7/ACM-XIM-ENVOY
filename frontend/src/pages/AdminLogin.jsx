import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);

            // Verify admin role
            const { data } = await api.get('/auth/me');
            if (data.role !== 'admin') {
                alert("Access Denied: Administrative privileges required.");
                logout();
            } else {
                navigate('/admin');
            }
        } catch (err) {
            console.error(err);
            alert("Admin login failed. Please verify your credentials.");
        }
    };

    return (
        <div className="auth-wrapper">
            {/* Shared animated background */}
            <div className="auth-bg"></div>

            {/* Admin Card */}
            <div className="auth-card admin-auth">
                <header>
                    <h1>Admin Portal</h1>
                    <h3>ACM-XIM-ENVOY • ACM Student Chapter</h3>
                    <p>
                        This section is restricted to officially appointed ACM chapter
                        coordinators and core committee members. All access attempts
                        are authenticated and monitored.
                    </p>
                </header>

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Administrator Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Administrator Security Key"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />

                    <button type="submit">
                        Authenticate & Access Dashboard
                    </button>
                </form>

                <div className="auth-divider">
                    <span></span>
                </div>

                <div className="auth-footer">
                    <p style={{ fontSize: '0.8rem' }}>
                        ⚠ Unauthorized access is strictly prohibited.
                        If you believe you should have admin access, please contact
                        the ACM Student Chapter leadership.
                    </p>

                    <span
                        onClick={() => navigate('/login')}
                        style={{ marginTop: '0.6rem', display: 'inline-block' }}
                    >
                        ← Return to Student Login
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
