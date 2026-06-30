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

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoadingPosts(true);
        setPostsError("");
        const res = await fetchPosts();
        setPosts(extractArray(res.data, ["data", "posts"]));
      } catch (err) {
        setPosts([]);
        setPostsError("Unable to load updates right now. Please try again shortly.");
      } finally {
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, []);

  const handleDeletePost = (id) => setPosts(posts.filter((p) => p._id !== id));

  return (
    <div className="home-wrapper">
      <TechPulse mode="ticker" />
      <header className="home-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <h1 style={{ margin: 0 }}>Chapter Feed</h1>
          <ConnectionBadge isConnected={isConnected} />
        </div>
        <p>Announcements, achievements, and updates from the ACM Student Chapter.</p>
      </header>

      <section className="home-feed">
        {loadingPosts ? (
          <p className="home-empty">Loading latest updates...</p>
        ) : postsError ? (
          <p className="home-empty">{postsError}</p>
        ) : posts.length === 0 ? (
          <p className="home-empty">No updates yet. Check back soon for chapter announcements.</p>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} onDelete={handleDeletePost} />)
        )}
      </section>
    </div>
  );
}
