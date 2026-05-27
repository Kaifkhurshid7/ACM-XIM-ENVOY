/**
 * Community Hub
 *
 * A real-time discussion surface inspired by Discord rooms, Reddit threads,
 * and StackOverflow resolution workflows. The page keeps feed state light and
 * loads one active conversation's reply tree at a time to avoid rendering large
 * nested discussions unnecessarily.
 *
 * @page
 */

import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createThread,
  deleteThread,
  fetchCommunityMeta,
  fetchThread,
  fetchThreads,
  likeReply,
  likeThread,
  moderateThread,
  replyToThread,
} from "../api/forum";
import { AuthContext } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import ConnectionBadge from "../components/ui/ConnectionBadge";
import { useConnectionStatus } from "../hooks/useConnectionStatus";
import { extractArray } from "../utils/api";
import { DISCUSSION_CATEGORIES, SOCKET_EVENTS } from "../constants";

const sorts = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "active", label: "Most Active" },
  { value: "unanswered", label: "Unanswered" },
  { value: "solved", label: "Solved" },
];

const initialDraft = {
  title: "",
  content: "",
  category: "General Discussion",
  tags: "",
};

const timeAgo = (date) => {
  if (!date) return "just now";
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const initials = (name = "ACM") =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const getAuthor = (item) => item?.author || item?.authorSnapshot || {};

const highlightMentions = (text = "") =>
  text.split(/(@[a-zA-Z0-9._-]{2,40})/g).map((part, index) =>
    part.startsWith("@") ? (
      <mark className="mention" key={`${part}-${index}`}>
        {part}
      </mark>
    ) : (
      part
    )
  );

const insertReply = (nodes, reply) => {
  if (nodes.some((node) => String(node._id) === String(reply._id))) return nodes;
  if (!reply.parentReply) return [...nodes, { ...reply, children: [] }];

  return nodes.map((node) => {
    if (String(node._id) === String(reply.parentReply)) {
      return { ...node, children: [...(node.children || []), { ...reply, children: [] }] };
    }
    return { ...node, children: insertReply(node.children || [], reply) };
  });
};

const updateReplyLike = (nodes, payload) =>
  nodes.map((node) => {
    if (String(node._id) === String(payload.replyId)) {
      return { ...node, likeCount: payload.likeCount, isLiked: payload.isLiked };
    }
    return { ...node, children: updateReplyLike(node.children || [], payload) };
  });

const ReplyComposer = ({ placeholder, onSubmit, compact = false, onTyping }) => {
  const [value, setValue] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    await onSubmit(value.trim());
    setValue("");
  };

  return (
    <form className={`reply-composer ${compact ? "compact" : ""}`} onSubmit={submit}>
      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          onTyping?.();
        }}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
      />
      <button type="submit">Reply</button>
    </form>
  );
};

const ReplyNode = ({ reply, depth = 0, user, onReply, onLike, onSolve }) => {
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const author = getAuthor(reply);
  const visualDepth = Math.min(depth, 4);

  return (
    <div className="reply-node" style={{ "--reply-depth": visualDepth }}>
      <div className="reply-card">
        <div className="reply-avatar">{initials(author.name)}</div>
        <div className="reply-body">
          <div className="reply-meta">
            <strong>{author.name || "ACM Member"}</strong>
            <span>{author.role || "member"}</span>
            <span>{timeAgo(reply.createdAt)}</span>
            {reply.official && <span className="solved-chip">Official answer</span>}
          </div>
          <p>{highlightMentions(reply.content || reply.text)}</p>
          <div className="reply-actions">
            <button onClick={() => onLike(reply._id)} className={reply.isLiked ? "active" : ""}>
              Upvote {reply.likeCount || 0}
            </button>
            {user && <button onClick={() => setReplying((value) => !value)}>Reply</button>}
            {user?.role === "admin" && <button onClick={() => onSolve(reply._id)}>Mark official</button>}
            {(reply.children || []).length > 0 && (
              <button onClick={() => setCollapsed((value) => !value)}>
                {collapsed ? "Expand" : "Collapse"} {(reply.children || []).length}
              </button>
            )}
          </div>
          {replying && (
            <ReplyComposer
              compact
              placeholder={`Reply to ${author.name || "this answer"} with @mentions or context`}
              onSubmit={async (content) => {
                await onReply(content, reply._id);
                setReplying(false);
              }}
            />
          )}
        </div>
      </div>
      {!collapsed && (reply.children || []).map((child) => (
        <ReplyNode
          key={child._id}
          reply={child}
          depth={depth + 1}
          user={user}
          onReply={onReply}
          onLike={onLike}
          onSolve={onSolve}
        />
      ))}
    </div>
  );
};

const DiscussionCard = ({ thread, selected, onOpen, onLike, onDelete, user }) => {
  const author = getAuthor(thread);
  return (
    <article className={`discussion-card ${selected ? "selected" : ""}`} onClick={() => onOpen(thread._id)}>
      <div className="vote-rail">
        <button
          className={thread.isLiked ? "active" : ""}
          onClick={(event) => {
            event.stopPropagation();
            onLike(thread._id);
          }}
        >
          Up
        </button>
        <strong>{thread.likeCount || 0}</strong>
      </div>
      <div className="discussion-main">
        <div className="discussion-kicker">
          {thread.pinned && <span className="pin-badge">Pinned</span>}
          {thread.announcement && <span className="announcement-badge">Announcement</span>}
          <span>{thread.category}</span>
          <span>{timeAgo(thread.lastActivityAt || thread.createdAt)}</span>
        </div>
        <h3>{thread.title}</h3>
        <p>{thread.content || thread.description}</p>
        <div className="tag-row">
          {(thread.tags || []).map((tag) => <span key={tag}>#{tag}</span>)}
        </div>
        <div className="discussion-footer">
          <span className="avatar">{initials(author.name)}</span>
          <span>{author.name || "ACM Member"}</span>
          <span>{thread.replyCount || 0} replies</span>
          <span>{thread.views || 0} views</span>
          {thread.status === "resolved" && <span className="resolved">Resolved</span>}
          {thread.locked && <span className="locked">Locked</span>}
          {user?.role === "admin" && (
            <button
              className="danger-link"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(thread._id);
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const Forum = () => {
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [draft, setDraft] = useState(initialDraft);
  const [filters, setFilters] = useState({ sort: "trending", category: "All", search: "" });
  const [meta, setMeta] = useState({ categories: DISCUSSION_CATEGORIES, stats: {}, topContributors: [] });
  const [loading, setLoading] = useState(true);
  const [typingUser, setTypingUser] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const { user } = useContext(AuthContext);
  const socket = useSocket();
  const isConnected = useConnectionStatus();

  const query = useMemo(() => ({
    sort: filters.sort,
    category: filters.category === "All" ? undefined : filters.category,
    search: filters.search || undefined,
    limit: 20,
  }), [filters]);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchThreads(query);
      const list = extractArray(data, ["data", "threads"]);
      setThreads(list);
      setMeta((current) => ({
        ...current,
        categories: data.meta?.categories || current.categories,
        topContributors: data.meta?.topContributors || current.topContributors,
      }));
      if (!activeId && list[0]) setActiveId(list[0]._id);
    } finally {
      setLoading(false);
    }
  }, [activeId, query]);

  useEffect(() => {
    loadThreads().catch((err) => console.error("Discussion fetch failed:", err));
  }, [loadThreads]);

  useEffect(() => {
    fetchCommunityMeta()
      .then(({ data }) => setMeta((current) => ({ ...current, ...data })))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetchThread(activeId)
      .then(({ data }) => {
        setActiveThread(data.discussion);
        setReplies(data.replies || []);
      })
      .catch((err) => console.error("Discussion detail fetch failed:", err));
  }, [activeId]);

  useEffect(() => {
    if (!socket) return;

    const onCreated = (thread) => setThreads((current) =>
      current.some((item) => String(item._id) === String(thread._id)) ? current : [thread, ...current]
    );
    const onNewReply = ({ discussionId, reply }) => {
      setThreads((current) =>
        current.map((thread) =>
          String(thread._id) === String(discussionId)
            ? { ...thread, replyCount: (thread.replyCount || 0) + 1, lastActivityAt: new Date().toISOString() }
            : thread
        )
      );
      if (String(discussionId) === String(activeId)) {
        setReplies((current) => insertReply(current, reply));
      }
    };
    const onLike = ({ discussionId, likeCount, isLiked }) => {
      setThreads((current) => current.map((thread) =>
        String(thread._id) === String(discussionId) ? { ...thread, likeCount, isLiked } : thread
      ));
      setActiveThread((current) =>
        current && String(current._id) === String(discussionId) ? { ...current, likeCount, isLiked } : current
      );
    };
    const onReplyLike = (payload) => {
      if (String(payload.discussionId) === String(activeId)) {
        setReplies((current) => updateReplyLike(current, payload));
      }
    };
    const onPresence = ({ discussionId, count }) => {
      if (String(discussionId) === String(activeId)) setOnlineCount(count);
    };
    const onTyping = ({ discussionId, user: typing }) => {
      if (String(discussionId) !== String(activeId)) return;
      setTypingUser(typing?.name || "Someone");
      window.clearTimeout(window.__communityTypingTimer);
      window.__communityTypingTimer = window.setTimeout(() => setTypingUser(""), 1400);
    };
    const onUpdated = (payload) => {
      if (payload.deleted) {
        setThreads((current) => current.filter((thread) => String(thread._id) !== String(payload.discussionId)));
        return;
      }
      setThreads((current) => current.map((thread) =>
        String(thread._id) === String(payload._id || payload.discussionId) ? { ...thread, ...payload } : thread
      ));
      if (String(payload._id || payload.discussionId) === String(activeId)) {
        setActiveThread((current) => ({ ...current, ...payload }));
      }
    };

    socket.on(SOCKET_EVENTS.DISCUSSION_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.DISCUSSION_NEW_REPLY, onNewReply);
    socket.on(SOCKET_EVENTS.DISCUSSION_LIKE_UPDATE, onLike);
    socket.on(SOCKET_EVENTS.DISCUSSION_REPLY_LIKE_UPDATE, onReplyLike);
    socket.on(SOCKET_EVENTS.DISCUSSION_ONLINE_UPDATE, onPresence);
    socket.on(SOCKET_EVENTS.DISCUSSION_TYPING, onTyping);
    socket.on(SOCKET_EVENTS.DISCUSSION_UPDATED, onUpdated);

    return () => {
      socket.off(SOCKET_EVENTS.DISCUSSION_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.DISCUSSION_NEW_REPLY, onNewReply);
      socket.off(SOCKET_EVENTS.DISCUSSION_LIKE_UPDATE, onLike);
      socket.off(SOCKET_EVENTS.DISCUSSION_REPLY_LIKE_UPDATE, onReplyLike);
      socket.off(SOCKET_EVENTS.DISCUSSION_ONLINE_UPDATE, onPresence);
      socket.off(SOCKET_EVENTS.DISCUSSION_TYPING, onTyping);
      socket.off(SOCKET_EVENTS.DISCUSSION_UPDATED, onUpdated);
    };
  }, [activeId, socket]);

  useEffect(() => {
    if (!socket || !activeId) return;
    socket.emit("discussion:join", activeId);
    return () => socket.emit("discussion:leave", activeId);
  }, [activeId, socket]);

  const handleCreateThread = async (event) => {
    event.preventDefault();
    const payload = {
      ...draft,
      description: draft.content,
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };
    const { data } = await createThread(payload);
    setThreads((current) => [data, ...current]);
    setActiveId(data._id);
    setDraft(initialDraft);
  };

  const handleReply = async (content, parentReply = null) => {
    if (!activeId) return;
    const { data } = await replyToThread(activeId, { content, parentReply });
    setReplies((current) => insertReply(current, data));
    setThreads((current) => current.map((thread) =>
      String(thread._id) === String(activeId) ? { ...thread, replyCount: (thread.replyCount || 0) + 1 } : thread
    ));
  };

  const handleThreadLike = async (id) => {
    const { data } = await likeThread(id);
    setThreads((current) => current.map((thread) =>
      String(thread._id) === String(id) ? { ...thread, likeCount: data.likeCount, isLiked: data.isLiked } : thread
    ));
  };

  const handleReplyLike = async (replyId) => {
    const { data } = await likeReply(replyId);
    setReplies((current) => updateReplyLike(current, data));
  };

  const handleModeration = async (patch) => {
    if (!activeId) return;
    const { data } = await moderateThread(activeId, patch);
    setActiveThread(data);
    setThreads((current) => current.map((thread) => String(thread._id) === String(activeId) ? data : thread));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this discussion and all replies?")) return;
    await deleteThread(id);
    setThreads((current) => current.filter((thread) => thread._id !== id));
    if (activeId === id) setActiveId(null);
  };

  const activeAuthor = getAuthor(activeThread);

  return (
    <main className="community-page">
      <section className="community-hero">
        <div>
          <div className="community-eyebrow">
            <span>ACM Connect</span>
            <ConnectionBadge isConnected={isConnected} />
          </div>
          <h1>Community Hub</h1>
          <p>Ask doubts, solve problems, raise concerns, and keep ACM-XIM discussions moving in real time.</p>
        </div>
        <div className="community-stats">
          <span><strong>{meta.stats?.discussions || 0}</strong> discussions</span>
          <span><strong>{meta.stats?.replies || 0}</strong> replies</span>
          <span><strong>{meta.stats?.solved || 0}</strong> solved</span>
          <span><strong>{onlineCount}</strong> live here</span>
        </div>
      </section>

      <section className="community-shell">
        <aside className="community-sidebar">
          <div className="filter-panel">
            <label htmlFor="discussion-search">Search</label>
            <input
              id="discussion-search"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search doubts, tags, topics"
            />
            <label htmlFor="discussion-category">Topic</label>
            <select
              id="discussion-category"
              value={filters.category}
              onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            >
              <option>All</option>
              {meta.categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>

          <div className="topic-list">
            {["All", ...meta.categories].map((category) => (
              <button
                key={category}
                className={filters.category === category ? "active" : ""}
                onClick={() => setFilters((current) => ({ ...current, category }))}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <section className="discussion-feed">
          <div className="feed-toolbar">
            <div className="segmented-control">
              {sorts.map((sort) => (
                <button
                  key={sort.value}
                  className={filters.sort === sort.value ? "active" : ""}
                  onClick={() => setFilters((current) => ({ ...current, sort: sort.value }))}
                >
                  {sort.label}
                </button>
              ))}
            </div>
          </div>

          {user && (
            <form className="discussion-composer" onSubmit={handleCreateThread}>
              <div className="composer-grid">
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Ask a doubt or start a discussion"
                  required
                />
                <select
                  value={draft.category}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                >
                  {meta.categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </div>
              <textarea
                value={draft.content}
                onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                placeholder="Share context, what you tried, links, constraints, or what kind of help you need."
                required
              />
              <div className="composer-actions">
                <input
                  value={draft.tags}
                  onChange={(event) => setDraft((current) => ({ ...current, tags: event.target.value }))}
                  placeholder="react, dsa, placement"
                />
                <button type="submit">Publish</button>
              </div>
            </form>
          )}

          <div className="feed-list">
            {loading && <p className="forum-empty">Loading community discussions...</p>}
            {!loading && threads.length === 0 && <p className="forum-empty">No matching discussions yet.</p>}
            {threads.map((thread) => (
              <DiscussionCard
                key={thread._id}
                thread={thread}
                selected={activeId === thread._id}
                onOpen={setActiveId}
                onLike={handleThreadLike}
                onDelete={handleDelete}
                user={user}
              />
            ))}
          </div>
        </section>

        <aside className="thread-panel">
          {activeThread ? (
            <>
              <div className="thread-panel-header">
                <div>
                  <span className="category-pill">{activeThread.category}</span>
                  <h2>{activeThread.title}</h2>
                  <p>{highlightMentions(activeThread.content || activeThread.description)}</p>
                </div>
                <div className="thread-author">
                  <span className="avatar">{initials(activeAuthor.name)}</span>
                  <span>{activeAuthor.name || "ACM Member"}</span>
                </div>
                {user?.role === "admin" && (
                  <div className="moderation-bar">
                    <button onClick={() => handleModeration({ pinned: !activeThread.pinned })}>
                      {activeThread.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button onClick={() => handleModeration({ locked: !activeThread.locked, status: activeThread.locked ? "open" : "locked" })}>
                      {activeThread.locked ? "Unlock" : "Lock"}
                    </button>
                    <button onClick={() => handleModeration({ announcement: !activeThread.announcement })}>
                      Announcement
                    </button>
                  </div>
                )}
              </div>

              <div className="reply-thread">
                {typingUser && <div className="typing-indicator">{typingUser} is typing</div>}
                {replies.length === 0 && <p className="no-replies">No replies yet. Be the first to help.</p>}
                {replies.map((reply) => (
                  <ReplyNode
                    key={reply._id}
                    reply={reply}
                    user={user}
                    onReply={handleReply}
                    onLike={handleReplyLike}
                    onSolve={(replyId) => handleModeration({ solvedReply: replyId })}
                  />
                ))}
              </div>

              {user && !activeThread.locked && (
                <ReplyComposer
                  placeholder="Add an answer, quote context, or mention @someone who can help"
                  onSubmit={handleReply}
                  onTyping={() => socket?.emit(SOCKET_EVENTS.DISCUSSION_TYPING, {
                    discussionId: activeId,
                    user: { name: user.name },
                  })}
                />
              )}
              {activeThread.locked && <p className="locked-note">This discussion is locked by moderators.</p>}
            </>
          ) : (
            <div className="empty-thread-panel">
              <h2>Select a discussion</h2>
              <p>Open a thread to read nested replies, live updates, and accepted answers.</p>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
};

export default Forum;
