import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "./assets/Transparent-Logo-min.png";
import { EyeIcon, EyeOffIcon, LockIcon } from "./ui/Icons";
import "../styles/login.css";

export const MailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3.5 7l8.5 6 8.5-6" />
  </svg>
);

/** Input with a leading icon and, for passwords, a show/hide toggle inside the field. */
export const AuthField = ({ id, label, icon, password = false, ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="al-field">
      <label htmlFor={id}>{label}</label>
      <div className="al-input">
        <span className="al-input-icon">{icon}</span>
        <input id={id} type={password && !visible ? "password" : password ? "text" : inputProps.type || "text"} {...inputProps} />
        {password && (
          <button
            type="button"
            className="al-input-toggle"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const AVATARS = ["A", "R", "S", "M", "K"];

/* Decorative cards for the visual panel. Sample content only, not live data. */
const MemberCards = () => (
  <div className="al-cards" aria-hidden="true">
    <div className="al-card al-card--event">
      <div className="al-date"><span>SEP</span><strong>15</strong></div>
      <div className="al-card-body">
        <strong>Intro to Web Dev workshop</strong>
        <span>XIM Campus · beginner friendly</span>
      </div>
      <span className="al-pill">Register</span>
    </div>

    <div className="al-card al-card--people">
      <div className="al-avatars">
        {AVATARS.map((a) => <span key={a}>{a}</span>)}
        <span className="al-avatars-you">you</span>
      </div>
      <div className="al-card-body">
        <strong>Students are already in the hub</strong>
        <span><i className="al-live" /> Discussions happening now</span>
      </div>
    </div>

    <div className="al-card al-card--code">
      <code><em>chapter</em>.join(<b>you</b>)</code>
      <code className="al-code-ok">✓ welcome to ACM XIM</code>
    </div>
  </div>
);

const AdminCards = () => (
  <div className="al-cards" aria-hidden="true">
    <div className="al-card al-card--event">
      <div className="al-card-body">
        <strong>Moderation tools</strong>
        <span>Pin · lock · announce · official answer</span>
      </div>
      <span className="al-pill">3 actions</span>
    </div>

    <div className="al-card al-card--people">
      <svg className="al-spark" viewBox="0 0 160 48" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="al-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a3a3a3" stopOpacity="0.45" />
            <stop offset="1" stopColor="#a3a3a3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 38 L20 30 L40 34 L60 20 L80 26 L100 12 L120 18 L140 6 L160 10 V48 H0 Z" fill="url(#al-spark-fill)" />
        <path d="M0 38 L20 30 L40 34 L60 20 L80 26 L100 12 L120 18 L140 6 L160 10" stroke="#a3a3a3" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="al-card-body">
        <strong>Live platform analytics</strong>
        <span><i className="al-live" /> Users, posts, likes, comments</span>
      </div>
    </div>

    <div className="al-card al-card--code">
      <code><em>role</em>: <b>"admin"</b></code>
      <code className="al-code-ok">✓ access verified server-side</code>
    </div>
  </div>
);

/**
 * Split-screen shell shared by the member and admin sign-in pages: an illustrated
 * panel on the left, the form on the right.
 */
const AuthLayout = ({
  variant = "member",
  eyebrow,
  title,
  subtitle,
  aside,
  children,
  footer,
  headline,
  lead,
  visual,
  visualFoot,
  wide = false,
  hideBrand = false,
}) => {
  const admin = variant === "admin";

  return (
    <div className={`al-page ${admin ? "al-page--admin" : ""} ${wide ? "al-page--tall" : ""}`}>
      <section className="al-visual" aria-hidden="false">
        <div className="al-rings" aria-hidden="true"><i /><i /><i /></div>

        <div className="al-visual-sticky">
        {!hideBrand && (
          <div className="al-visual-top">
            <Link to="/" className="al-brand" aria-label="ACM XIM home">
              <img src={logo} alt="ACM XIM Student Chapter" />
            </Link>
          </div>
        )}

        <div className="al-visual-main">
          <h2>
            {headline ?? (admin ? (
              <>Run the chapter, <span>with confidence.</span></>
            ) : (
              <>Your chapter, <span>one sign-in away.</span></>
            ))}
          </h2>
          <p>
            {lead ?? (admin
              ? "Publish announcements and events, moderate the Community Hub, and watch live platform activity."
              : "Pick up your discussions, register for events, and keep up with everything happening at ACM XIM.")}
          </p>
          {visual ?? (admin ? <AdminCards /> : <MemberCards />)}
        </div>

        <div className="al-visual-foot">{visualFoot ?? `© ${new Date().getFullYear()} ACM XIM Student Chapter`}</div>
        </div>
      </section>

      <section className="al-formside">
        {aside && <div className="al-aside">{aside}</div>}

        <div className={`al-form-wrap ${wide ? "al-form-wrap--wide" : ""}`}>
          <header className="al-head">
            <p className="al-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </header>

          {children}

          <div className="al-foot">
            <p className="al-secure">
              <LockIcon size={14} />
              <span>Encrypted connection. Sign-in attempts are rate limited to protect your account.</span>
            </p>
            {footer}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthLayout;
