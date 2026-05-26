/**
 * Profile Page
 * 
 * User profile management page with three sections:
 * 1. Avatar upload/change
 * 2. Profile information editing (name, bio, department, links)
 * 3. Password change form
 * 
 * Access: Authenticated users only (redirects to login if not logged in)
 * 
 * @page
 */

import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, uploadAvatar, removeAvatar, changePassword } from "../api/profile";
import { extractErrorMessage } from "../utils/api";
import "../styles/profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    department: "",
    year: "",
    github: "",
    linkedin: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfile(data);
        setFormData({
          name: data.name || "",
          bio: data.bio || "",
          department: data.department || "",
          year: data.year || "",
          github: data.github || "",
          linkedin: data.linkedin || "",
        });
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadProfile();
  }, [user]);

  // ─── Profile Update Handler ──────────────────────────────────────────────────

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await updateProfile(formData);
      setProfile(data.user);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to update profile."));
    } finally {
      setSaving(false);
    }
  };

  // ─── Avatar Handlers ─────────────────────────────────────────────────────────

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB.");
      return;
    }

    try {
      setAvatarUploading(true);
      const { data } = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar: data.avatar }));
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to upload avatar."));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm("Remove your profile picture?")) return;
    try {
      await removeAvatar();
      setProfile((prev) => ({ ...prev, avatar: null }));
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to remove avatar."));
    }
  };

  // ─── Password Change Handler ─────────────────────────────────────────────────

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert("New password must be at least 6 characters.");
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData);
      alert("Password changed successfully! Please login again.");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      logout();
      navigate("/login");
    } catch (err) {
      alert(extractErrorMessage(err, "Failed to change password."));
    } finally {
      setChangingPassword(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="profile-page">
        <p style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>Loading profile...</p>
      </div>
    );
  }

  const avatarSrc = profile?.avatar
    ? `${import.meta.env.VITE_API_BASE_URL?.replace("/api/v1", "") || (import.meta.env.DEV ? "" : "https://acmmedia-backend.onrender.com")}${profile.avatar}`
    : null;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information, avatar, and security settings.</p>
      </header>

      <div className="profile-content">
        {/* ─── Avatar Section ─────────────────────────────────────────────── */}
        <section className="profile-section avatar-section">
          <h2>Profile Picture</h2>
          <div className="avatar-container">
            <div className="avatar-preview" onClick={handleAvatarClick}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="avatar-overlay">
                {avatarUploading ? "Uploading..." : "Change"}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
            <div className="avatar-actions">
              <button onClick={handleAvatarClick} className="btn-secondary" disabled={avatarUploading}>
                {avatarUploading ? "Uploading..." : "Upload New Photo"}
              </button>
              {profile?.avatar && (
                <button onClick={handleRemoveAvatar} className="btn-danger-outline">
                  Remove
                </button>
              )}
            </div>
            <p className="avatar-hint">JPEG, PNG, GIF, or WebP. Max 2MB.</p>
          </div>
        </section>

        {/* ─── Profile Info Section ───────────────────────────────────────── */}
        <section className="profile-section">
          <h2>Personal Information</h2>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={profile?.email || ""} disabled className="input-disabled" />
              <span className="form-hint">Email cannot be changed.</span>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself (max 300 characters)"
                maxLength={300}
                rows={3}
              />
              <span className="form-hint">{formData.bio.length}/300</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="form-group">
                <label>Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g. 3rd Year"
                />
              </div>
            </div>

            <div className="form-group">
              <label>GitHub Profile</label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn Profile</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* ─── Password Section ───────────────────────────────────────────── */}
        <section className="profile-section">
          <h2>Change Password</h2>
          <p className="section-desc">
            For security, you must enter your current password to set a new one.
            After changing, you will be logged out.
          </p>
          <form onSubmit={handlePasswordSubmit} className="profile-form">
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Enter new password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button type="submit" className="btn-warning" disabled={changingPassword}>
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </section>

        {/* ─── Account Info ───────────────────────────────────────────────── */}
        <section className="profile-section account-info">
          <h2>Account Details</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Role</span>
              <span className={`info-value role-badge ${profile?.role}`}>
                {profile?.role === "admin" ? "Administrator" : "Chapter Member"}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">ACM Member</span>
              <span className="info-value">{profile?.isAcmMember ? "Yes" : "No"}</span>
            </div>
            {profile?.acmId && (
              <div className="info-item">
                <span className="info-label">ACM ID</span>
                <span className="info-value">{profile.acmId}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
