import React from "react";
import { Link } from "react-router-dom";
import LegalPage from "../components/LegalPage";

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    content: (
      <p>
        By creating an account or using the ACM XIM platform ("the Platform"), you agree to these Terms
        &amp; Conditions, our <Link to="/privacy">Privacy Policy</Link> and our{" "}
        <Link to="/conduct">Code of Conduct</Link>. If you do not agree, please do not use the Platform.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Eligibility and accounts",
    content: (
      <>
        <ul>
          <li>Registration is open to people with a valid XIM University email address.</li>
          <li>You must give accurate information and keep it up to date.</li>
          <li>You are responsible for keeping your password secure and for activity on your account. Tell us promptly if you suspect unauthorised access.</li>
          <li>Each person may hold one member account. Admin accounts are created by existing administrators only.</li>
        </ul>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    content: (
      <>
        <p>
          You keep ownership of what you post, including discussions, replies, comments and profile
          information. By posting, you give the chapter a non-exclusive licence to host, display and
          distribute that content on the Platform so that the service can work.
        </p>
        <p>
          You are responsible for your content and must have the right to share it. Do not post anything
          unlawful, infringing, misleading or harmful, or other people's private information.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>When using the Platform you agree not to:</p>
        <ul>
          <li>harass, threaten or discriminate against others, or break the Code of Conduct;</li>
          <li>send spam, advertise without permission, or impersonate another person or the chapter;</li>
          <li>attempt to access accounts, data or systems you are not authorised to use, or probe, disrupt or overload the service;</li>
          <li>bypass rate limits, scrape the site at scale, or introduce malicious code;</li>
          <li>use the Platform for anything unlawful.</li>
        </ul>
      </>
    ),
  },
  {
    id: "events",
    title: "Events and registrations",
    content: (
      <>
        <p>
          Workshops, hackathons, seminars and other events are organised by the chapter and may be
          changed, rescheduled or cancelled. Some events use external registration links, which are
          subject to the terms of those services. When attending, follow venue rules and instructions
          from organisers, and take reasonable care of your own belongings and safety.
        </p>
      </>
    ),
  },
  {
    id: "moderation",
    title: "Moderation and enforcement",
    content: (
      <>
        <p>
          Chapter administrators may pin, lock or remove discussions, replies and comments, and may
          warn, restrict or suspend accounts that break these terms or the Code of Conduct. Where
          appropriate, serious matters may be referred to university authorities.
        </p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party content and links",
    content: (
      <>
        <p>
          The Platform shows technology headlines from third-party sources and links to external sites.
          We do not control or endorse that content and are not responsible for it. ACM and the ACM
          logo belong to the Association for Computing Machinery.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers and liability",
    content: (
      <>
        <p>
          The Platform is run by student volunteers and is provided "as is" and "as available". We do
          not guarantee that it will be uninterrupted, error free or free from loss of data.
        </p>
        <p>
          To the fullest extent permitted by law, the chapter and its volunteers are not liable for
          indirect or consequential losses arising from your use of the Platform or from events.
          Nothing in these terms limits liability that cannot be limited by law.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Ending your account",
    content: (
      <p>
        You may stop using the Platform at any time and ask us to delete your account. We may suspend
        or close accounts that break these terms. Sections that by their nature should continue, such
        as the licence to content already shared and the disclaimers, will continue after an account
        closes.
      </p>
    ),
  },
  {
    id: "changes-law",
    title: "Changes and governing law",
    content: (
      <>
        <p>
          We may update these terms. If you keep using the Platform after a change takes effect, you
          accept the updated terms. These terms are governed by the laws of India. Questions can be
          sent to the chapter through the links in the footer of this site.
        </p>
      </>
    ),
  },
];

const Terms = () => (
  <LegalPage
    current="/terms"
    title="Terms & Conditions"
    description="The terms for using the ACM XIM Student Chapter platform, including accounts, content, events and acceptable use."
    updated="30 October 2026"
    intro="The ground rules for using the ACM XIM platform: your account, your content, and how we keep the community running well."
    sections={SECTIONS}
  />
);

export default Terms;
