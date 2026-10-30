import React from "react";
import { Link } from "react-router-dom";

const LINKS = [
  { label: "Events & workshops", to: "/events" },
  { label: "Community Hub", to: "/forum" },
  { label: "Tech news", to: "/news" },
];

const Arrow = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
  </svg>
);

/*
 * Decorative preview of the product: a fanned stack of the cards members see
 * every day. The content is illustrative sample text, not live data.
 */
const ProductPreview = () => (
  <div className="stack" aria-hidden="true">
    <div className="stack-glow" />

    {/* Discussion thread */}
    <article className="pcard pcard--thread">
      <header className="pcard-head">
        <span className="pcard-tag">Help &amp; doubts</span>
        <span className="pcard-solved">✓ Solved</span>
      </header>
      <h3>How do I start with competitive programming?</h3>
      <p className="pcard-meta">
        <span className="pcard-chip">#dsa</span>
        <span className="pcard-chip">#beginners</span>
      </p>
      <div className="pcard-reply">
        <span className="pcard-avatar">A</span>
        <div>
          <strong>Aarav</strong>
          <p>Start with arrays and sorting, then join our Sunday practice contest.</p>
        </div>
      </div>
      <footer className="pcard-foot">
        <span>▲ 24</span>
        <span>8 replies</span>
        <span className="pcard-live"><i /> 3 reading now</span>
      </footer>
    </article>

    {/* Event */}
    <article className="pcard pcard--event">
      <div className="pcard-date">
        <span>SEP</span>
        <strong>15</strong>
      </div>
      <div className="pcard-event-body">
        <h3>Intro to Web Dev workshop</h3>
        <p>XIM Campus · Hands-on, beginner friendly</p>
      </div>
      <span className="pcard-cta">Register</span>
    </article>

    {/* Notification */}
    <div className="pcard pcard--toast">
      <span className="pcard-toast-dot" />
      <div>
        <strong>Aarav replied to your question</strong>
        <p>just now</p>
      </div>
    </div>
  </div>
);

const HomeShowcase = () => (
  <section className="showcase" aria-labelledby="showcase-title">
    <div className="showcase-inner">
      <ProductPreview />

      <div className="showcase-copy">
        <h2 id="showcase-title">Everything the chapter runs on</h2>
        <p>
          Join events, ask questions in the Community Hub, and keep up with tech news. Your
          chapter stays connected, even between meetups.
        </p>
        <ul className="showcase-links">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link to={l.to}>
                <span>{l.label}</span>
                <Arrow />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default HomeShowcase;
