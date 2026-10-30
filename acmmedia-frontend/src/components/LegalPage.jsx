import React from "react";
import { Link } from "react-router-dom";
import Seo from "./Seo";
import "../styles/legal.css";

const DOCS = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Code of Conduct", path: "/conduct" },
];

/**
 * Shared layout for the policy pages: a title block, a sticky table of contents
 * and numbered sections. `sections` is [{ id, title, content }].
 */
const LegalPage = ({ title, description, updated, intro, sections, current }) => (
  <div className="legal">
    <Seo title={title} description={description} />

    <header className="legal-hero">
      <div className="legal-hero-inner">
        <p className="legal-kicker">Legal</p>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
        <p className="legal-updated">Last updated: {updated}</p>
      </div>
    </header>

    <div className="legal-body">
      <aside className="legal-toc" aria-label="On this page">
        <p>On this page</p>
        <ol>
          {sections.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </aside>

      <article className="legal-content">
        {sections.map((s, i) => (
          <section key={s.id} id={s.id} className="legal-section">
            <h2>
              <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            {s.content}
          </section>
        ))}

        <nav className="legal-related" aria-label="Related policies">
          {DOCS.filter((d) => d.path !== current).map((d) => (
            <Link key={d.path} to={d.path}>
              <span>{d.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </nav>
      </article>
    </div>
  </div>
);

export default LegalPage;
