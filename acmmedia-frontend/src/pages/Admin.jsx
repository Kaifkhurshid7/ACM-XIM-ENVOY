/**
 * Admin Dashboard Page
 * 
 * Administrative control panel for chapter coordinators.
 * Provides content creation tools and platform analytics.
 * 
 * @page
 */

import { useState, useEffect, useContext } from "react";
import { createPost, fetchPosts } from "../api/posts";
import { createEvent } from "../api/events";
import { fetchThreads } from "../api/forum";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray, extractErrorMessage } from "../utils/api";
import { SOCKET_EVENTS } from "../constants";
import { ADMIN } from "../constants/copy";
import Toast from "../components/Toast";
import { ArrowLeftIcon, SendIcon, CalendarIcon } from "../components/ui/Icons";

const Admin = () => {
  const [stats, setStats] = useState({ likes: 0, comments: 0, posts: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const [toast, setToast] = useState(null);
  const isConnected = useConnectionStatus();
  const socket = useSocket();

  const [postData, setPostData] = useState({ title: "", content: "" });
  const [eventData, setEventData] = useState({
    title: "", description: "", date: "", location: "", registrationLink: "",
  });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const refreshFallbackStats = async () => {
    const [postsRes, threadsRes] = await Promise.all([fetchPosts(), fetchThreads()]);
    const posts = extractArray(postsRes.data, ["posts", "data"]);
    const threads = extractArray(threadsRes.data, ["threads", "data"]);

    setStats((prev) => ({
      ...prev,
      posts: posts.length,
      likes: posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0),
      comments: threads.reduce((acc, t) => acc + (t.replies?.length || 0), 0),
    }));
  };

  useEffect(() => {
    const fetchInitialStats = async () => {
      try {
        await refreshFallbackStats();
      } catch (err) {
        console.error("Fallback analytics fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialStats();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onAnalyticsUpdate = (data) => {
      setStats((prev) => ({ ...prev, ...data }));
      setLoading(false);
    };

    socket.on(SOCKET_EVENTS.ANALYTICS_UPDATE, onAnalyticsUpdate);

    if (socket.connected) {
      socket.emit(SOCKET_EVENTS.ANALYTICS_REQUEST);
    }

    const timeout = setTimeout(() => setLoading(false), 5000);

    return () => {
      socket.off(SOCKET_EVENTS.ANALYTICS_UPDATE, onAnalyticsUpdate);
      clearTimeout(timeout);
    };
  }, [socket]);

  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "admin") navigate("/");
  }, [user, navigate]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      setSubmittingPost(true);
      await createPost(postData);
      await refreshFallbackStats();
      setToast({ type: "success", message: ADMIN.POST_SUCCESS });
      setPostData({ title: "", content: "" });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, ADMIN.POST_ERROR) });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEvent(true);
      await createEvent(eventData);
      setToast({ type: "success", message: ADMIN.EVENT_SUCCESS });
      setEventData({ title: "", description: "", date: "", location: "", registrationLink: "" });
    } catch (err) {
      setToast({ type: "error", message: extractErrorMessage(err, ADMIN.EVENT_ERROR) });
    } finally {
      setSubmittingEvent(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <h1>{ADMIN.HEADING}</h1>
        <p>{ADMIN.SUBHEADING}</p>
      </header>

      {/* Content Creation */}
      <section className="admin-actions" aria-label="Content creation tools">
        {/* Create Post */}
        <div className="admin-card">
          <h2>{ADMIN.POST_HEADING}</h2>
          <p>{ADMIN.POST_DESCRIPTION}</p>
          <form onSubmit={handleCreatePost} noValidate>
            <label htmlFor="post-title" className="sr-only">{ADMIN.POST_LABEL_TITLE}</label>
            <input
              id="post-title"
              type="text"
              placeholder={ADMIN.POST_PLACEHOLDER_TITLE}
              value={postData.title}
              onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              required
              aria-required="true"
            />
            <label htmlFor="post-content" className="sr-only">{ADMIN.POST_LABEL_CONTENT}</label>
            <textarea
              id="post-content"
              placeholder={ADMIN.POST_PLACEHOLDER_CONTENT}
              value={postData.content}
              onChange={(e) => setPostData({ ...postData, content: e.target.value })}
              required
              aria-required="true"
            />
            <button type="submit" disabled={submittingPost} aria-busy={submittingPost}>
              <SendIcon size={14} /> {submittingPost ? ADMIN.POST_PUBLISHING : ADMIN.POST_BUTTON}
            </button>
          </form>
        </div>

        {/* Create Event */}
        <div className="admin-card">
          <h2>{ADMIN.EVENT_HEADING}</h2>
          <p>{ADMIN.EVENT_DESCRIPTION}</p>
          <form onSubmit={handleCreateEvent} noValidate>
            <label htmlFor="event-title" className="sr-only">{ADMIN.EVENT_LABEL_TITLE}</label>
            <input
              id="event-title"
              type="text"
              placeholder={ADMIN.EVENT_PLACEHOLDER_TITLE}
              value={eventData.title}
              onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              required
              aria-required="true"
            />
            <label htmlFor="event-date" className="sr-only">{ADMIN.EVENT_LABEL_DATE}</label>
            <input
              id="event-date"
              type="date"
              value={eventData.date}
              onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
              required
              aria-required="true"
              aria-label="Event date"
            />
            <label htmlFor="event-location" className="sr-only">{ADMIN.EVENT_LABEL_LOCATION}</label>
            <input
              id="event-location"
              type="text"
              placeholder={ADMIN.EVENT_PLACEHOLDER_LOCATION}
              value={eventData.location}
              onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
              required
              aria-required="true"
            />
            <label htmlFor="event-link" className="sr-only">{ADMIN.EVENT_LABEL_LINK}</label>
            <input
              id="event-link"
              type="url"
              placeholder={ADMIN.EVENT_PLACEHOLDER_LINK}
              value={eventData.registrationLink}
              onChange={(e) => setEventData({ ...eventData, registrationLink: e.target.value })}
              aria-label="Registration link (optional)"
            />
            <label htmlFor="event-desc" className="sr-only">{ADMIN.EVENT_LABEL_DESCRIPTION}</label>
            <textarea
              id="event-desc"
              placeholder={ADMIN.EVENT_PLACEHOLDER_DESCRIPTION}
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              required
              aria-required="true"
            />
            <button type="submit" disabled={submittingEvent} aria-busy={submittingEvent}>
              <CalendarIcon size={14} /> {submittingEvent ? ADMIN.EVENT_CREATING : ADMIN.EVENT_BUTTON}
            </button>
          </form>
        </div>
      </section>

      {/* Content Management */}
      <section className="admin-info">
        <h2>{ADMIN.MODERATION_HEADING}</h2>
        <p>{ADMIN.MODERATION_DESCRIPTION}</p>
        <button className="admin-btn-outline" onClick={() => navigate("/")}>
          <ArrowLeftIcon size={14} /> {ADMIN.MODERATION_BUTTON}
        </button>
      </section>

      {/* Analytics */}
      <section className="admin-analytics" aria-label="Platform analytics">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2>{ADMIN.ANALYTICS_HEADING}</h2>
            <ConnectionBadge isConnected={isConnected} />
          </div>
        </div>
        <p>{ADMIN.ANALYTICS_SUBHEADING}</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }} role="status" aria-live="polite">
            <p>{ADMIN.ANALYTICS_SYNCING}</p>
          </div>
        ) : (
          <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>{ADMIN.ANALYTICS_USERS}</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.members || stats.users || "\u2014"}</p>
            </div>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>{ADMIN.ANALYTICS_POSTS}</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.posts}</p>
            </div>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>{ADMIN.ANALYTICS_COMMENTS}</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.comments}</p>
            </div>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>{ADMIN.ANALYTICS_LIKES}</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.likes}</p>
            </div>
          </div>
        )}
      </section>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default Admin;
