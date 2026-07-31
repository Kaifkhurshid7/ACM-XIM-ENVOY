import { useEffect, useRef, useState, useContext } from "react";
import {
  fetchThreads,
  fetchThread,
  createThread,
  deleteThread,
  replyToThread,
  likeThread,
  likeReply,
  moderateThread,
  removeReply,
} from "../api/forum";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray } from "../utils/api";
import { SOCKET_EVENTS, DISCUSSION_CATEGORIES } from "../constants";
import { FORUM, CONFIRMATIONS } from "../constants/copy";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { HeartIcon, MessageCircleIcon, PlusIcon, TrashIcon, XIcon } from "../components/ui/Icons";
import "../styles/forum.css";

// ─── Module-scope helpers (pure, stable across renders) ─────────────────────

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

// ─── Reply-tree helpers ─────────────────────────────────────────────────────

const findReply = (nodes, id) =>
  nodes.some((n) => n._id === id || (n.children && findReply(n.children, id)));

/** Insert a reply into the tree (dedupes by _id — the POST response and the
 *  socket echo can both deliver the same reply). */
const insertReply = (nodes, reply) => {
  if (!reply?._id) return nodes;
  if (findReply(nodes, reply._id)) return nodes;
  const node = { ...reply, children: reply.children || [] };
  if (!reply.parentReply) return [...nodes, node];
  return nodes.map((n) => {
    if (n._id === reply.parentReply) {
      return { ...n, children: insertReply(n.children || [], reply) };
    }
    const nested = insertReply(n.children || [], reply);
    return nested !== n.children ? { ...n, children: nested } : n;
  });
};

const removeReplyFromTree = (nodes, id) =>
  nodes
    .filter((n) => n._id !== id)
    .map((n) => (n.children ? { ...n, children: removeReplyFromTree(n.children, id) } : n));

const updateReplyLikes = (nodes, id, likeCount, isLiked) =>
  nodes.map((n) =>
    n._id === id
      ? { ...n, likeCount, isLiked }
      : n.children
        ? { ...n, children: updateReplyLikes(n.children, id, likeCount, isLiked) }
        : n
  );

const markReplyOfficial = (nodes, id) =>
  nodes.map((n) =>
    n._id === id
      ? { ...n, official: true }
      : n.children
        ? { ...n, children: markReplyOfficial(n.children, id) }
        : n
  );

/** Flatten a threaded tree into an indented, depth-labelled list so sibling
 *  nodes own their own margin (no margin accumulation from nesting). */
const flattenReplies = (replies, depth = 0, acc = []) => {
  replies.forEach((reply) => {
    acc.push({ ...reply, depth });
    if (reply.children && reply.children.length > 0) {
      flattenReplies(reply.children, depth + 1, acc);
    }
  });
  return acc;
};

// ─── Recursive reply card ───────────────────────────────────────────────────

const ReplyNode = ({ reply, depth, user, onReply, onLike, onMarkAnswer, onRemove }) => {
  const isAdmin = user?.role === "admin";
  const liked = !!reply.isLiked;

  return (
    <div className="reply-node" data-depth={Math.min(depth, 6)} style={{ "--reply-depth": Math.min(depth, 6) }}>
      <div className={`reply-card ${reply.official ? "official" : ""}`}>
        <div className="reply-avatar" aria-hidden="true">
          {getInitials(reply.author?.name || "U")}
        </div>
        <div className="reply-body">
          <div className="reply-meta">
            <strong>{reply.author?.name || "ACM Member"}</strong>
            {reply.author?.role === "admin" && <span className="category-pill">Admin</span>}
            {reply.official && <span className="solved-chip">✓ Accepted answer</span>}
            <span className="reply-time">{formatDate(reply.createdAt)}</span>
          </div>
          <p>{reply.text}</p>
          <div className="reply-actions">
            {user && (
              <button type="button" onClick={() => onReply(reply)}>
                Reply
              </button>
            )}
            <button
              type="button"
              className={liked ? "active" : ""}
              onClick={() => onLike(reply)}
              aria-pressed={liked}
            >
              <HeartIcon size={13} filled={liked} /> {reply.likeCount || 0}
            </button>
            {isAdmin && !reply.official && (
              <button type="button" onClick={() => onMarkAnswer(reply)}>
                Mark as answer
              </button>
            )}
            {isAdmin && (
              <button type="button" className="danger-link" onClick={() => onRemove(reply)}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Page component ─────────────────────────────────────────────────────────

const Forum = () => {
  const { user } = useContext(AuthContext);
  const isConnected = useConnectionStatus();
  const socket = useSocket();

  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null); // { discussion, replies }
  const [detailLoading, setDetailLoading] = useState(false);

  // Server-backed filters
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("trending");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // Composer + reply state
  const [showComposer, setShowComposer] = useState(false);
  const [newThread, setNewThread] = useState({
    title: "",
    description: "",
    category: "General Discussion",
    tags: "",
  });
  const [creating, setCreating] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // reply object or null (top-level)
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineCount, setOnlineCount] = useState(0);

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const replyInputRef = useRef(null);
  const typingTimer = useRef(null);
  const searchTimer = useRef(null);

  const isAdmin = user?.role === "admin";
  const activeDiscussion = selected?.discussion || null;
  const isLocked = activeDiscussion
    ? activeDiscussion.locked || activeDiscussion.status === "locked"
    : false;

  // ─── Feed loading (server-backed filters) ──────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const params = {};
    if (category && category !== "All") params.category = category;
    if (sort) params.sort = sort;
    const q = search.trim();
    if (q) params.search = q;

    fetchThreads(params)
      .then((res) => {
        if (cancelled) return;
        const data = extractArray(res.data, ["data", "threads"]);
        setThreads(data);
        setActiveId((prev) => prev ?? data[0]?._id ?? null);
      })
      .catch(() => {
        if (!cancelled) setToast({ type: "error", message: "Couldn't load discussions. Please try again." });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, sort, search]);

  // ─── Detail loading ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeId) {
      setSelected(null);
      setOnlineCount(0);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    fetchThread(activeId)
      .then(({ data }) => {
        if (cancelled) return;
        setSelected({ discussion: data.discussion, replies: data.replies || [] });
      })
      .catch(() => {
        if (!cancelled) {
          setSelected(null);
          setToast({ type: "error", message: "Couldn't load discussion. Please try again." });
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // ─── Join the socket room for the open discussion ─────────────────────
  useEffect(() => {
    if (!socket || !activeId) return;
    socket.emit("discussion:join", activeId);
    return () => {
      socket.emit("discussion:leave", activeId);
    };
  }, [socket, activeId]);

  // ─── Real-time listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const myId = user?._id || user?.id;
    const isOwnReply = (reply) =>
      !!myId && String(reply?.author?._id || reply?.author) === String(myId);

    const onNewReply = ({ discussionId, reply }) => {
      if (!discussionId || discussionId !== activeId) return;
      setSelected((prev) =>
        prev ? { ...prev, replies: insertReply(prev.replies, reply) } : prev
      );
      // The author's own POST response already bumped the count; socket echoes
      // every reply to the room, so only bump for replies from other people.
      if (!isOwnReply(reply)) {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === discussionId
              ? {
                  ...t,
                  replyCount: (t.replyCount || 0) + 1,
                  lastActivityAt: reply?.createdAt || t.lastActivityAt,
                }
              : t
          )
        );
      }
    };

    const onUpdated = (data) => {
      if (!data) return;
      // Thread deleted
      if (data.deleted && data.discussionId) {
        setThreads((prev) => prev.filter((t) => t._id !== data.discussionId));
        setActiveId((prev) => (prev === data.discussionId ? null : prev));
        return;
      }
      // Reply soft-removed
      if (data.removed && data.discussionId && data.replyId) {
        setSelected((prev) =>
          prev ? { ...prev, replies: removeReplyFromTree(prev.replies, data.replyId) } : prev
        );
        setThreads((prev) =>
          prev.map((t) =>
            t._id === data.discussionId
              ? { ...t, replyCount: Math.max(0, (t.replyCount || 0) - 1) }
              : t
          )
        );
        return;
      }
      // Reply posted elsewhere (count delta)
      if (data.discussionId && typeof data.replyCountDelta === "number") {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === data.discussionId
              ? {
                  ...t,
                  replyCount: Math.max(0, (t.replyCount || 0) + data.replyCountDelta),
                  lastActivityAt: data.lastActivityAt || t.lastActivityAt,
                }
              : t
          )
        );
        return;
      }
      // Full thread doc (moderation)
      if (data._id && data.title) {
        setThreads((prev) => prev.map((t) => (t._id === data._id ? data : t)));
        setSelected((prev) =>
          prev && prev.discussion._id === data._id ? { ...prev, discussion: data } : prev
        );
      }
    };

    const onLike = (data) => {
      if (!data?.discussionId) return;
      if (data.replyId) {
        setSelected((prev) =>
          prev && prev.discussion._id === data.discussionId
            ? {
                ...prev,
                replies: updateReplyLikes(prev.replies, data.replyId, data.likeCount, data.isLiked),
              }
            : prev
        );
      } else {
        setThreads((prev) =>
          prev.map((t) =>
            t._id === data.discussionId
              ? { ...t, likeCount: data.likeCount, isLiked: data.isLiked }
              : t
          )
        );
        setSelected((prev) =>
          prev && prev.discussion._id === data.discussionId
            ? { ...prev, discussion: { ...prev.discussion, likeCount: data.likeCount, isLiked: data.isLiked } }
            : prev
        );
      }
    };

    const onCreated = (thread) => {
      if (thread?._id) {
        setThreads((prev) => [thread, ...prev.filter((t) => t._id !== thread._id)]);
      }
    };

    const onPresence = ({ discussionId, count }) => {
      if (discussionId === activeId) setOnlineCount(count);
    };

    const onTyping = ({ discussionId, user: name }) => {
      if (discussionId !== activeId || !name) return;
      setTypingUsers((prev) => ({ ...prev, [name]: Date.now() }));
    };

    socket.on(SOCKET_EVENTS.DISCUSSION_NEW_REPLY, onNewReply);
    socket.on(SOCKET_EVENTS.DISCUSSION_UPDATED, onUpdated);
    socket.on(SOCKET_EVENTS.DISCUSSION_LIKE_UPDATE, onLike);
    socket.on(SOCKET_EVENTS.DISCUSSION_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.DISCUSSION_ONLINE_UPDATE, onPresence);
    socket.on(SOCKET_EVENTS.DISCUSSION_TYPING, onTyping);

    return () => {
      socket.off(SOCKET_EVENTS.DISCUSSION_NEW_REPLY, onNewReply);
      socket.off(SOCKET_EVENTS.DISCUSSION_UPDATED, onUpdated);
      socket.off(SOCKET_EVENTS.DISCUSSION_LIKE_UPDATE, onLike);
      socket.off(SOCKET_EVENTS.DISCUSSION_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.DISCUSSION_ONLINE_UPDATE, onPresence);
      socket.off(SOCKET_EVENTS.DISCUSSION_TYPING, onTyping);
    };
  }, [socket, activeId, user]);

  // Expire typing indicators after 3s of silence.
  useEffect(() => {
    const timer = setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now();
        const next = Object.fromEntries(Object.entries(prev).filter(([, t]) => now - t < 3000));
        return Object.keys(next).length === Object.keys(prev).length ? prev : next;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────
  const handleSelect = (id) => {
    if (id !== activeId) setActiveId(id);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(value), 400);
  };

  const autoResize = () => {
    if (replyInputRef.current) {
      replyInputRef.current.style.height = "auto";
      replyInputRef.current.style.height = `${Math.max(replyInputRef.current.scrollHeight, 80)}px`;
    }
  };

  const emitTyping = () => {
    if (!socket || !activeId || !user || typingTimer.current) return;
    socket.emit(SOCKET_EVENTS.DISCUSSION_TYPING, { discussionId: activeId, user: user.name });
    typingTimer.current = setTimeout(() => {
      typingTimer.current = null;
    }, 2000);
  };

  const handleReplyChange = (e) => {
    setReplyText(e.target.value);
    autoResize();
    emitTyping();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newThread.title.trim() || !newThread.description.trim()) {
      setToast({ type: "error", message: "Please fill in all fields." });
      return;
    }
    setCreating(true);
    try {
      const tags = newThread.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6);
      const { data } = await createThread({
        title: newThread.title,
        description: newThread.description,
        category: newThread.category,
        tags,
      });
      setThreads((prev) => [data, ...prev.filter((t) => t._id !== data._id)]);
      setActiveId(data._id);
      setNewThread({ title: "", description: "", category: "General Discussion", tags: "" });
      setShowComposer(false);
      setToast({ type: "success", message: "Discussion created." });
    } catch (err) {
      setToast({ type: "error", message: FORUM.ERROR_CREATE });
    } finally {
      setCreating(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeDiscussion || isLocked) return;
    setSending(true);
    try {
      const payload = { text: replyText };
      if (replyingTo) payload.parentReply = replyingTo._id;
      const { data } = await replyToThread(activeDiscussion._id, payload);
      setSelected((prev) => (prev ? { ...prev, replies: insertReply(prev.replies, data) } : prev));
      setThreads((prev) =>
        prev.map((t) =>
          t._id === activeDiscussion._id
            ? { ...t, replyCount: (t.replyCount || 0) + 1, lastActivityAt: data.createdAt }
            : t
        )
      );
      setReplyText("");
      setReplyingTo(null);
      if (replyInputRef.current) replyInputRef.current.style.height = "80px";
      setToast({ type: "success", message: "Reply added." });
    } catch (err) {
      setToast({ type: "error", message: FORUM.ERROR_REPLY });
    } finally {
      setSending(false);
    }
  };

  const handleLikeThread = async (thread) => {
    if (!user) {
      setToast({ type: "error", message: "Please sign in to join the discussion." });
      return;
    }
    try {
      const { data } = await likeThread(thread._id);
      setThreads((prev) =>
        prev.map((t) => (t._id === data.discussionId ? { ...t, likeCount: data.likeCount, isLiked: data.isLiked } : t))
      );
      setSelected((prev) =>
        prev && prev.discussion._id === data.discussionId
          ? { ...prev, discussion: { ...prev.discussion, likeCount: data.likeCount, isLiked: data.isLiked } }
          : prev
      );
    } catch (err) {
      setToast({ type: "error", message: "Couldn't update like. Please try again." });
    }
  };

  const handleLikeReply = async (reply) => {
    if (!user) {
      setToast({ type: "error", message: "Please sign in to join the discussion." });
      return;
    }
    try {
      const { data } = await likeReply(reply._id);
      setSelected((prev) =>
        prev && prev.discussion._id === data.discussionId
          ? { ...prev, replies: updateReplyLikes(prev.replies, data.replyId, data.likeCount, data.isLiked) }
          : prev
      );
    } catch (err) {
      setToast({ type: "error", message: "Couldn't update like. Please try again." });
    }
  };

  const handleMarkAnswer = async (reply) => {
    if (!isAdmin || !activeDiscussion) return;
    try {
      const { data } = await moderateThread(activeDiscussion._id, { solvedReply: reply._id });
      setThreads((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      setSelected((prev) =>
        prev ? { ...prev, discussion: data, replies: markReplyOfficial(prev.replies, reply._id) } : prev
      );
      setToast({ type: "success", message: "Answer accepted." });
    } catch (err) {
      setToast({ type: "error", message: "Couldn't update discussion. Please try again." });
    }
  };

  const handleModerate = async (patch) => {
    if (!isAdmin || !activeDiscussion) return;
    try {
      const { data } = await moderateThread(activeDiscussion._id, patch);
      setThreads((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      setSelected((prev) => (prev ? { ...prev, discussion: data } : prev));
      setToast({ type: "success", message: "Discussion updated." });
    } catch (err) {
      setToast({ type: "error", message: "Couldn't update discussion. Please try again." });
    }
  };

  const handleDeleteThread = (thread) => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_THREAD,
      onConfirm: async () => {
        try {
          await deleteThread(thread._id);
          setThreads((prev) => prev.filter((t) => t._id !== thread._id));
          setActiveId((prev) => (prev === thread._id ? null : prev));
          setToast({ type: "success", message: "Discussion removed." });
        } catch (err) {
          setToast({ type: "error", message: FORUM.ERROR_DELETE });
        }
      },
    });
  };

  const handleRemoveReply = (reply) => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_COMMENT,
      onConfirm: async () => {
        try {
          await removeReply(reply._id);
          setSelected((prev) =>
            prev ? { ...prev, replies: removeReplyFromTree(prev.replies, reply._id) } : prev
          );
          setToast({ type: "success", message: "Reply removed." });
        } catch (err) {
          setToast({ type: "error", message: "Couldn't remove reply. Please try again." });
        }
      },
    });
  };

  // ─── Render helpers ────────────────────────────────────────────────────
  const typingNames = Object.keys(typingUsers);
  const renderReplies = () =>
    flattenReplies(selected?.replies || []).map((reply) => (
      <ReplyNode
        key={reply._id}
        reply={reply}
        depth={reply.depth}
        user={user}
        onReply={(r) => setReplyingTo(r)}
        onLike={handleLikeReply}
        onMarkAnswer={handleMarkAnswer}
        onRemove={handleRemoveReply}
      />
    ));

  return (
    <div className="community-page">
      {/* Hero */}
      <header className="community-hero">
        <div>
          <span className="community-eyebrow">Live Community</span>
          <h1>{FORUM.HEADING}</h1>
          <p>{FORUM.SUBHEADING}</p>
        </div>
        <ConnectionBadge isConnected={isConnected} />
      </header>

      <div className="community-shell">
        {/* Sidebar: filters + composer */}
        <aside className="community-sidebar">
          <section className="filter-panel" aria-label="Filter discussions">
            <label htmlFor="forum-search">Search</label>
            <input
              id="forum-search"
              type="search"
              placeholder="Search discussions…"
              value={searchInput}
              onChange={handleSearchChange}
            />

            <label>Category</label>
            <div className="topic-list" role="group" aria-label="Categories">
              {["All", ...DISCUSSION_CATEGORIES].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </section>

          {user && (
            <section className="discussion-composer" aria-label="Create new discussion">
              <button
                type="button"
                className="composer-toggle"
                onClick={() => setShowComposer((v) => !v)}
                aria-expanded={showComposer}
              >
                {showComposer ? <XIcon size={16} /> : <PlusIcon size={16} />}
                {showComposer ? "Close composer" : FORUM.NEW_THREAD_HEADING}
              </button>
              {showComposer && (
                <form onSubmit={handleCreate} noValidate>
                  <div className="composer-grid">
                    <input
                      type="text"
                      placeholder={FORUM.PLACEHOLDER_TITLE}
                      value={newThread.title}
                      onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                      maxLength={200}
                      required
                      aria-label="Discussion title"
                    />
                    <select
                      value={newThread.category}
                      onChange={(e) => setNewThread({ ...newThread, category: e.target.value })}
                      aria-label="Category"
                    >
                      {DISCUSSION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    placeholder={FORUM.PLACEHOLDER_DESCRIPTION}
                    value={newThread.description}
                    onChange={(e) => setNewThread({ ...newThread, description: e.target.value })}
                    maxLength={10000}
                    required
                    aria-label="Description"
                  />
                  <div className="composer-actions">
                    <input
                      type="text"
                      placeholder="Tags (comma-separated)"
                      value={newThread.tags}
                      onChange={(e) => setNewThread({ ...newThread, tags: e.target.value })}
                      aria-label="Tags"
                    />
                    <button
                      type="submit"
                      disabled={creating || !newThread.title.trim() || !newThread.description.trim()}
                    >
                      {creating ? "Creating…" : FORUM.BUTTON_CREATE}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}
        </aside>

        {/* Feed */}
        <section className="discussion-feed" aria-label="Discussion threads">
          <div className="feed-toolbar">
            <div className="segmented-control" role="group" aria-label="Sort discussions">
              {[
                { key: "trending", label: "Trending" },
                { key: "latest", label: "Latest" },
                { key: "active", label: "Active" },
                { key: "unanswered", label: "Unanswered" },
                { key: "solved", label: "Solved" },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={sort === s.key ? "active" : ""}
                  onClick={() => setSort(s.key)}
                  aria-pressed={sort === s.key}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {!isLoading && threads.length > 0 && (
              <span className="feed-count">
                {threads.length} {threads.length === 1 ? "discussion" : "discussions"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="feed-list" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div className="discussion-card skeleton-card" key={i}>
                  <div className="vote-rail">
                    <span className="skeleton skeleton-block" style={{ width: 34, height: 30 }} />
                    <span className="skeleton skeleton-line" style={{ width: 22 }} />
                  </div>
                  <div className="discussion-main">
                    <span className="skeleton skeleton-line" style={{ width: "38%", height: 10 }} />
                    <span className="skeleton skeleton-line" style={{ width: "80%", height: 16, marginTop: 10 }} />
                    <span className="skeleton skeleton-line" style={{ width: "56%", marginTop: 9 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="forum-empty">
              <MessageCircleIcon size={40} />
              <p>{FORUM.EMPTY}</p>
            </div>
          ) : (
            <div className="feed-list">
              {threads.map((thread) => (
                <article
                  key={thread._id}
                  className={`discussion-card ${activeId === thread._id ? "selected" : ""}`}
                  onClick={() => handleSelect(thread._id)}
                >
                  <div className="vote-rail">
                    <button
                      type="button"
                      className={thread.isLiked ? "active" : ""}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLikeThread(thread);
                      }}
                      aria-pressed={!!thread.isLiked}
                      aria-label="Like discussion"
                    >
                      <HeartIcon size={16} filled={!!thread.isLiked} />
                    </button>
                    <span className="vote-count">{thread.likeCount || 0}</span>
                  </div>

                  <div className="discussion-main">
                    <div className="discussion-kicker">
                      {thread.category} · {thread.replyCount || 0} replies · {formatDate(thread.createdAt)}
                    </div>
                    <button type="button" className="discussion-select" onClick={() => handleSelect(thread._id)}>
                      <h3>{thread.title}</h3>
                    </button>
                    <p>{thread.description}</p>
                    {thread.tags && thread.tags.length > 0 && (
                      <div className="tag-row">
                        {thread.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="discussion-footer">
                      <span className="avatar">{getInitials(thread.author?.name)}</span>
                      <span>{thread.author?.name || "ACM Member"}</span>
                      {thread.pinned && <span className="pin-badge">Pinned</span>}
                      {thread.announcement && <span className="announcement-badge">Announcement</span>}
                      {thread.status === "resolved" && <span className="resolved">Resolved</span>}
                      {thread.status === "locked" && <span className="locked">Locked</span>}
                      {!thread.replyCount && <span className="category-pill">Unanswered</span>}
                      {isAdmin && (
                        <button
                          type="button"
                          className="danger-link"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteThread(thread);
                          }}
                          aria-label={`Delete ${thread.title}`}
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Thread detail */}
        <section className="thread-panel" aria-label="Discussion details">
          {!activeDiscussion ? (
            <div className="empty-thread-panel">
              <MessageCircleIcon size={48} />
              <p>Select a discussion to view details and replies.</p>
            </div>
          ) : (
            <>
              <header className="thread-panel-header">
                <div className="thread-title-row">
                  <h2>{activeDiscussion.title}</h2>
                  {onlineCount > 0 && (
                    <span className="online-badge" title="People viewing this discussion">
                      {onlineCount} viewing
                    </span>
                  )}
                </div>

                <div className="thread-meta-badges">
                  {activeDiscussion.category && (
                    <span className="category-pill">{activeDiscussion.category}</span>
                  )}
                  {activeDiscussion.pinned && <span className="pin-badge">Pinned</span>}
                  {activeDiscussion.announcement && <span className="announcement-badge">Announcement</span>}
                  {activeDiscussion.status === "resolved" && <span className="resolved">Resolved</span>}
                  {isLocked && <span className="locked">Locked</span>}
                </div>

                <p>{activeDiscussion.description}</p>

                <div className="thread-author">
                  <span className="avatar">{getInitials(activeDiscussion.author?.name)}</span>
                  <span>
                    <strong>{activeDiscussion.author?.name || "ACM Member"}</strong>
                    {activeDiscussion.author?.role === "admin" && <span className="category-pill">Admin</span>}
                    {" · "}asked {formatDate(activeDiscussion.createdAt)}
                    {activeDiscussion.views > 0 && ` · ${activeDiscussion.views} views`}
                  </span>
                </div>

                <div className="thread-actions">
                  <button
                    type="button"
                    className={activeDiscussion.isLiked ? "active" : ""}
                    onClick={() => handleLikeThread(activeDiscussion)}
                    aria-pressed={!!activeDiscussion.isLiked}
                  >
                    <HeartIcon size={15} filled={!!activeDiscussion.isLiked} />
                    {activeDiscussion.likeCount || 0}
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="danger-link"
                      onClick={() => handleDeleteThread(activeDiscussion)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div className="moderation-bar">
                    <button type="button" onClick={() => handleModerate({ pinned: !activeDiscussion.pinned })}>
                      {activeDiscussion.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleModerate({ locked: !isLocked, status: isLocked ? "open" : "locked" })
                      }
                    >
                      {isLocked ? "Unlock" : "Lock"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleModerate({
                          status: activeDiscussion.status === "resolved" ? "open" : "resolved",
                        })
                      }
                    >
                      {activeDiscussion.status === "resolved" ? "Reopen" : "Mark resolved"}
                    </button>
                  </div>
                )}
              </header>

              {detailLoading ? (
                <div className="detail-skeleton" aria-hidden="true">
                  <span className="skeleton skeleton-line" style={{ width: "46%", height: 22 }} />
                  <span className="skeleton skeleton-line" style={{ width: "100%", marginTop: 14 }} />
                  <span className="skeleton skeleton-line" style={{ width: "82%", marginTop: 8 }} />
                  <span className="skeleton skeleton-line" style={{ width: "30%", marginTop: 14 }} />
                  <span className="skeleton skeleton-line" style={{ width: "100%", marginTop: 24 }} />
                  <span className="skeleton skeleton-line" style={{ width: "94%", marginTop: 8 }} />
                  <span className="skeleton skeleton-line" style={{ width: "70%", marginTop: 8 }} />
                </div>
              ) : (
                <>
                  <div className="reply-thread">
                    {renderReplies()}
                    {!selected?.replies?.length && (
                      <div className="no-replies">
                        <MessageCircleIcon size={32} />
                        <p>{FORUM.REPLIES_NONE}</p>
                      </div>
                    )}
                  </div>

                  {isLocked ? (
                    <div className="locked-note">This discussion is locked and no longer accepts replies.</div>
                  ) : user ? (
                    <form className="reply-composer" onSubmit={handleReplySubmit}>
                      {replyingTo && (
                        <div className="reply-context">
                          <span>
                            Replying to <strong>{replyingTo.author?.name || "ACM Member"}</strong>
                          </span>
                          <button type="button" onClick={() => setReplyingTo(null)}>
                            Cancel
                          </button>
                        </div>
                      )}
                      <textarea
                        ref={replyInputRef}
                        rows={3}
                        value={replyText}
                        onChange={handleReplyChange}
                        placeholder={FORUM.PLACEHOLDER_REPLY}
                        maxLength={4000}
                        aria-label="Your reply"
                      />
                      {typingNames.length > 0 && (
                        <div className="typing-indicator">
                          {typingNames.join(", ")} {typingNames.length === 1 ? "is" : "are"} typing…
                        </div>
                      )}
                      <div className="composer-actions">
                        <span className="char-count">{replyText.length}/4000</span>
                        <button type="submit" disabled={sending || !replyText.trim()}>
                          {sending ? "Sending…" : "Post Reply"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="login-prompt">
                      <p>Please sign in to join the discussion.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </section>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default Forum;
