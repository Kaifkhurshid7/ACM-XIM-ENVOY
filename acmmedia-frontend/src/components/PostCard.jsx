/**
 * PostCard Component
 * 
 * Renders a single post/announcement card with interactive features.
 * Supports real-time like updates via Socket.IO subscription.
 * 
 * Features:
 * - Like/unlike toggle (authenticated users)
 * - Guest prompt for unauthenticated like attempts
 * - Expandable comments section
 * - Admin delete controls
 * - Real-time like count synchronization
 * 
 * @component
 * @param {object} post - Post data object from API
 * @param {function} onDelete - Callback when post is deleted
 */

import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { likePost, deletePost } from "../api/posts";
import { fetchComments, addComment, deleteComment } from "../api/comments";
import CommentBox from "./CommentBox";
import { useSocket } from "../context/SocketContext";
import { extractArray, extractObject } from "../utils/api";
import { SOCKET_EVENTS } from "../constants";

const PostCard = ({ post, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const socket = useSocket();

  // Subscribe to real-time like updates for this post
  useEffect(() => {
    if (!socket) return;

    const onLikeUpdate = (data) => {
      if (data.postId === post._id) {
        setLikes(data.likes);
      }
    };

    socket.on(SOCKET_EVENTS.POST_LIKE_UPDATE, onLikeUpdate);
    return () => socket.off(SOCKET_EVENTS.POST_LIKE_UPDATE, onLikeUpdate);
  }, [socket, post._id]);

  const isLiked = user && Array.isArray(likes) && likes.includes(user._id);
  const isAdmin = user && user.role === "admin";

  /** Toggle like - prompts guests to login */
  const handleLike = async () => {
    if (!user) {
      return alert("Please login to like this post and join the ACM-XIM-ENVOY community.");
    }
    try {
      const { data } = await likePost(post._id);
      setLikes(extractArray(data, ["likes", "data"]));
    } catch (err) {
      console.error(err);
    }
  };

  /** Load/toggle comments section */
  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      try {
        const { data } = await fetchComments(post._id);
        setComments(extractArray(data, ["comments", "data"]));
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (text) => {
    if (!user) return;
    try {
      const { data } = await addComment({ postId: post._id, text });
      const newComment = extractObject(data, ["comment", "data"]);
      if (newComment) setComments([newComment, ...comments]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deletePost(post._id);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="post-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.8rem" }}>{post.title}</h3>
      <p style={{ lineHeight: "1.7", opacity: 0.9 }}>{post.content}</p>

      {/* Action Bar */}
      <div className="post-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.2rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleLike}
            style={{
              padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", cursor: "pointer",
              background: isLiked ? "#ffffff" : "rgba(255,255,255,0.1)",
              color: isLiked ? "#000000" : "#ffffff",
              fontWeight: "600", transition: "0.3s",
              opacity: !user ? 0.6 : 1,
            }}
          >
            🤍 {likes.length}
          </button>
          <button
            onClick={toggleComments}
            style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", borderRadius: "8px", cursor: "pointer" }}
          >
            💬 Comments
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ opacity: 0.5, fontSize: "0.85rem" }}>
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
          {isAdmin && (
            <button
              onClick={handleDeletePost}
              style={{ background: "#dc2626", color: "white", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer" }}
            >
              Delete Post
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section" style={{ marginTop: "1.5rem", background: "rgba(0,0,0,0.2)", padding: "1.2rem", borderRadius: "10px" }}>
          {user ? (
            <CommentBox onAdd={handleAddComment} />
          ) : (
            <div style={{ padding: "1rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "1rem" }}>
              Please <strong>Login</strong> to participate in this discussion.
            </div>
          )}

          {loadingComments ? (
            <p style={{ textAlign: "center", color: "#aaa" }}>Loading discussions...</p>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {comments.length === 0 && <p style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}>No discussions yet.</p>}
              {comments.map((c) => (
                <div key={c._id} style={{ padding: "0.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: "bold", color: "#fff", fontSize: "0.9rem" }}>
                      {c.user?.name || "Member"}
                    </span>
                    {isAdmin && (
                      <span onClick={() => handleDeleteComment(c._id)} style={{ color: "#ff4444", cursor: "pointer", fontSize: "0.75rem" }}>
                        Delete
                      </span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
