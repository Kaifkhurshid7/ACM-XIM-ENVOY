import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { fetchPosts } from "../api/posts";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import HomeHero from "../components/HomeHero";
import HomeShowcase from "../components/HomeShowcase";
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
    <div className="home-page">
      <HomeHero user={user} isConnected={isConnected} />

      <HomeShowcase />

      <div className="home-wrapper">
        <section className="home-feed" aria-label="Chapter announcements feed">
          {loadingPosts ? (
            <p className="home-empty" role="status" aria-live="polite">{HOME.LOADING}</p>
          ) : postsError ? (
            <p className="home-empty" role="alert">{postsError}</p>
          ) : posts.length === 0 ? (
            <div className="feed-empty" aria-label="Empty feed">
              <ol className="gt">
                <li className="gt-item gt-item--live">
                  <span className="gt-node" aria-hidden="true" />
                  <div className="gt-card">
                    <span className="gt-label">// next announcement</span>
                    <h2>Waiting for the first post</h2>
                    <p>{HOME.EMPTY}</p>
                  </div>
                </li>
                <li className="gt-item gt-item--ghost" aria-hidden="true">
                  <span className="gt-node" />
                  <div className="gt-card gt-card--ghost"><i /><i /><i /></div>
                </li>
                <li className="gt-item gt-item--ghost gt-item--faint" aria-hidden="true">
                  <span className="gt-node" />
                  <div className="gt-card gt-card--ghost"><i /><i /></div>
                </li>
              </ol>
              <div className="feed-empty-actions">
                <a href="https://www.instagram.com/xim_acm/" target="_blank" rel="noopener noreferrer" className="feed-empty-btn feed-empty-btn--primary">Follow on Instagram</a>
                <Link to="/events" className="feed-empty-btn">Browse events</Link>
                <Link to="/forum" className="feed-empty-btn">Join the discussion</Link>
              </div>
            </div>
          ) : (
            posts.map((p) => <PostCard key={p._id} post={p} onDelete={handleDeletePost} />)
          )}
        </section>
      </div>
    </div>
  );
}
