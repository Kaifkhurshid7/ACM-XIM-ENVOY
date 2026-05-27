/**
 * Forum Page
 * 
 * Community discussion forum with threaded conversations.
 * Supports real-time reply updates via Socket.IO.
 * 
 * Features:
 * - View all discussion threads
 * - Create new threads (authenticated users)
 * - Reply to threads with Enter key (authenticated users)
 * - Delete threads (admin only)
 * - Live reply updates without page refresh
 * 
 * @page
 */

import React, { useEffect, useState, useContext } from "react";
import { fetchThreads, createThread, deleteThread, replyToThread } from "../api/forum";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray } from "../utils/api";
import { SOCKET_EVENTS } from "../constants";

const Forum = () => {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", description: "" });
  const { user } = useContext(AuthContext);
  const isConnected = useConnectionStatus();
  const socket = useSocket();

  // Fetch all threads on mount
  useEffect(() => {
    fetchThreads()
      .then((res) => setThreads(extractArray(res.data, ["data", "threads"])))
      .catch((err) => console.error("Forum fetch failed:", err));
  }, []);

  // Subscribe to real-time reply events
  useEffect(() => {
    if (!socket) return;

    const onNewReply = (data) => {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread._id === data.threadId
            ? { ...thread, replies: data.replies }
            : thread
        )
      );
    };

    socket.on(SOCKET_EVENTS.FORUM_NEW_REPLY, onNewReply);
    return () => socket.off(SOCKET_EVENTS.FORUM_NEW_REPLY, onNewReply);
  }, [socket]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createThread(newThread);
      setThreads([data, ...threads]);
      setNewThread({ title: "", description: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteThread = async (id) => {
    if (!window.confirm("Delete this thread?")) return;
    try {
      await deleteThread(id);
      setThreads(threads.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="forum-page">
      {/* Header */}
      <header className="forum-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.6rem" }}>
          <h2 style={{ margin: 0 }}>Community Discussions</h2>
          <ConnectionBadge isConnected={isConnected} />
        </div>
        <p>
          A collaborative space for academic, technical, and platform-related
          discussions. Share insights, ask questions, and collaborate professionally.
        </p>
      </header>

      {/* New Thread Form - Only visible to authenticated users */}
      {user && (
        <section className="forum-form">
          <h3>Start a New Discussion</h3>
          <form onSubmit={handleCreateThread}>
            <input
              type="text"
              placeholder="Discussion title"
              value={newThread.title}
              onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Provide context, details, or your question"
              value={newThread.description}
              onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
              required
            />
            <button type="submit">Publish Discussion</button>
          </form>
        </section>
      )}

      {/* Thread List */}
      <section className="threads-list">
        {threads.length === 0 ? (
          <p className="forum-empty">No discussions available. Start the first discussion.</p>
        ) : (
          threads.map((t) => (
            <article key={t._id} className="thread-card">
              <div className="thread-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>{t.title}</h3>
                {user && user.role === "admin" && (
                  <button
                    onClick={() => handleDeleteThread(t._id)}
                    style={{ background: "#ff4444", color: "white", border: "none", padding: "0.3rem 0.8rem", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    Remove Resource
                  </button>
                )}
              </div>

              <p className="thread-description">{t.description}</p>

              <div className="replies-section">
                <h4>Replies</h4>
                {t.replies.length === 0 && <p className="no-replies">No replies yet.</p>}
                {t.replies.map((r, i) => (
                  <div key={i} className="reply">{r.text}</div>
                ))}

                {/* Reply input - authenticated users only */}
                {user && (
                  <div className="reply-input">
                    <input
                      type="text"
                      placeholder="Compose reply and press Enter"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          const { data } = await replyToThread(t._id, { text: e.target.value });
                          setThreads(threads.map((thread) => (thread._id === t._id ? data : thread)));
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
};

export default Forum;
