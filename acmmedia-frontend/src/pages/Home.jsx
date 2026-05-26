/**
 * Home Page
 * 
 * The main feed displaying chapter announcements and posts.
 * Features real-time like updates via Socket.IO and a tech news ticker.
 * 
 * Behavior:
 * - Fetches all posts on mount
 * - Displays connection status badge (LIVE/DISCONNECTED)
 * - Shows loading, error, and empty states gracefully
 * - Admin users see delete controls on each post
 * 
 * @page
 */

import React, { useEffect, useState, useContext } from "react";
import { fetchPosts } from "../api/posts";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import TechPulse from "../components/TechPulse";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray } from "../utils/api";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState("");
  const { user } = useContext(AuthContext);
  const isConnected = useConnectionStatus();

  // Fetch posts on component mount
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError("");
        const res = await fetchPosts();
        setPosts(extractArray(res.data, ["posts", "data"]));
      } catch (err) {
        console.error("Failed to load posts", err);
        setPosts([]);
        setPostsError("Unable to load chapter updates right now.");
      } finally {
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, []);

  /** Remove a deleted post from local state (optimistic UI) */
  const handleDeletePost = (id) => {
    setPosts(posts.filter((p) => p._id !== id));
  };

  return (
    <div className="home-wrapper">
      <TechPulse mode="ticker" />

      {/* Page Header */}
      <header className="home-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.6rem" }}>
          <h1 style={{ margin: 0 }}>ACM-XIM-ENVOY</h1>
          <ConnectionBadge isConnected={isConnected} />
        </div>
        <p>
          Official announcements, achievements, and updates from the ACM Student Chapter.
        </p>
      </header>

      {/* Posts Feed */}
      <section className="home-feed">
        {loadingPosts ? (
          <p className="home-empty">Loading latest chapter updates...</p>
        ) : postsError ? (
          <p className="home-empty">{postsError}</p>
        ) : posts.length === 0 ? (
          <p className="home-empty">No updates available at the moment.</p>
        ) : (
          posts.map((p) => (
            <PostCard key={p._id} post={p} onDelete={handleDeletePost} />
          ))
        )}
      </section>
    </div>
  );
}
