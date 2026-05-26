/**
 * TechPulse Component
 * 
 * Displays external technology news in two modes:
 * - "ticker": Horizontal scrolling news ticker (used on Home page)
 * - "grid": Full news grid layout (used on News page)
 * 
 * Fetches news from the backend cache layer which proxies NewsAPI.
 * Handles loading, error, and empty states gracefully.
 * 
 * @component
 * @param {string} mode - Display mode: "ticker" or "grid"
 */

import React, { useState, useEffect } from "react";
import { fetchExternalNews } from "../api/news";
import "../styles/techpulse.css";
import { extractArray } from "../utils/api";

const TechPulse = ({ mode = "grid" }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetchExternalNews();
        const data = extractArray(res.data, ["articles", "news", "data"]);
        setNews(data);
      } catch (err) {
        console.error("Failed to fetch news", err);
        setError("Failed to load global tech news.");
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  // ─── Ticker Mode ───────────────────────────────────────────────────────────
  if (mode === "ticker") {
    if (loading || error || news.length === 0) return null;

    return (
      <div className="tech-ticker-container">
        <div className="ticker-label"></div>
        <div className="ticker-track">
          {/* Duplicate items for infinite scroll illusion */}
          {[...news, ...news].map((item, idx) => (
            <div key={idx} className="ticker-item">
              <span className="ticker-source">{item.source || "News"}:</span>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
              <span style={{ margin: "0 10px", color: "#555" }}>|</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Grid Mode ─────────────────────────────────────────────────────────────
  if (loading) return <div className="news-loading">Loading Global Tech News...</div>;
  if (error) return <div className="news-error">{error}</div>;
  if (news.length === 0) return <div className="news-loading">No global tech news available right now.</div>;

  return (
    <div className="news-page">
      <header className="news-header">
        <h2>Global Tech Chronicles</h2>
        <p style={{ color: "#aaa" }}>Live coverage of the latest breakthroughs in technology.</p>
      </header>

      <div className="news-grid">
        {news.map((item, idx) => (
          <article key={idx} className="news-card">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="news-image"
                onError={(e) => (e.target.style.display = "none")}
              />
            )}
            <div className="news-content">
              <div className="news-source">{item.source || "Unknown Source"}</div>
              <h3 className="news-title">{item.title}</h3>
              <p className="news-desc">{item.description || "No description available."}</p>
              <div className="news-footer">
                <span className="news-date">
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Recent"}
                </span>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-link">
                  Read Article
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
