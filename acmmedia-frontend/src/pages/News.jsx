import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchExternalNews } from "../api/news";
import { extractArray } from "../utils/api";
import Seo from "../components/Seo";
import "../styles/news.css";

/** "5m ago", "3h ago", "2d ago", or a short date for anything older than a week. */
const timeAgo = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "Recent";
  const mins = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 8) return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/** Headlines usually end with " - Publisher"; the source is shown separately. */
const cleanTitle = (title = "") => title.replace(/\s+[-–|]\s+[^-–|]{2,40}$/, "").trim() || title;

const Thumb = ({ item, className }) => {
  const [failed, setFailed] = useState(false);
  if (!item.image || failed) {
    return (
      <div className={`np-thumb np-thumb--blank ${className || ""}`} aria-hidden="true">
        <span>{(item.source || "N").charAt(0).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <img
      className={`np-thumb ${className || ""}`}
      src={item.image}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
};

const News = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [source, setSource] = useState("All");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Collapse the source dropdown on page scroll, outside tap, or Escape
  useEffect(() => {
    if (!filterOpen) return undefined;
    const close = () => setFilterOpen(false);
    const onPointer = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) close(); };
    const onKey = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("scroll", close, { passive: true });
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetchExternalNews();
      setArticles(extractArray(res.data, ["articles", "news", "data"]));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sources = useMemo(() => {
    const counts = {};
    articles.forEach((a) => { const s = a.source || "Unknown"; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [articles]);

  const visible = useMemo(
    () => (source === "All" ? articles : articles.filter((a) => (a.source || "Unknown") === source)),
    [articles, source]
  );

  const [lead, ...rest] = visible;
  const top = rest.slice(0, 4);
  const more = rest.slice(4);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="np">
      <Seo title="Tech News" description="Daily technology headlines curated for the ACM XIM community." />

      <header className="np-masthead">
        <div>
          <p className="np-kicker">// Tech Pulse</p>
          <h1>Today in tech</h1>
          <p className="np-date">
            {today}
            {!loading && !error && articles.length > 0 && <> · {articles.length} stories</>}
          </p>
        </div>
        <button type="button" className="np-refresh" onClick={load} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={loading ? "spin" : ""}>
            <path d="M21 12a9 9 0 1 1-3-6.7" /><polyline points="21 3 21 9 15 9" />
          </svg>
          {loading ? "Refreshing" : "Refresh"}
        </button>
      </header>

      {sources.length > 1 && (
        <div ref={filterRef} className={`np-filterbar ${filterOpen ? "open" : ""}`}>
          <button
            type="button"
            className="np-filter-toggle"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <span>Source</span>
            <strong>{source}</strong>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          <div className="np-filters" role="group" aria-label="Filter by source">
            {[["All", articles.length], ...sources].map(([name, count]) => (
              <button
                key={name}
                type="button"
                className={source === name ? "active" : ""}
                aria-pressed={source === name}
                onClick={() => { setSource(name); setFilterOpen(false); }}
              >
                {name}<span>{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && articles.length === 0 ? (
        <div className="np-skeleton" aria-hidden="true">
          <div className="np-skel np-skel--lead" />
          <div className="np-skel-list">{[0, 1, 2, 3].map((i) => <div key={i} className="np-skel" />)}</div>
        </div>
      ) : error ? (
        <div className="np-state" role="alert">
          <h2>Couldn't load the news</h2>
          <p>The headline service didn't respond. Please try again in a moment.</p>
          <button type="button" onClick={load}>Try again</button>
        </div>
      ) : visible.length === 0 ? (
        <div className="np-state" role="status">
          <h2>No stories right now</h2>
          <p>Check back soon for fresh technology headlines.</p>
        </div>
      ) : (
        <>
          <section className="np-top" aria-label="Top stories">
            <a className="np-lead" href={lead.url} target="_blank" rel="noopener noreferrer">
              <Thumb item={lead} className="np-lead-img" />
              <div className="np-lead-shade" />
              <div className="np-lead-body">
                <span className="np-tag">{lead.source || "News"}</span>
                <h2>{cleanTitle(lead.title)}</h2>
                {lead.description && <p>{lead.description}</p>}
                <span className="np-meta">{timeAgo(lead.publishedAt)} · Read story ↗</span>
              </div>
            </a>

            {top.length > 0 && (
              <ol className="np-ranked">
                {top.map((a, i) => (
                  <li key={a.url || i}>
                    <a href={a.url} target="_blank" rel="noopener noreferrer">
                      <span className="np-rank">{String(i + 2).padStart(2, "0")}</span>
                      <span className="np-ranked-text">
                        <span className="np-ranked-meta">{a.source || "News"} · {timeAgo(a.publishedAt)}</span>
                        <strong>{cleanTitle(a.title)}</strong>
                      </span>
                      <Thumb item={a} className="np-ranked-img" />
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {more.length > 0 && (
            <section className="np-more" aria-label="More stories">
              <h2 className="np-section-title">More stories</h2>
              <div className="np-grid">
                {more.map((a, i) => (
                  <a key={a.url || i} className="np-card" href={a.url} target="_blank" rel="noopener noreferrer">
                    <Thumb item={a} className="np-card-img" />
                    <div className="np-card-body">
                      <span className="np-ranked-meta">{a.source || "News"} · {timeAgo(a.publishedAt)}</span>
                      <h3>{cleanTitle(a.title)}</h3>
                      {a.description && <p>{a.description}</p>}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default News;
