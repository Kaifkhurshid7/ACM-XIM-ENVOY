/**
 * Profile Page
 * 
 * User profile management page with four sections:
 * 1. Avatar upload/change
 * 2. Profile information editing (name, bio, department, links)
 * 3. Password change form
 * 4. Account details
 * 
 * Access: Authenticated users only
 * 
 * @page
 */

import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, uploadAvatar, removeAvatar, changePassword } from "../api/profile";
import { extractErrorMessage } from "../utils/api";
import { PROFILE, CONFIRMATIONS } from "../constants/copy";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { UploadIcon, TrashIcon, LockIcon } from "../components/ui/Icons";
import "../styles/profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: "", bio: "", department: "", year: "", github: "", linkedin: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

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

  // Profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await updateProfile(formData);
      setProfile(data.user);
      setToast({ type: "success", message: PROFILE.SAVED });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, "Couldn't update profile. Please try again.") });
    } finally {
      setSaving(false);
    }
  };

  // Avatar handlers
  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setToast({ type: "error", message: PROFILE.AVATAR_ERROR_SIZE });
      return;
    }

    try {
      setAvatarUploading(true);
      const { data } = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar: data.avatar }));
      setToast({ type: "success", message: PROFILE.AVATAR_UPLOADED });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, PROFILE.AVATAR_ERROR_GENERIC) });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setConfirm({
      ...CONFIRMATIONS.REMOVE_AVATAR,
      onConfirm: async () => {
        try {
          await removeAvatar();
          setProfile((prev) => ({ ...prev, avatar: null }));
          setToast({ type: "success", message: PROFILE.AVATAR_REMOVED });
        } catch (err) {
          setToast({ type: "error", message: extractErrorMessage(err, "Couldn't remove avatar.") });
        }
      },
    });
  };

  // Password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ type: "error", message: PROFILE.ERROR_MISMATCH });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setToast({ type: "error", message: PROFILE.ERROR_SHORT });
      return;
    }

    try {
      setChangingPassword(true);
      await changePassword(passwordData);
      setToast({ type: "success", message: PROFILE.SUCCESS });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => { logout(); navigate("/login"); }, 1500);
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, PROFILE.ERROR_GENERIC) });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }} role="status" aria-live="polite">{PROFILE.LOADING}</p>
      </div>
    );
  }

  const backendBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "")
    : import.meta.env.DEV ? "http://localhost:5000" : "https://acmmedia-backend.onrender.com";

  const avatarSrc = profile?.avatar ? `${backendBase}${profile.avatar}` : null;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <h1>{PROFILE.HEADING}</h1>
        <p>{PROFILE.SUBHEADING}</p>
      </header>

      <div className="profile-content">
        {/* Avatar Section */}
        <section className="profile-section avatar-section" aria-label="Profile picture">
          <h2>{PROFILE.AVATAR_HEADING}</h2>
          <div className="avatar-container">
            <div
              className="avatar-preview"
              onClick={handleAvatarClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleAvatarClick()}
              aria-label="Change profile picture"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={`${profile?.name}'s profile picture`} className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {profile?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="avatar-overlay">
                {avatarUploading ? PROFILE.AVATAR_UPLOADING : PROFILE.AVATAR_OVERLAY}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
              aria-label="Upload profile picture"
            />
            <div className="avatar-actions">
              <button onClick={handleAvatarClick} className="btn-secondary" disabled={avatarUploading} aria-label="Upload new photo">
                <UploadIcon size={14} /> {avatarUploading ? PROFILE.AVATAR_UPLOADING : PROFILE.AVATAR_BUTTON_UPLOAD}
              </button>
              {profile?.avatar && (
                <button onClick={handleRemoveAvatar} className="btn-danger-outline" aria-label="Remove profile picture">
                  <TrashIcon size={14} /> {PROFILE.AVATAR_BUTTON_REMOVE}
                </button>
              )}
            </div>
            <p className="avatar-hint">{PROFILE.AVATAR_HINT}</p>
          </div>
        </section>

        {/* Personal Information Section */}
        <section className="profile-section" aria-label="Personal information">
          <h2>{PROFILE.INFO_HEADING}</h2>
          <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
            <div className="form-group">
              <label htmlFor="profile-name">{PROFILE.LABEL_NAME}</label>
              <input
                id="profile-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your full name"
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">{PROFILE.LABEL_EMAIL}</label>
              <input id="profile-email" type="email" value={profile?.email || ""} disabled className="input-disabled" aria-describedby="email-readonly-hint" />
              <span className="form-hint" id="email-readonly-hint">{PROFILE.LABEL_EMAIL_HINT}</span>
            </div>

            <div className="form-group">
              <label htmlFor="profile-bio">{PROFILE.LABEL_BIO}</label>
              <textarea
                id="profile-bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={PROFILE.LABEL_BIO_PLACEHOLDER}
                maxLength={300}
                rows={3}
                aria-describedby="bio-hint bio-count"
              />
              <span className="form-hint" id="bio-hint">{PROFILE.LABEL_BIO_HINT}</span>
              <span className="form-hint" id="bio-count" aria-live="polite">{formData.bio.length}/300</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="profile-dept">{PROFILE.LABEL_DEPARTMENT}</label>
                <input
                  id="profile-dept"
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder={PROFILE.LABEL_DEPARTMENT_PLACEHOLDER}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profile-year">{PROFILE.LABEL_YEAR}</label>
                <input
                  id="profile-year"
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder={PROFILE.LABEL_YEAR_PLACEHOLDER}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="profile-github">{PROFILE.LABEL_GITHUB}</label>
              <input
                id="profile-github"
                type="url"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder={PROFILE.LABEL_GITHUB_PLACEHOLDER}
                aria-describedby="github-hint"
              />
              <span className="form-hint" id="github-hint">{PROFILE.LABEL_GITHUB_HINT}</span>
            </div>

            <div className="form-group">
              <label htmlFor="profile-linkedin">{PROFILE.LABEL_LINKEDIN}</label>
              <input
                id="profile-linkedin"
                type="url"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder={PROFILE.LABEL_LINKEDIN_PLACEHOLDER}
                aria-describedby="linkedin-hint"
              />
              <span className="form-hint" id="linkedin-hint">{PROFILE.LABEL_LINKEDIN_HINT}</span>
            </div>

            <button type="submit" className="btn-primary" disabled={saving} aria-busy={saving}>
              {saving ? PROFILE.SAVING : PROFILE.BUTTON_SAVE}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="profile-section" aria-label="Change password">
          <h2><LockIcon size={18} /> {PROFILE.PASSWORD_HEADING}</h2>
          <p className="section-desc">{PROFILE.PASSWORD_SUBHEADING}</p>
          <form onSubmit={handlePasswordSubmit} className="profile-form" noValidate>
            <div className="form-group">
              <label htmlFor="current-pw">{PROFILE.LABEL_CURRENT}</label>
              <input
                id="current-pw"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder={PROFILE.PLACEHOLDER_CURRENT}
                required
                autoComplete="current-password"
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-pw">{PROFILE.LABEL_NEW}</label>
              <input
                id="new-pw"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder={PROFILE.PLACEHOLDER_NEW}
                required
                minLength={6}
                autoComplete="new-password"
                aria-required="true"
                aria-describedby="new-pw-hint"
              />
              <span className="form-hint" id="new-pw-hint">{PROFILE.LABEL_NEW_HINT}</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-new-pw">{PROFILE.LABEL_CONFIRM}</label>
              <input
                id="confirm-new-pw"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder={PROFILE.PLACEHOLDER_CONFIRM}
                required
                autoComplete="new-password"
                aria-required="true"
              />
            </div>

            <button type="submit" className="btn-warning" disabled={changingPassword} aria-busy={changingPassword}>
              {changingPassword ? PROFILE.CHANGING : PROFILE.BUTTON_CHANGE}
            </button>
          </form>
        </section>

        {/* Account Details */}
        <section className="profile-section account-info" aria-label="Account details">
          <h2>{PROFILE.ACCOUNT_HEADING}</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">{PROFILE.LABEL_ROLE}</span>
              <span className={`info-value role-badge ${profile?.role}`}>
                {profile?.role === "admin" ? PROFILE.ROLE_ADMIN : PROFILE.ROLE_MEMBER}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">{PROFILE.LABEL_ACM_MEMBER}</span>
              <span className="info-value">{profile?.isAcmMember ? PROFILE.MEMBER_YES : PROFILE.MEMBER_NO}</span>
            </div>
            {profile?.acmId && (
              <div className="info-item">
                <span className="info-label">{PROFILE.LABEL_ACM_ID}</span>
                <span className="info-value">{profile.acmId}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">{PROFILE.LABEL_JOINED}</span>
              <span className="info-value">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "\u2014"}
              </span>
            </div>
          </div>
        </section>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default Profile;
