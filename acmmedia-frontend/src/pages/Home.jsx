import { useEffect, useState, useContext } from "react";
import { fetchPosts } from "../api/posts";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import TechPulse from "../components/TechPulse";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray } from "../utils/api";
import { HOME } from "../constants/copy";

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
        setPostsError(HOME.ERROR);
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
          <h1 style={{ margin: 0 }}>{HOME.HEADING}</h1>
          <ConnectionBadge isConnected={isConnected} />
        </div>
        <p>{HOME.SUBHEADING}</p>
      </header>

      <section className="home-feed" aria-label="Chapter announcements feed">
        {loadingPosts ? (
          <p className="home-empty" role="status" aria-live="polite">{HOME.LOADING}</p>
        ) : postsError ? (
          <p className="home-empty" role="alert">{postsError}</p>
        ) : posts.length === 0 ? (
          <div className="home-empty" aria-label="Empty feed">
            <p>{HOME.EMPTY}</p>
          </div>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} onDelete={handleDeletePost} />)
        )}
      </section>
    </div>
  );
}
