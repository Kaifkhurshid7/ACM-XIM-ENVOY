/**
 * Modern Profile Page - Production Ready
 *
 * Features:
 * - Cover banner with avatar overlay (own profile)
 * - Profile completion percentage (own profile)
 * - Statistics cards (reputation, contributions, profile views, achievements)
 * - Tabbed interface (Overview, Activity, Bookmarks, Achievements)
 * - Profile editing with validation
 * - Social links management
 * - Responsive design
 * - Skeleton loaders
 *
 * @page
 */

import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCurrentProfile,
  getPublicProfile,
  updateProfile,
  uploadAvatar,
  uploadBanner,
  getAchievements,
} from "../api/profileV2.js";
import { extractErrorMessage } from "../utils/api";
import Toast from "../components/Toast";
import {
  UploadIcon,
  LockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  ClockIcon,
  HeartIcon,
  SparkleIcon,
} from "../components/ui/Icons";
import "../styles/modernProfile.css";

/**
 * Mirrors the backend completion weights in models/User.js so the
 * completion bar stays accurate after edits without an extra round-trip.
 */
const COMPLETION_FIELDS = [
  { name: "name", weight: 15 },
  { name: "avatar", weight: 15 },
  { name: "bio", weight: 10 },
  { name: "department", weight: 10 },
  { name: "batch", weight: 10 },
  { name: "username", weight: 10 },
  { name: "skills", weight: 10, isArray: true },
  { name: "interests", weight: 10, isArray: true },
];

const computeCompletion = (profile) => {
  if (!profile) return 0;
  let completed = 0;
  let total = 0;
  COMPLETION_FIELDS.forEach((field) => {
    total += field.weight;
    const value = profile[field.name];
    const isDone = field.isArray
      ? Array.isArray(value) && value.length > 0
      : Boolean(value);
    if (isDone) completed += field.weight;
  });
  return total ? Math.round((completed / total) * 100) : 0;
};

const ModernProfile = () => {
  const { user: currentUser } = useContext(AuthContext);
  const { username } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const isOwnProfile =
    !username ||
    username === currentUser?.username ||
    username === currentUser?.email?.split("@")[0];

  // ─── State ────────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    department: "",
    batch: "",
    location: "",
    website: "",
    portfolio: "",
    skills: [],
    interests: [],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      portfolio: "",
    },
  });

  // ─── Auth guard ───────────────────────────────────────────────────────
  // Own profile requires a session; public profiles stay accessible to guests.
  useEffect(() => {
    if (isOwnProfile && !currentUser) navigate("/login");
  }, [isOwnProfile, currentUser, navigate]);

  // ─── Load Profile ────────────────────────────────────────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        let profileData;

        if (isOwnProfile) {
          const res = await getCurrentProfile();
          profileData = res.data.user;
          setCompletion(res.data.profileCompletion?.percentage ?? 0);

          // Achievements are supplementary — never block the profile on them.
          try {
            const achievementsRes = await getAchievements();
            setAchievements(achievementsRes.data.achievements || []);
          } catch (err) {
            console.error("Failed to load achievements", err);
          }
        } else {
          const res = await getPublicProfile(username);
          profileData = res.data.user;
        }

        if (!profileData) throw new Error("Profile data missing from response");

        setProfile(profileData);
        setFormData({
          name: profileData.name || "",
          bio: profileData.bio || "",
          department: profileData.department || "",
          batch: profileData.batch || "",
          location: profileData.location || "",
          website: profileData.website || "",
          portfolio: profileData.portfolio || "",
          skills: profileData.skills || [],
          interests: profileData.interests || [],
          socialLinks: profileData.socialLinks || {},
        });
      } catch (err) {
        setToast({
          type: "error",
          message: extractErrorMessage(err, "Failed to load profile"),
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, isOwnProfile, currentUser]);

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleBannerClick = () => bannerInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "Avatar must be under 5MB." });
      return;
    }

    try {
      setUploading(true);
      const res = await uploadAvatar(file);
      const next = { ...profile, avatar: res.data.avatar };
      setProfile(next);
      setCompletion(computeCompletion(next));
      setToast({ type: "success", message: "Avatar updated." });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "Banner must be under 5MB." });
      return;
    }

    try {
      setUploading(true);
      const res = await uploadBanner(file);
      setProfile((prev) => ({ ...prev, bannerImage: res.data.bannerImage }));
      setToast({ type: "success", message: "Banner updated." });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await updateProfile(formData);
      // Merge — the PATCH response omits avatar/banner/privacy/analytics.
      const updated = res.data.user;
      setProfile((prev) => ({ ...prev, ...updated }));
      setCompletion(computeCompletion({ ...profile, ...updated }));
      setEditMode(false);
      setToast({ type: "success", message: "Profile updated." });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  // ─── Render Helpers ──────────────────────────────────────────────────

  const backendBase = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace("/api/v1", "")
    : import.meta.env.DEV
      ? "http://localhost:5000"
      : "https://acmmedia-backend.onrender.com";

  const avatarSrc = profile?.avatar ? `${backendBase}${profile.avatar}` : null;
  const bannerSrc = profile?.bannerImage ? `${backendBase}${profile.bannerImage}` : null;

  if (loading) {
    return (
      <div className="profile-skeleton" role="status" aria-live="polite">
        <div className="skeleton-banner" />
        <div className="skeleton-body">
          <div className="skeleton-avatar" />
          <div className="skeleton-lines">
            <div className="skeleton-line w60" />
            <div className="skeleton-line w40" />
            <div className="skeleton-line w80" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <div className="profile-error-card">
          <h2>Profile not found</h2>
          <p>The profile you're looking for doesn't exist or isn't public.</p>
          <button className="btn-ghost" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────

  return (
    <div className="modern-profile">
      {/* Banner Section */}
      <div className="profile-banner-section">
        {bannerSrc ? (
          <img src={bannerSrc} alt="Cover banner" className="profile-banner" />
        ) : (
          <div className="profile-banner-placeholder" />
        )}
        {isOwnProfile && (
          <button
            className="banner-upload-btn"
            onClick={handleBannerClick}
            disabled={uploading}
            aria-label="Change cover banner"
          >
            <UploadIcon size={14} /> Edit Cover
          </button>
        )}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Profile Header */}
      <div className="profile-header-section">
        <div className="profile-avatar-container">
          {isOwnProfile ? (
            <button
              type="button"
              className="profile-avatar"
              onClick={handleAvatarClick}
              disabled={uploading}
              aria-label="Change profile picture"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <div className="profile-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt={profile.name} />
              ) : (
                <div className="avatar-placeholder">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}
          {isOwnProfile && (
            <button
              className="avatar-edit-btn"
              onClick={handleAvatarClick}
              disabled={uploading}
              aria-label="Change profile picture"
            >
              {uploading ? "Uploading…" : <UploadIcon size={13} />}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="profile-header-info">
          <p className="profile-eyebrow">
            <span className="eyebrow-dot" />
            {isOwnProfile ? "Your Profile" : "Chapter Member"}
          </p>
          <div className="profile-name-row">
            <h1>{profile.name}</h1>
            {profile.emailVerified && (
              <span className="verified-badge" title="Email verified">✓</span>
            )}
          </div>
          <p className="profile-username">@{profile.username || profile.email?.split("@")[0]}</p>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}

          <div className="profile-meta">
            {profile.location && (
              <span className="meta-item">
                <MapPinIcon size={13} /> {profile.location}
              </span>
            )}
            {profile.department && <span className="meta-chip">{profile.department}</span>}
            {profile.batch && <span className="meta-chip">{profile.batch}</span>}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer" className="meta-link">
                <ExternalLinkIcon size={12} /> Website
              </a>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <div className="profile-actions">
            <button
              className={`btn-edit ${editMode ? "active" : ""}`}
              onClick={() => setEditMode((m) => !m)}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </button>
            <button
              className="btn-settings"
              onClick={() => navigate("/security")}
              aria-label="Account and security settings"
            >
              <LockIcon size={14} /> Settings
            </button>
          </div>
        )}
      </div>

      {/* Completion Bar */}
      {isOwnProfile && completion < 100 && (
        <div className="profile-completion">
          <div className="completion-bar">
            <div className="completion-fill" style={{ width: `${completion}%` }} />
          </div>
          <span className="completion-text">{completion}% complete</span>
        </div>
      )}

      {/* Statistics */}
      <div className="profile-stats">
        <div className="stat-card">
          <h4>Reputation</h4>
          <p className="stat-value">{profile?.reputation ?? 0}</p>
        </div>
        <div className="stat-card">
          <h4>Contributions</h4>
          <p className="stat-value">{profile?.contributionScore ?? 0}</p>
        </div>
        <div className="stat-card">
          <h4>Profile Views</h4>
          <p className="stat-value">{profile?.profileViews ?? 0}</p>
        </div>
        <div className="stat-card">
          <h4>Achievements</h4>
          <p className="stat-value">{profile?.achievements ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs" role="tablist" aria-label="Profile sections">
        <button
          role="tab"
          aria-selected={activeTab === "overview"}
          className={`tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "activity"}
          className={`tab ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          Activity
        </button>
        {isOwnProfile && (
          <button
            role="tab"
            aria-selected={activeTab === "bookmarks"}
            className={`tab ${activeTab === "bookmarks" ? "active" : ""}`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Bookmarks
          </button>
        )}
        {achievements.length > 0 && (
          <button
            role="tab"
            aria-selected={activeTab === "achievements"}
            className={`tab ${activeTab === "achievements" ? "active" : ""}`}
            onClick={() => setActiveTab("achievements")}
          >
            Achievements
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === "overview" && (
          <div className="tab-pane">
            {editMode && isOwnProfile ? (
              <EditProfileForm
                formData={formData}
                setFormData={setFormData}
                onSave={handleSaveProfile}
                saving={saving}
              />
            ) : (
              <ProfileOverview profile={profile} />
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="tab-pane">
            <ActivityTimeline />
          </div>
        )}

        {activeTab === "bookmarks" && isOwnProfile && (
          <div className="tab-pane">
            <BookmarksView />
          </div>
        )}

        {activeTab === "achievements" && achievements.length > 0 && (
          <div className="tab-pane">
            <AchievementsGrid achievements={achievements} />
          </div>
        )}
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

// ─── Sub-Components ────────────────────────────────────────────────────

const EditProfileForm = ({ formData, setFormData, onSave, saving }) => {
  return (
    <form
      className="edit-profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="form-group">
        <label htmlFor="edit-name">Name</label>
        <input
          id="edit-name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-bio">Bio</label>
        <textarea
          id="edit-bio"
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          maxLength={300}
          rows={4}
          placeholder="Tell us about yourself…"
        />
        <span className="char-count">{formData.bio.length}/300</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="edit-department">Department</label>
          <input
            id="edit-department"
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-batch">Batch</label>
          <input
            id="edit-batch"
            type="text"
            value={formData.batch}
            onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="edit-location">Location</label>
        <input
          id="edit-location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="edit-website">Website</label>
          <input
            id="edit-website"
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://example.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-portfolio">Portfolio</label>
          <input
            id="edit-portfolio"
            type="url"
            value={formData.portfolio}
            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
            placeholder="https://portfolio.com"
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="edit-skills">Skills (comma-separated)</label>
        <input
          id="edit-skills"
          type="text"
          value={formData.skills.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="React, Node.js, TypeScript..."
        />
      </div>

      <div className="form-group">
        <label htmlFor="edit-interests">Interests (comma-separated)</label>
        <input
          id="edit-interests"
          type="text"
          value={formData.interests.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              interests: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="Web Development, AI, Design..."
        />
      </div>

      <div className="social-links-section">
        <h3>Social Links</h3>
        <div className="form-group">
          <label htmlFor="edit-github">GitHub</label>
          <input
            id="edit-github"
            type="url"
            value={formData.socialLinks.github || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, github: e.target.value },
              })
            }
            placeholder="https://github.com/username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-linkedin">LinkedIn</label>
          <input
            id="edit-linkedin"
            type="url"
            value={formData.socialLinks.linkedin || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
              })
            }
            placeholder="https://linkedin.com/in/username"
          />
        </div>
        <div className="form-group">
          <label htmlFor="edit-twitter">Twitter/X</label>
          <input
            id="edit-twitter"
            type="url"
            value={formData.socialLinks.twitter || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                socialLinks: { ...formData.socialLinks, twitter: e.target.value },
              })
            }
            placeholder="https://twitter.com/username"
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};

const ProfileOverview = ({ profile }) => {
  const hasConnectLinks =
    Object.values(profile.socialLinks || {}).some((link) => link) || Boolean(profile.website);

  return (
    <div className="overview-content">
      <div className="overview-section">
        <h3>About</h3>
        <p>{profile.bio || "No bio added yet"}</p>
      </div>

      {profile.skills?.length > 0 && (
        <div className="overview-section">
          <h3>Skills</h3>
          <div className="tags">
            {profile.skills.map((skill) => (
              <span key={skill} className="tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.interests?.length > 0 && (
        <div className="overview-section">
          <h3>Interests</h3>
          <div className="tags">
            {profile.interests.map((interest) => (
              <span key={interest} className="tag">
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {hasConnectLinks && (
        <div className="overview-section">
          <h3>Connect</h3>
          <div className="social-links">
            {profile.socialLinks?.github && (
              <a href={profile.socialLinks.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {profile.socialLinks?.linkedin && (
              <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
            {profile.socialLinks?.twitter && (
              <a href={profile.socialLinks.twitter} target="_blank" rel="noreferrer">
                Twitter/X
              </a>
            )}
            {profile.socialLinks?.portfolio && (
              <a href={profile.socialLinks.portfolio} target="_blank" rel="noreferrer">
                Portfolio
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noreferrer">
                Website
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ActivityTimeline = () => {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <ClockIcon size={24} />
      </span>
      <h4>No activity yet</h4>
      <p>
        Your recent discussions, replies, and contributions will appear here as you engage
        with the chapter.
      </p>
    </div>
  );
};

const BookmarksView = () => {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <HeartIcon size={24} />
      </span>
      <h4>No bookmarks yet</h4>
      <p>
        Save posts, discussions, events, and articles to revisit them later from your profile.
      </p>
    </div>
  );
};

const AchievementsGrid = ({ achievements }) => {
  return (
    <div className="achievements-grid">
      {achievements.map((achievement) => (
        <div key={achievement.badge || achievement.unlockedAt} className="achievement-card">
          <span className="achievement-icon">
            <SparkleIcon size={20} />
          </span>
          <span className="achievement-badge">{achievement.badge}</span>
          <p>{achievement.description}</p>
          {achievement.unlockedAt && (
            <span className="achievement-date">
              {new Date(achievement.unlockedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModernProfile;
