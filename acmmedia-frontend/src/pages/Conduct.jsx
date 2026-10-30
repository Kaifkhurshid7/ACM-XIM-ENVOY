import React from "react";
import { Link } from "react-router-dom";
import LegalPage from "../components/LegalPage";

const SECTIONS = [
  {
    id: "our-commitment",
    title: "Our commitment",
    content: (
      <>
        <p>
          The ACM Student Chapter at XIM University is a place to learn, build and grow together. We want
          every member to feel welcome and respected, whatever their background, course, year or
          experience level. This Code of Conduct applies on this platform, at chapter events, and in any
          space where people represent the chapter.
        </p>
      </>
    ),
  },
  {
    id: "expected-behaviour",
    title: "What we expect",
    content: (
      <ul>
        <li>Be respectful and kind. Disagree with ideas, not people.</li>
        <li>Be welcoming to beginners. Everyone started somewhere.</li>
        <li>Give credit, and share knowledge generously.</li>
        <li>Respect people's privacy and boundaries, online and in person.</li>
        <li>Follow instructions from organisers, moderators and venue staff.</li>
      </ul>
    ),
  },
  {
    id: "unacceptable-behaviour",
    title: "What is not acceptable",
    content: (
      <>
        <ul>
          <li>Harassment, bullying, threats or intimidation.</li>
          <li>Discrimination or hateful language about identity, background, ability or beliefs.</li>
          <li>Sharing someone's private information without consent.</li>
          <li>Sexual or violent content, and unwelcome attention.</li>
          <li>Spam, scams, impersonation and unapproved promotion.</li>
          <li>Disrupting discussions or events, or encouraging others to do so.</li>
        </ul>
      </>
    ),
  },
  {
    id: "academic-honesty",
    title: "Honesty in contests and projects",
    content: (
      <p>
        In hackathons, coding contests and shared projects, submit your own or properly credited work.
        Do not plagiarise, share answers during competitions, or tamper with scoring or other
        participants' work. Open-source and third-party code should be used within its licence and
        acknowledged.
      </p>
    ),
  },
  {
    id: "community-hub",
    title: "Community Hub guidelines",
    content: (
      <ul>
        <li>Search before you post, and choose the category that fits your topic.</li>
        <li>Write clear titles and give enough detail for others to help.</li>
        <li>Mark the helpful answer when your question is solved and upvote useful replies.</li>
        <li>Keep self-promotion relevant and occasional.</li>
        <li>Respect pinned, locked and moderated discussions.</li>
      </ul>
    ),
  },
  {
    id: "reporting",
    title: "How to report a problem",
    content: (
      <>
        <p>
          If you see or experience behaviour that breaks this code, tell a chapter coordinator or core
          committee member in person, or contact the chapter through the{" "}
          <a href="https://www.acmxim.space/" target="_blank" rel="noopener noreferrer">chapter website</a>,{" "}
          <a href="https://www.instagram.com/xim_acm/" target="_blank" rel="noopener noreferrer">Instagram</a> or{" "}
          <a href="https://www.linkedin.com/company/xim-acm/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.
          Reports are taken seriously and handled as discreetly as possible. If someone is in immediate
          danger, contact university security or emergency services first.
        </p>
      </>
    ),
  },
  {
    id: "enforcement",
    title: "What happens next",
    content: (
      <>
        <p>Depending on the situation, chapter administrators may:</p>
        <ul>
          <li>give a private or public warning;</li>
          <li>remove content or lock a discussion;</li>
          <li>suspend or close an account, or ask someone to leave an event;</li>
          <li>refer serious cases to university authorities.</li>
        </ul>
        <p>
          You can ask for a decision to be reviewed by contacting the chapter. This code works alongside
          XIM University's own policies and our <Link to="/terms">Terms &amp; Conditions</Link>.
        </p>
      </>
    ),
  },
];

const Conduct = () => (
  <LegalPage
    current="/conduct"
    title="Code of Conduct"
    description="The ACM XIM Student Chapter's standards for respectful, inclusive behaviour on the platform and at events."
    updated="30 October 2026"
    intro="How we treat each other on the platform and at events, so the chapter stays welcoming for everyone."
    sections={SECTIONS}
  />
);

export default Conduct;
