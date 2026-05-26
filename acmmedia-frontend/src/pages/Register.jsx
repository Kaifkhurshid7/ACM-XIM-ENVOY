import React, { useState } from 'react';
import { signup } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { extractErrorMessage } from '../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        isAcmMember: 'no',
        acmId: ''
    });
    const navigate = useNavigate();

    const buildSignupPayload = () => ({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // --- UPDATED DOMAIN RESTRICTION ---
        const emailLower = formData.email.toLowerCase();
        const isValidDomain = emailLower.endsWith("@stu.xim.edu.in") || emailLower.endsWith("@xim.edu.in");

        if (!isValidDomain) {
            alert("Restricted Access: Please use your official university email (@stu.xim.edu.in or @xim.edu.in).");
            return;
        }

        try {
            await signup(buildSignupPayload());
            alert("Registration successful! Please login to continue.");
            navigate('/login');
        } catch (err) {
            console.error(err);
            alert(extractErrorMessage(err, 'Registration failed.'));
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
                    <p className="form-hint" style={{ marginTop: '0.75rem' }}>
                        Admin accounts are handled separately through the ACM core team.
                        If you already have admin access, use the admin login page.
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
                            placeholder="Institute Email Address (@xim.edu.in)"
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
                    <p>
                        ACM core team or coordinator?{' '}
                        <span onClick={() => navigate('/admin-login')}>
                            Admin login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
