import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'member',
        isAcmMember: 'no',
        acmId: '',
        adminSecret: ''
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert("Registration successful! Please login to continue.");
            navigate(formData.role === 'admin' ? '/admin-login' : '/login');
        } catch (err) {
            const message = err?.response?.data?.msg || 'Registration failed.';
            alert(message);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card register-card">
                <header className="auth-header">
                    <h1>ACM-XIM-ENVOY</h1>
                    <h3>ACM Student Chapter Registration</h3>
                    <p>
                        Official news and engagement platform for ACM
                        student members.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-section">
                        <h4>Personal Information</h4>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                        />
                        <input
                            type="email"
                            placeholder="Institute Email Address"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                        />
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            required
                        />
                    </div>

                    <div className="form-section">
                        <h4>ACM Membership</h4>
                        <label>Are you an ACM Member?</label>
                        <select
                            value={formData.isAcmMember}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    isAcmMember: e.target.value
                                })
                            }
                        >
                            <option value="no">No, not yet</option>
                            <option value="yes">Yes, I am an ACM Member</option>
                        </select>

                        {formData.isAcmMember === 'yes' && (
                            <input
                                type="text"
                                placeholder="ACM Membership ID"
                                value={formData.acmId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        acmId: e.target.value
                                    })
                                }
                                required
                            />
                        )}

                        <p className="form-hint">
                            ACM membership helps us identify official
                            chapter members.
                        </p>
                    </div>

                    <div className="form-section">
                        <h4>Platform Role</h4>
                        <select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value
                                })
                            }
                        >
                            <option value="member">Student / Chapter Member</option>
                            <option value="admin">Chapter Admin / Core Team</option>
                        </select>

                        {formData.role === 'admin' && (
                            <>
                                <input
                                    type="password"
                                    placeholder="Admin Secret Key"
                                    value={formData.adminSecret}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            adminSecret: e.target.value
                                        })
                                    }
                                    required
                                />
                                <p className="form-warning">
                                    Admin access is restricted to official
                                    ACM coordinators.
                                </p>
                            </>
                        )}
                    </div>

                    <button type="submit" className="primary-btn">
                        Register
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already registered?{' '}
                        <span onClick={() => navigate('/login')}>
                            Login here
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
