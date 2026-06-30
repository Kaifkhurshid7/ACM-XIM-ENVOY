/**
 * Admin Dashboard Page
 * 
 * Administrative control panel for chapter coordinators.
 * Provides content creation tools and platform analytics.
 * 
 * Features:
 * - Create and publish chapter news posts
 * - Schedule and manage events
 * - View real-time platform analytics (via Socket.IO)
 * - Navigate to main feed for content moderation
 * 
 * Access Control:
 * - Redirects non-admin users to home page
 * - Redirects unauthenticated users to login
 * 
 * @page
 */

import React, { useState, useEffect, useContext } from "react";
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

const Admin = () => {
  const [stats, setStats] = useState({ likes: 0, comments: 0, posts: 0, members: 0 });
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingEvent, setSubmittingEvent] = useState(false);
  const isConnected = useConnectionStatus();
  const socket = useSocket();

  const [postData, setPostData] = useState({ title: "", content: "" });
  const [eventData, setEventData] = useState({
    title: "", description: "", date: "", location: "", registrationLink: "",
  });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  /** Compute stats from public endpoints as fallback */
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

  // Initial data fetch
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

  // Subscribe to real-time analytics from backend
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

  // Route protection - redirect non-admin users
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
      alert("Post published successfully.");
      setPostData({ title: "", content: "" });
    } catch (err) {
      alert(extractErrorMessage(err, "Unable to publish post. Please try again."));
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEvent(true);
      await createEvent(eventData);
      alert("Event created successfully.");
      setEventData({ title: "", description: "", date: "", location: "", registrationLink: "" });
    } catch (err) {
      alert(extractErrorMessage(err, "Unable to create event. Please try again."));
    } finally {
      setSubmittingEvent(false);
    }
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <h1>Administration Console</h1>
        <p>Welcome to the <strong>Envoy Platform</strong> administration dashboard.</p>
      </header>

      {/* Content Creation */}
      <section className="admin-actions">
        {/* Create Post */}
        <div className="admin-card">
          <h2>Publish announcement</h2>
          <p>Create updates that appear on the chapter feed for all members.</p>
          <form onSubmit={handleCreatePost}>
            <input type="text" placeholder="News Title" value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} required />
            <textarea placeholder="Write detailed news content here..." value={postData.content} onChange={(e) => setPostData({ ...postData, content: e.target.value })} required />
            <button type="submit" disabled={submittingPost}>{submittingPost ? "Publishing..." : "Publish News"}</button>
          </form>
        </div>

        {/* Create Event */}
        <div className="admin-card">
          <h2>Schedule event</h2>
          <p>Add upcoming workshops, hackathons, or technical sessions.</p>
          <form onSubmit={handleCreateEvent}>
            <input type="text" placeholder="Event Title" value={eventData.title} onChange={(e) => setEventData({ ...eventData, title: e.target.value })} required />
            <input type="date" value={eventData.date} onChange={(e) => setEventData({ ...eventData, date: e.target.value })} required />
            <input type="text" placeholder="Event Location / Mode" value={eventData.location} onChange={(e) => setEventData({ ...eventData, location: e.target.value })} required />
            <input type="text" placeholder="Registration Link (optional)" value={eventData.registrationLink} onChange={(e) => setEventData({ ...eventData, registrationLink: e.target.value })} />
            <textarea placeholder="Describe agenda, speakers, eligibility..." value={eventData.description} onChange={(e) => setEventData({ ...eventData, description: e.target.value })} required />
            <button type="submit" disabled={submittingEvent}>{submittingEvent ? "Saving Event..." : "Add Event"}</button>
          </form>
        </div>
      </section>

      {/* Content Management */}
      <section className="admin-info">
        <h2>Content moderation</h2>
        <p>Manage posts, moderate discussions, and remove content from the main feed.</p>
        <button className="admin-btn-outline" onClick={() => navigate("/")}>← View feed</button>
      </section>

      {/* Analytics */}
      <section className="admin-analytics">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2>Platform overview</h2>
            <ConnectionBadge isConnected={isConnected} />
          </div>
        </div>
        <p>A high-level overview of platform engagement and user activity.</p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", opacity: 0.6 }}>
            <div className="loader-dots">Synchronizing analytics...</div>
          </div>
        ) : (
          <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>Total Users</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.members || stats.users || "—"}</p>
            </div>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>Total Posts</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.posts}</p>
            </div>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>Total Comments</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.comments}</p>
            </div>
            <div className="analytics-card" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <h4>Total Likes</h4>
              <p style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#fff", margin: 0 }}>{stats.likes}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Admin;
