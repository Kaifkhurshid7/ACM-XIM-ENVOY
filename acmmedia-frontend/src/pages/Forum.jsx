import { useEffect, useState, useContext } from "react";
import { fetchThreads, createThread, deleteThread, replyToThread } from "../api/forum";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray } from "../utils/api";
import { SOCKET_EVENTS } from "../constants";
import { FORUM, CONFIRMATIONS } from "../constants/copy";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { MessageCircleIcon, TrashIcon, SendIcon } from "../components/ui/Icons";

const Forum = () => {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: "", description: "" });
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
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
      setToast({ type: "success", message: "Discussion created." });
    } catch (err) {
      setToast({ type: "error", message: FORUM.ERROR_CREATE });
    }
  };

  const handleDelete = (id) => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_THREAD,
      onConfirm: async () => {
        try {
          await deleteThread(id);
          setThreads(threads.filter((t) => t._id !== id));
          setToast({ type: "success", message: "Discussion removed." });
        } catch (err) {
          setToast({ type: "error", message: FORUM.ERROR_DELETE });
        }
      },
    });
  };

  const handleReply = async (threadId, text) => {
    try {
      const { data } = await replyToThread(threadId, { text });
      setThreads(threads.map((thread) => (thread._id === threadId ? data : thread)));
    } catch (err) {
      setToast({ type: "error", message: FORUM.ERROR_REPLY });
    }
  };

  return (
    <div className="forum-page">
      <header className="forum-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <h2 style={{ margin: 0 }}>{FORUM.HEADING}</h2>
          <ConnectionBadge isConnected={isConnected} />
        </div>
        <p>{FORUM.SUBHEADING}</p>
      </header>

      {user && (
        <section className="forum-form" aria-label="Create new discussion">
          <h3>{FORUM.NEW_THREAD_HEADING}</h3>
          <form onSubmit={handleCreate} noValidate>
            <label htmlFor="thread-title" className="sr-only">{FORUM.LABEL_TITLE}</label>
            <input
              id="thread-title"
              type="text"
              placeholder={FORUM.PLACEHOLDER_TITLE}
              value={newThread.title}
              onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
              required
              aria-required="true"
            />
            <label htmlFor="thread-desc" className="sr-only">{FORUM.LABEL_DESCRIPTION}</label>
            <textarea
              id="thread-desc"
              placeholder={FORUM.PLACEHOLDER_DESCRIPTION}
              value={newThread.description}
              onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
              required
              aria-required="true"
            />
            <button type="submit">
              <SendIcon size={14} /> {FORUM.BUTTON_CREATE}
            </button>
          </form>
        </section>
      )}

      <section className="threads-list" aria-label="Discussion threads">
        {threads.length === 0 ? (
          <div className="forum-empty" role="status">
            <MessageCircleIcon size={32} />
            <p>{FORUM.EMPTY}</p>
          </div>
        ) : (
          threads.map((t) => (
            <article key={t._id} className="thread-card" aria-label={`Discussion: ${t.title}`}>
              <div className="thread-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>{t.title}</h3>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(t._id)}
                    aria-label={`Delete discussion: ${t.title}`}
                    style={{ background: "var(--color-danger)", color: "white", border: "none", padding: "4px 10px", borderRadius: "var(--radius-sm)", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <TrashIcon size={12} /> Remove
                  </button>
                )}
              </div>
              <p className="thread-description">{t.description}</p>
              <div className="replies-section">
                <h4>{FORUM.LABEL_REPLIES} ({t.replies?.length || 0})</h4>
                {(!t.replies || t.replies.length === 0) && (
                  <p className="no-replies">{FORUM.REPLIES_NONE}</p>
                )}
                {t.replies?.map((r, i) => <div key={i} className="reply">{r.text}</div>)}
                {user && (
                  <div className="reply-input">
                    <label htmlFor={`reply-${t._id}`} className="sr-only">Reply to this discussion</label>
                    <input
                      id={`reply-${t._id}`}
                      type="text"
                      placeholder={FORUM.PLACEHOLDER_REPLY}
                      aria-label="Write a reply"
                      onKeyDown={async (e) => {
                        if (e.key === "Enter" && e.target.value.trim()) {
                          await handleReply(t._id, e.target.value);
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

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default Forum;
