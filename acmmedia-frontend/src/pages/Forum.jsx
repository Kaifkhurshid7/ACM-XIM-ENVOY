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

  useEffect(() => {
    fetchThreads()
      .then((res) => setThreads(extractArray(res.data, ["data", "threads"])))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNewReply = (data) => {
      setThreads((prev) => prev.map((t) => t._id === data.threadId ? { ...t, replies: data.replies } : t));
    };
    socket.on(SOCKET_EVENTS.FORUM_NEW_REPLY, onNewReply);
    return () => socket.off(SOCKET_EVENTS.FORUM_NEW_REPLY, onNewReply);
  }, [socket]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createThread(newThread);
      setThreads([data, ...threads]);
      setNewThread({ title: "", description: "" });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this thread permanently? This cannot be undone.")) return;
    try { await deleteThread(id); setThreads(threads.filter((t) => t._id !== id)); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="forum-page">
      <header className="forum-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <h2 style={{ margin: 0 }}>Discussions</h2>
          <ConnectionBadge isConnected={isConnected} />
        </div>
        <p>Ask questions, share insights, and collaborate with fellow chapter members.</p>
      </header>

      {user && (
        <section className="forum-form">
          <h3>Start a discussion</h3>
          <form onSubmit={handleCreate}>
            <input type="text" placeholder="Discussion title" value={newThread.title} onChange={(e) => setNewThread({ ...newThread, title: e.target.value })} required />
            <textarea placeholder="Share context, details, or your question..." value={newThread.description} onChange={(e) => setNewThread({ ...newThread, description: e.target.value })} required />
            <button type="submit">Post discussion</button>
          </form>
        </section>
      )}

      <section className="threads-list">
        {threads.length === 0 ? (
          <p className="forum-empty">No discussions yet. Be the first to start a conversation.</p>
        ) : (
          threads.map((t) => (
            <article key={t._id} className="thread-card">
              <div className="thread-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>{t.title}</h3>
                {user?.role === "admin" && (
                  <button onClick={() => handleDelete(t._id)} style={{ background: "var(--color-danger)", color: "white", border: "none", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "12px", cursor: "pointer" }}>Delete</button>
                )}
              </div>
              <p className="thread-description">{t.description}</p>
              <div className="replies-section">
                <h4>Replies ({t.replies?.length || 0})</h4>
                {(!t.replies || t.replies.length === 0) && <p className="no-replies">No replies yet. Be the first to respond.</p>}
                {t.replies?.map((r, i) => <div key={i} className="reply">{r.text}</div>)}
                {user && (
                  <div className="reply-input">
                    <input
                      type="text"
                      placeholder="Write a reply and press Enter..."
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
