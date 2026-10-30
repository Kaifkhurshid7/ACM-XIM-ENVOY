import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "./assets/Transparent-Logo-min.png";
import { SOCIALS } from "./ui/SocialIcons";
import "../styles/footer.css";

/* Same shape as the navbar menus: `path` is an in-app route, `href` is external. */
const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Home", path: "/" },
      { label: "News", path: "/news" },
      { label: "Events", path: "/events" },
      { label: "Forum", path: "/forum" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Join the chapter", path: "/register", show: (u) => !u },
      { label: "Sign in", path: "/login", show: (u) => !u },
      { label: "My profile", path: "/profile", show: (u) => !!u },
      { label: "Security settings", path: "/security", show: (u) => !!u },
      { label: "Admin portal", path: "/admin-login" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Chapter website", href: "https://www.acmxim.space/" },
      { label: "ACM Digital Library", href: "https://dl.acm.org/" },
      { label: "ACM.org", href: "https://www.acm.org/" },
      { label: "API docs", href: "https://acmmedia-backend.onrender.com/api-docs" },
      { label: "Source code", href: "https://github.com/ACM-XIM" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", path: "/privacy" },
      { label: "Terms & Conditions", path: "/terms" },
      { label: "Code of Conduct", path: "/conduct" },
      { label: "Sitemap", href: "/sitemap.xml" },
      { label: "System status", href: "https://acmmedia-backend.onrender.com/" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", path: "/privacy" },
  { label: "Terms & Conditions", path: "/terms" },
  { label: "Code of Conduct", path: "/conduct" },
];

const FooterLink = ({ link }) => {
  if (link.href) {
    const external = /^https?:/.test(link.href);
    return (
      <a href={link.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {link.label}
      </a>
    );
  }
  return <Link to={link.path}>{link.label}</Link>;
};

const COUPON_CODE = "JOIN-ACM-XIM";

const Footer = () => {
  const { user } = useContext(AuthContext);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE);
    } catch {
      /* clipboard blocked: still show feedback so the click is acknowledged */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Call to action: an "admit one" ticket with a perforated stub */}
        <section className="footer-cta" aria-label="Join the chapter">
          <div className="footer-cta-main">
            <p className="footer-cta-kicker">Admit one</p>
            <h2>Ready to build with ACM XIM?</h2>
            <p className="footer-cta-text">
              Attend workshops, take part in hackathons and learn alongside your peers.
            </p>
            <div className="footer-cta-code">
              <span className="footer-cta-code-label">Your code</span>
              <code>{COUPON_CODE}</code>
              <button type="button" onClick={copyCode} aria-live="polite">
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>
          </div>

          <div className="footer-cta-stub">
            <svg className="footer-cta-scissors" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.1" y2="15.9" /><line x1="14.5" y1="14.5" x2="20" y2="20" /><line x1="8.1" y1="8.1" x2="12" y2="12" />
            </svg>
            <p className="footer-cta-pass">Member pass</p>
            <Link to={user ? "/events" : "/register"} className="footer-cta-btn">
              {user ? "Browse events" : "Join the chapter"} <span aria-hidden="true">→</span>
            </Link>
            <p className="footer-cta-note">Free for every XIM student</p>
          </div>
        </section>

        {/* Brand + link columns */}
        <div className="footer-top">
          <div className="footer-about">
            <Link to="/" className="footer-brand" aria-label="ACM XIM home">
              <img src={logo} alt="ACM XIM Student Chapter" />
            </Link>
            <p>
              The ACM Student Chapter at XIM University. Workshops, hackathons and a community that
              builds together.
            </p>
            <ul className="footer-socials" aria-label="Social links">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.name}>{s.svg}</a>
                </li>
              ))}
            </ul>
          </div>

          <nav className="footer-columns" aria-label="Footer">
            {COLUMNS.map((col) => (
              <div key={col.title} className="footer-col">
                <h2>{col.title}</h2>
                <ul>
                  {col.links
                    .filter((l) => !l.show || l.show(user))
                    .map((l) => (
                      <li key={l.label}><FooterLink link={l} /></li>
                    ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-copy">
            <p>© {new Date().getFullYear()} ACM XIM Student Chapter, XIM University. All rights reserved.</p>
            <p>ACM and the ACM logo belong to the Association for Computing Machinery.</p>
          </div>
          <ul className="footer-legal" aria-label="Legal">
            {LEGAL_LINKS.map((l) => (
              <li key={l.path}><Link to={l.path}>{l.label}</Link></li>
            ))}
            <li>
              <a
                href="#main-content"
                onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                Back to top ↑
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-wordmark" aria-hidden="true">ACM XIM</div>
    </footer>
  );
};

export default Footer;
