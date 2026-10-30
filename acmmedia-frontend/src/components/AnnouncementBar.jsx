import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchExternalNews } from "../api/news";
import { extractArray } from "../utils/api";
import "../styles/announcement.css";

const STORAGE_KEY = "acm-announcement-dismissed";

const MESSAGES = [
  { text: "Workshops, hackathons and seminars all year", to: "/events" },
  { text: "Community Hub is live: ask, answer and learn together", to: "/forum" },
  { text: "Open to every XIM student, free to join", to: "/register" },
  { text: "Daily tech headlines, curated for you", to: "/news" },
];

const readDismissed = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const AnnouncementBar = () => {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [news, setNews] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchExternalNews()
      .then((res) => {
        if (!cancelled) setNews(extractArray(res.data, ["articles", "news", "data"]).slice(0, 10));
      })
      .catch(() => {
        /* no headlines: the bar falls back to chapter messages */
      });
    return () => { cancelled = true; };
  }, []);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable: dismissal lasts until reload */
    }
  };

  const entries = news.length > 0
    ? news.map((n) => ({ text: n.title, source: n.source || "News", href: n.url, external: true }))
    : MESSAGES.map((m) => ({ text: m.text, to: m.to }));
  const hasNews = news.length > 0;

  // The set is rendered twice so the -50% translate loops seamlessly.
  const items = [...entries, ...entries];
  const hidden = (i) => i >= entries.length;

  return (
    <div className="announcement-bar" role="region" aria-label={hasNews ? "Latest tech news" : "Chapter announcements"}>
      {hasNews && (
        <span className="announcement-label">
          <span className="announcement-pulse" aria-hidden="true" />
          Tech News
        </span>
      )}
      <div className="announcement-viewport">
        <ul className="announcement-track" style={{ animationDuration: `${Math.max(30, entries.length * 7)}s` }}>
          {items.map((m, i) => (
            <li key={i} className="announcement-item" aria-hidden={hidden(i)}>
              {m.source && <span className="announcement-source">{m.source}</span>}
              {m.external ? (
                <a href={m.href} target="_blank" rel="noopener noreferrer" tabIndex={hidden(i) ? -1 : 0}>{m.text}</a>
              ) : (
                <Link to={m.to} tabIndex={hidden(i) ? -1 : 0}>{m.text}</Link>
              )}
              <span className="announcement-sep" aria-hidden="true">✦</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="announcement-close" onClick={dismiss} aria-label="Dismiss announcements">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default AnnouncementBar;
