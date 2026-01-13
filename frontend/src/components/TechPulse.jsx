import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/techpulse.css';

const TechPulse = ({ mode = 'grid' }) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/external-news');
                // Ensure we get an array
                const data = Array.isArray(res.data) ? res.data : [];
                setNews(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch news", err);
                setError("Failed to load global tech news.");
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    // --- RENDER TICKER ---
    if (mode === 'ticker') {
        if (loading || error || news.length === 0) return null;

        return (
            <div className="tech-ticker-container">
                <div className="ticker-label"></div>
                <div className="ticker-track">
                    {news.map((item, idx) => (
                        <div key={idx} className="ticker-item">
                            <span className="ticker-source">{item.source || 'News'}:</span>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {item.title}
                            </a>
                            <span style={{ margin: '0 10px', color: '#555' }}>|</span>
                        </div>
                    ))}
                    {/* Duplicate for infinite scroll illusion if needed */}
                    {news.map((item, idx) => (
                        <div key={`dup-${idx}`} className="ticker-item">
                            <span className="ticker-source">{item.source || 'News'}:</span>
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                {item.title}
                            </a>
                            <span style={{ margin: '0 10px', color: '#555' }}>|</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- RENDER GRID ---
    if (loading) return <div className="news-loading">Loading Global Tech News...</div>;
    if (error) return <div className="news-error">{error}</div>;

    return (
        <div className="news-page">
            <header className="news-header">
                <h2>Global Tech Chronicles</h2>
                <p style={{ color: '#aaa' }}>Live coverage of the latest breakthroughs in technology.</p>
            </header>

            <div className="news-grid">
                {news.map((item, idx) => (
                    <article key={idx} className="news-card">
                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.title}
                                className="news-image"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        )}
                        <div className="news-content">
                            <div className="news-source">{item.source || 'Unknown Source'}</div>
                            <h3 className="news-title">{item.title}</h3>
                            <p className="news-desc">{item.description || 'No description available for this article.'}</p>

                            <div className="news-footer">
                                <span className="news-date">
                                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Recent'}
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
