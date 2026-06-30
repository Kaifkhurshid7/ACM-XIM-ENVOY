/**
 * Security & Settings Page
 * 
 * Features:
 * - Password management (change, strength meter)
 * - Session and device management
 * - Login history
 * - Security logs
 * - Two-factor authentication (future)
 * - Privacy controls
 * - Notification preferences
 * - Account deletion
 * 
 * @page
 */

import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { changePassword, getSessions, getLoginHistory, getSecurityLogs, logoutAllDevices, revokeSession } from "../api/authV2";
import { extractErrorMessage } from "../utils/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { LockIcon, LogOutIcon, TrashIcon, CheckCircleIcon } from "../components/ui/Icons";
import { validatePasswordStrength, calculatePasswordStrength } from "../utils/security";
import "../styles/securitySettings.css";

const SecuritySettings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ─── State ────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("password");
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    errors: [],
  });

  // Sessions and logs
  const [sessions, setSessions] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);

  // ─── Effects ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "sessions") {
      loadSessions();
    } else if (activeTab === "logs") {
      loadLogs();
    }
  }, [activeTab]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...passwordForm, [name]: value };
    setPasswordForm(updated);

    // Validate new password
    if (name === "newPassword") {
      const validation = validatePasswordStrength(value);
      setPasswordValidation(validation);
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setToast({ type: "error", message: "All fields required" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "Passwords do not match" });
      return;
    }

    if (!passwordValidation.isValid) {
      setToast({ type: "error", message: `Password too weak: ${passwordValidation.errors[0]}` });
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setToast({ type: "success", message: "Password changed successfully" });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, "Failed to change password") });
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    try {
      setSessionsLoading(true);
      const res = await getSessions();
      setSessions(res.data.data || []);

      const historyRes = await getLoginHistory();
      setLoginHistory(historyRes.data.data || []);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load sessions" });
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await getSecurityLogs();
      setSecurityLogs(res.data.data || []);
    } catch (err) {
      setToast({ type: "error", message: "Failed to load security logs" });
    } finally {
      setLogsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      setSessions(sessions.filter((s) => s.sessionId !== sessionId));
      setToast({ type: "success", message: "Session revoked" });
    } catch (err) {
      setToast({ type: "error", message: "Failed to revoke session" });
    }
  };

  const handleLogoutAllDevices = () => {
    setConfirm({
      title: "Logout from all devices?",
      message: "You will be signed out from all active sessions. This cannot be undone immediately.",
      onConfirm: async () => {
        try {
          await logoutAllDevices();
          setToast({ type: "success", message: "Signed out from all devices" });
          navigate("/login");
        } catch (err) {
          setToast({ type: "error", message: "Failed to logout all devices" });
        }
      },
      confirmText: "Sign Out All",
      isDanger: true,
    });
  };

  // ─── Render Helpers ──────────────────────────────────────────────────

  const passwordStrength = calculatePasswordStrength(passwordForm.newPassword);
  const getStrengthLabel = (score) => {
    if (score < 25) return "Very Weak";
    if (score < 50) return "Weak";
    if (score < 75) return "Good";
    return "Strong";
  };

  const getStrengthColor = (score) => {
    if (score < 25) return "#ef4444";
    if (score < 50) return "#f97316";
    if (score < 75) return "#f59e0b";
    return "#10b981";
  };

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="security-settings">
      <header className="security-header">
        <h1>
          <LockIcon size={24} /> Security & Settings
        </h1>
        <p>Manage your account security, sessions, and preferences.</p>
      </header>

      {/* Tabs */}
      <div className="security-tabs">
        <button className={`tab ${activeTab === "password" ? "active" : ""}`} onClick={() => setActiveTab("password")}>
          Password
        </button>
        <button className={`tab ${activeTab === "sessions" ? "active" : ""}`} onClick={() => setActiveTab("sessions")}>
          Sessions & Devices
        </button>
        <button className={`tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
          Security Logs
        </button>
      </div>

      {/* Content */}
      <div className="security-content">
        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="tab-pane">
            <div className="security-section">
              <h2>Change Password</h2>
              <p>Update your password to keep your account secure. Use a strong password with mixed case, numbers, and symbols.</p>

              <div className="password-form">
                <div className="form-group">
                  <label htmlFor="current-password">Current Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="current-password"
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      aria-label="Toggle password visibility"
                    >
                      {showPasswords.current ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="new-password"
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      aria-label="Toggle password visibility"
                    >
                      {showPasswords.new ? "Hide" : "Show"}
                    </button>
                  </div>

                  {passwordForm.newPassword && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${passwordStrength}%`,
                            backgroundColor: getStrengthColor(passwordStrength),
                          }}
                        />
                      </div>
                      <span className="strength-label" style={{ color: getStrengthColor(passwordStrength) }}>
                        {getStrengthLabel(passwordStrength)}
                      </span>
                    </div>
                  )}

                  {passwordValidation.errors.length > 0 && (
                    <div className="validation-errors">
                      {passwordValidation.errors.map((error) => (
                        <div key={error} className="error-item">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="confirm-password"
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      aria-label="Toggle password visibility"
                    >
                      {showPasswords.confirm ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button className="btn-primary" onClick={handleChangePassword} disabled={loading || !passwordValidation.isValid}>
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>

              <div className="security-tips">
                <h3>Password Tips</h3>
                <ul>
                  <li>Use at least 8 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Add numbers and special characters</li>
                  <li>Avoid using personal information</li>
                  <li>Use a unique password not used elsewhere</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="tab-pane">
            <div className="security-section">
              <h2>Active Sessions & Devices</h2>
              <p>Manage your active sessions across different devices and browsers.</p>

              {sessionsLoading ? (
                <p className="loading-text">Loading sessions...</p>
              ) : (
                <>
                  {sessions.length > 0 ? (
                    <div className="sessions-list">
                      {sessions.map((session) => (
                        <div key={session.sessionId} className="session-card">
                          <div className="session-info">
                            <h4>{session.browser} on {session.os}</h4>
                            <p className="session-ip">{session.ipAddress}</p>
                            <p className="session-date">
                              Active since {new Date(session.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <button
                            className="btn-revoke"
                            onClick={() => handleRevokeSession(session.sessionId)}
                            aria-label="Revoke session"
                          >
                            <LogOutIcon size={14} /> Revoke
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="placeholder-text">No active sessions</p>
                  )}

                  <button className="btn-logout-all" onClick={handleLogoutAllDevices}>
                    <LogOutIcon size={14} /> Sign Out All Devices
                  </button>

                  {loginHistory.length > 0 && (
                    <>
                      <h3 style={{ marginTop: "32px" }}>Recent Logins</h3>
                      <div className="login-history">
                        {loginHistory.slice(0, 5).map((login, idx) => (
                          <div key={idx} className="login-item">
                            <div className="login-info">
                              <p className="login-device">{login.browser} on {login.os}</p>
                              <p className="login-ip">{login.ipAddress}</p>
                            </div>
                            <p className="login-time">{new Date(login.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === "logs" && (
          <div className="tab-pane">
            <div className="security-section">
              <h2>Security Logs</h2>
              <p>A record of security-related activities on your account.</p>

              {logsLoading ? (
                <p className="loading-text">Loading security logs...</p>
              ) : (
                <>
                  {securityLogs.length > 0 ? (
                    <div className="security-logs">
                      {securityLogs.map((log, idx) => (
                        <div key={idx} className="log-entry">
                          <div className="log-icon">
                            {log.status === "SUCCESS" ? (
                              <CheckCircleIcon size={16} />
                            ) : (
                              <span className="log-fail">✕</span>
                            )}
                          </div>
                          <div className="log-details">
                            <h4>{log.action}</h4>
                            <p>{log.ipAddress}</p>
                            <p className="log-time">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <span className={`log-status ${log.status.toLowerCase()}`}>{log.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="placeholder-text">No security logs available</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default SecuritySettings;
