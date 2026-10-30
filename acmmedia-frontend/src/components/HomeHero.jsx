import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEvents } from "../api/events";
import { extractArray } from "../utils/api";
import { formatEventDate } from "../utils/events";

const svg = (children) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);

const POINTS = [
  { label: "Live discussions", icon: svg(<path d="M4 5h16v11H9l-5 4z" />) },
  { label: "Workshops & hackathons", icon: svg(<><rect x="3" y="5" width="18" height="16" rx="2" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="8" y1="3" x2="8" y2="7" /><line x1="16" y1="3" x2="16" y2="7" /></>) },
  { label: "Daily tech news", icon: svg(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="9" x2="17" y2="9" /><line x1="7" y1="13" x2="17" y2="13" /></>) },
];

/* One terminal line. `chars` sizes the typing animation; `delay` is in seconds. */
const Cmd = ({ children, chars, delay }) => (
  <p className="term-line" style={{ "--d": `${delay}s` }}>
    <span className="term-prompt">$</span>
    <span
      className="term-typed"
      style={{ "--n": chars, animationTimingFunction: `steps(${chars}, end), step-end` }}
    >
      {children}
    </span>
  </p>
);

const Out = ({ children, delay, tone }) => (
  <p className={`term-line term-out ${tone ? `term-out--${tone}` : ""}`} style={{ "--d": `${delay}s` }}>
    {children}
  </p>
);

const HomeHero = ({ user, isConnected }) => {
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchEvents({ limit: 20 })
      .then((res) => {
        const upcoming = extractArray(res.data, ["data", "events"]).find((e) => !e.isPast);
        if (!cancelled && upcoming) setNextEvent(upcoming);
      })
      .catch(() => {
        /* the terminal falls back to a generic line */
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="hero">
      <div className="hero-wordmark" aria-hidden="true"><span>ACM XIM</span></div>
      <div className="hero-copy">
        <Link to="/forum" className="hero-pill">
          <span className="hero-pill-new">New</span>
          Community Hub is live
          <span aria-hidden="true">→</span>
        </Link>

        <h1 className="hero-title">
          <span className="hl"><i aria-hidden="true">01</i><b>Code.</b></span>
          <span className="hl"><i aria-hidden="true">02</i><b>Collaborate.</b></span>
          <span className="hl"><i aria-hidden="true">03</i><b>Compete.</b></span>
        </h1>

        <p className="hero-lede">
          The student chapter where XIM builds things together: hands-on workshops, hackathons,
          and a live community that answers back.
        </p>

        <div className="hero-actions">
          {!user && (
            <Link to="/register" className="hero-btn hero-btn--primary">
              Join the chapter <span aria-hidden="true">→</span>
            </Link>
          )}
          <Link to="/events" className="hero-btn hero-btn--link">
            Browse events <span aria-hidden="true">→</span>
          </Link>
        </div>

        <ul className="hero-points" aria-label="What the chapter offers">
          {POINTS.map((p) => (
            <li key={p.label}>{p.icon}<span>{p.label}</span></li>
          ))}
        </ul>
      </div>

      <div className="hero-term" aria-hidden="true">
        <div className="term-window">
          <div className="term-bar">
            <span className="term-dot term-dot--r" />
            <span className="term-dot term-dot--y" />
            <span className="term-dot term-dot--g" />
            <span className="term-title">acm@xim: ~</span>
          </div>
          <div className="term-body">
            <Cmd chars={24} delay={0.4}>acm join --chapter xim</Cmd>
            <Out delay={1.7} tone="ok">✓ welcome to the community</Out>

            <Cmd chars={19} delay={2.3}>acm events --next</Cmd>
            <Out delay={3.4}>
              {nextEvent
                ? `→ ${nextEvent.title} · ${formatEventDate(nextEvent.date, { long: false })}`
                : "→ workshops · hackathons · seminars"}
            </Out>

            <Cmd chars={18} delay={4.0}>acm forum --live</Cmd>
            <Out delay={5.0} tone={isConnected ? "ok" : "warn"}>
              {isConnected ? "● community hub connected" : "○ reconnecting to the hub…"}
            </Out>

            <p className="term-line" style={{ "--d": "5.5s" }}>
              <span className="term-prompt">$</span>
              <span className="term-cursor" />
            </p>
          </div>
        </div>
        <div className="term-chip">
          <span className="term-chip-dot" />
          Free for every XIM student
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
