import React from "react";
import { Link } from "react-router-dom";
import LegalPage from "../components/LegalPage";

const Contact = () => (
  <p>
    Reach the chapter through the{" "}
    <a href="https://www.acmxim.space/" target="_blank" rel="noopener noreferrer">chapter website</a>,{" "}
    <a href="https://www.instagram.com/xim_acm/" target="_blank" rel="noopener noreferrer">Instagram</a> or{" "}
    <a href="https://www.linkedin.com/company/xim-acm/" target="_blank" rel="noopener noreferrer">LinkedIn</a>, or
    speak to a chapter coordinator in person.
  </p>
);

const SECTIONS = [
  {
    id: "who-we-are",
    title: "Who we are",
    content: (
      <>
        <p>
          This platform is run by the ACM Student Chapter at XIM University ("ACM XIM", "we", "us") for
          its members and the wider university community. This policy explains what personal information
          we collect when you use the site, why we collect it, and the choices you have.
        </p>
      </>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    content: (
      <>
        <p>We only collect what the platform needs to work.</p>
        <ul>
          <li><strong>Account details:</strong> your full name, university email address, username and role. Your password is stored only as a one-way hash, never in readable form.</li>
          <li><strong>Chapter membership:</strong> whether you are an ACM member and, if you choose to provide it, your ACM ID.</li>
          <li><strong>Profile details (optional):</strong> avatar, banner image, bio, department, batch, location, social and portfolio links, skills, interests, language and timezone.</li>
          <li><strong>Content you create:</strong> discussions, replies, comments, likes, upvotes and bookmarks.</li>
          <li><strong>Security data:</strong> sign-in sessions, login history and security log entries, including IP address and browser or device details, so you can review activity on your account and we can detect abuse.</li>
          <li><strong>Technical logs:</strong> basic server logs such as request method, URL and IP address. Passwords, tokens and authorization headers are redacted from logs.</li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    content: (
      <>
        <ul>
          <li>To create and secure your account and sign you in.</li>
          <li>To run the platform: show posts, events and the Community Hub, and display your profile according to your privacy settings.</li>
          <li>To send emails the service depends on, such as email verification, password reset and security alerts, and optional notifications that you control in your settings.</li>
          <li>To moderate content and keep the community safe, in line with our <Link to="/conduct">Code of Conduct</Link>.</li>
          <li>To understand overall activity, for example the aggregate counts of users, posts and comments shown to chapter administrators.</li>
        </ul>
        <p>We do not sell your personal information and we do not use it for advertising.</p>
      </>
    ),
  },
  {
    id: "visibility",
    title: "What other people can see",
    content: (
      <>
        <p>
          Discussions, replies and comments you post are visible to other visitors and members. Your
          profile follows the privacy controls in your account settings: you can choose whether your
          profile is public, whether your email is shown (hidden by default), and whether your activity
          and contributions appear. Think before sharing personal details in public posts.
        </p>
      </>
    ),
  },
  {
    id: "cookies-storage",
    title: "Cookies and browser storage",
    content: (
      <>
        <p>
          We use your browser's local storage to keep you signed in (an authentication token) and
          session storage for small interface choices, such as dismissing the announcement bar. We do
          not set advertising or third-party tracking cookies.
        </p>
        <p>
          The site loads the Inter typeface from Google Fonts, which means your browser makes a request
          to Google's servers when a page loads.
        </p>
      </>
    ),
  },
  {
    id: "service-providers",
    title: "Service providers",
    content: (
      <>
        <p>We rely on a small number of providers to operate the platform:</p>
        <ul>
          <li>Vercel hosts the website and Render hosts the server.</li>
          <li>MongoDB Atlas stores the database.</li>
          <li>An email (SMTP) provider delivers verification, reset and notification emails.</li>
          <li>NewsAPI supplies technology headlines. These requests are made by our server and do not include your personal information.</li>
        </ul>
        <p>
          Links to third-party sites, including social networks and external news articles, are governed
          by those sites' own policies. We may disclose information if required by law or by the
          university, or to protect the safety of our community.
        </p>
      </>
    ),
  },
  {
    id: "security-retention",
    title: "Security and retention",
    content: (
      <>
        <p>
          We protect data with hashed passwords, encrypted connections, request rate limiting and
          role-based access controls. No system is perfectly secure, so please use a strong, unique
          password and review your active sessions regularly in{" "}
          <Link to="/security">Security settings</Link>.
        </p>
        <p>
          We keep your account information for as long as your account is active and as needed to run
          the chapter and keep the platform secure. Security logs are kept for a limited period.
        </p>
      </>
    ),
  },
  {
    id: "your-choices",
    title: "Your choices and rights",
    content: (
      <>
        <ul>
          <li>Edit or remove profile details, avatar and banner at any time from your profile.</li>
          <li>Control profile visibility and notifications in your account settings.</li>
          <li>Change your password, view login history and sign out of other sessions in Security settings.</li>
          <li>Ask us to provide a copy of, correct or delete your personal information.</li>
        </ul>
        <Contact />
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    content: (
      <>
        <p>
          We may update this policy as the platform changes. The date at the top shows the latest
          version, and we will highlight significant changes on the site.
        </p>
        <Contact />
      </>
    ),
  },
];

const Privacy = () => (
  <LegalPage
    current="/privacy"
    title="Privacy Policy"
    description="How the ACM XIM Student Chapter platform collects, uses and protects your personal information."
    updated="30 October 2026"
    intro="What we collect, why we collect it, and the controls you have over your information on the ACM XIM platform."
    sections={SECTIONS}
  />
);

export default Privacy;
