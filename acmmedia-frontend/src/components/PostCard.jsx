/**
 * PostCard Component
 * 
 * Renders a single post/announcement card with interactive features.
 * Supports real-time like updates via Socket.IO subscription.
 * 
 * @component
 * @param {object} post - Post data object from API
 * @param {function} onDelete - Callback when post is deleted
 */

import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { likePost, deletePost } from "../api/posts";
import { fetchComments, addComment, deleteComment } from "../api/comments";
import CommentBox from "./CommentBox";
import { useSocket } from "../context/SocketContext";
import { extractArray, extractObject } from "../utils/api";
import { SOCKET_EVENTS } from "../constants";
import { POSTS, CONFIRMATIONS } from "../constants/copy";
import Toast from "./Toast";
import ConfirmDialog from "./ConfirmDialog";
import { HeartIcon, CommentIcon, TrashIcon } from "./ui/Icons";

const PostCard = ({ post, onDelete }) => {
  const { user } = useContext(AuthContext);
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const socket = useSocket();

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

  const handleLike = async () => {
    if (!user) {
      setToast({ type: "info", message: POSTS.PROMPT_LOGIN });
      return;
    }
    try {
      const { data } = await likePost(post._id);
      setLikes(extractArray(data, ["likes", "data"]));
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleDeleteComment = (commentId) => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_COMMENT,
      onConfirm: async () => {
        try {
          await deleteComment(commentId);
          setComments(comments.filter((c) => c._id !== commentId));
        } catch (err) {
          setToast({ type: "error", message: POSTS.ERROR_DELETE_COMMENT });
        }
      },
    });
  };

  const handleDeletePost = () => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_POST,
      onConfirm: async () => {
        try {
          await deletePost(post._id);
          if (onDelete) onDelete(post._id);
        } catch (err) {
          setToast({ type: "error", message: POSTS.ERROR_DELETE });
        }
      },
    });
  };

  return (
    <article className="post-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }} aria-label={`Post: ${post.title}`}>
      <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "0.8rem" }}>{post.title}</h3>
      <p style={{ lineHeight: "1.7", opacity: 0.9 }}>{post.content}</p>

      {/* Action Bar */}
      <div className="post-actions" style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.2rem" }}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={handleLike}
            aria-label={isLiked ? `Unlike post (${likes.length} likes)` : `Like post (${likes.length} likes)`}
            aria-pressed={isLiked}
            style={{
              padding: "0.6rem 1.2rem", borderRadius: "8px", border: "none", cursor: "pointer",
              background: isLiked ? "#ffffff" : "rgba(255,255,255,0.1)",
              color: isLiked ? "#000000" : "#ffffff",
              fontWeight: "600", transition: "0.3s",
              opacity: !user ? 0.6 : 1,
              display: "flex", alignItems: "center", gap: "0.4rem",
            }}
          >
            <HeartIcon size={16} filled={isLiked} /> {likes.length}
          </button>
          <button
            onClick={toggleComments}
            aria-label={`${showComments ? "Hide" : "Show"} comments`}
            aria-expanded={showComments}
            style={{ padding: "0.6rem 1.2rem", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <CommentIcon size={16} /> {POSTS.BUTTON_COMMENTS}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <time style={{ opacity: 0.5, fontSize: "0.85rem" }} dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString()}
          </time>
          {isAdmin && (
            <button
              onClick={handleDeletePost}
              aria-label={`Delete post: ${post.title}`}
              style={{ background: "#dc2626", color: "white", border: "none", padding: "0.4rem 0.8rem", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <TrashIcon size={12} /> {POSTS.BUTTON_DELETE}
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section" style={{ marginTop: "1.5rem", background: "rgba(0,0,0,0.2)", padding: "1.2rem", borderRadius: "10px" }} aria-label="Comments section">
          {user ? (
            <CommentBox onAdd={handleAddComment} />
          ) : (
            <div style={{ padding: "1rem", textAlign: "center", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "8px", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", marginBottom: "1rem" }} role="note">
              {POSTS.COMMENTS_LOGIN_PROMPT}
            </div>
          )}

          {loadingComments ? (
            <p style={{ textAlign: "center", color: "#aaa" }} role="status" aria-live="polite">{POSTS.COMMENTS_LOADING}</p>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              {comments.length === 0 && <p style={{ color: "#666", fontStyle: "italic", textAlign: "center" }}>{POSTS.COMMENTS_EMPTY}</p>}
              {comments.map((c) => (
                <div key={c._id} style={{ padding: "0.8rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.2rem" }}>
                    <span style={{ fontWeight: "bold", color: "#fff", fontSize: "0.9rem" }}>
                      {c.user?.name || "Member"}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        aria-label={`Remove comment by ${c.user?.name || "member"}`}
                        style={{ color: "#ff4444", cursor: "pointer", fontSize: "0.75rem", background: "none", border: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <TrashIcon size={11} /> Remove
                      </button>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: "0.95rem", opacity: 0.8 }}>{c.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </article>
  );
};

export default PostCard;
