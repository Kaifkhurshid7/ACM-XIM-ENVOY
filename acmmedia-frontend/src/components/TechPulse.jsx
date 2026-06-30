import { useState, useEffect } from "react";
import { fetchExternalNews } from "../api/news";
import "../styles/techpulse.css";
import { extractArray } from "../utils/api";
import { ExternalLinkIcon } from "./ui/Icons";

const TechPulse = ({ mode = "grid" }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetchExternalNews();
        setNews(extractArray(res.data, ["articles", "news", "data"]));
      } catch (err) {
        setError("Unable to load tech news right now.");
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  if (mode === "ticker") {
    if (loading || error || news.length === 0) return null;
    return (
      <div className="tech-ticker-container">
        <div className="ticker-track">
          {[...news, ...news].map((item, idx) => (
            <div key={idx} className="ticker-item">
              <span className="ticker-source">{item.source || "News"}:</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
              <span className="ticker-sep">·</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loading) return <div className="news-loading" role="status" aria-live="polite">Loading tech news...</div>;
  if (error) return <div className="news-error" role="alert">{error}</div>;
  if (news.length === 0) return <div className="news-loading" role="status">No tech news available right now.</div>;

  return (
    <div className="news-page">
      <header className="news-header">
        <h2>Tech News</h2>
        <p>Latest headlines from the world of technology.</p>
      </header>
      <div className="news-grid">
        {news.map((item, idx) => (
          <article key={idx} className="news-card">
            {item.image && <img src={item.image} alt={item.title} className="news-image" onError={(e) => (e.target.style.display = "none")} />}
            <div className="news-content">
              <div className="news-source">{item.source || "Unknown"}</div>
              <h3 className="news-title">{item.title}</h3>
              <p className="news-desc">{item.description || "No description available."}</p>
              <div className="news-footer">
                <span className="news-date">{item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Recent"}</span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-link" aria-label={`Read full article: ${item.title}`}>
                  Read article <ExternalLinkIcon size={12} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default TechPulse;
