/**
 * EventDetail Page
 *
 * Dedicated page for a single chapter event at /events/:id.
 *
 * Scope note: the backend Event model stores exactly six meaningful fields —
 * title, description, date, location, registrationLink, and isPast. This page
 * presents those well and derives status and registration state from them. It
 * deliberately does not display seats, eligibility, prizes, schedules, or
 * speaker profiles, because the API holds no such data and inventing it would
 * mislead visitors.
 *
 * @component
 */

import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchEvent, fetchEvents } from "../api/events";
import { extractArray } from "../utils/api";
import {
  eventSchema,
  formatEventDate,
  formatEventTime,
  getEventStatus,
  getRegistrationState,
  isOnlineLocation,
  summarize,
  toISODate,
} from "../utils/events";
import { breadcrumbSchema, SOCIAL_LINKS } from "../constants/site";
import { EVENT_DETAIL, EVENTS } from "../constants/copy";
import Seo from "../components/Seo";
import EventCard from "../components/EventCard";
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  ExternalLinkIcon,
  MapPinIcon,
  UserIcon,
} from "../components/ui/Icons";

/** Maps a lifecycle status onto its badge variant. */
const STATUS_BADGE = {
  today: "badge--live",
  upcoming: "badge--upcoming",
  past: "badge--closed",
  unscheduled: "badge--pending",
};

/** Maps a registration state onto its badge variant. */
const REGISTRATION_BADGE = {
  open: "badge--open",
  closed: "badge--closed",
  pending: "badge--pending",
};

/** Placeholder that mirrors the loaded layout so nothing shifts on arrival. */
const DetailSkeleton = () => (
  <div className="card" aria-hidden="true">
    <div className="skeleton skeleton-line skeleton-line--title" />
    <div className="skeleton skeleton-line skeleton-line--short" />
    <div style={{ height: "var(--spacing-24)" }} />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line" />
    <div className="skeleton skeleton-line skeleton-line--short" />
  </div>
);

const EventDetail = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const res = await fetchEvent(id);
        if (signal?.aborted) return;
        setEvent(res.data);
      } catch (err) {
        if (signal?.aborted) return;
        if (err?.response?.status === 404) setNotFound(true);
        else setError(EVENT_DETAIL.ERROR_LOAD);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // Related events are a nice-to-have. A failure here must never surface as a
  // page error, so it is loaded separately and fails silently.
  useEffect(() => {
    let cancelled = false;

    fetchEvents({ limit: 12 })
      .then((res) => {
        if (cancelled) return;
        const all = extractArray(res.data, ["data", "events"]);
        setRelated(
          all
            .filter((item) => item._id !== id && !getEventStatus(item).isPast)
            .slice(0, 3)
        );
      })
      .catch(() => {
        /* Silent: the related-events section simply does not render. */
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const breadcrumb = (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">{EVENT_DETAIL.BREADCRUMB_HOME}</Link>
        </li>
        <li aria-hidden="true" className="breadcrumb-sep">
          /
        </li>
        <li>
          <Link to="/events">{EVENT_DETAIL.BREADCRUMB_EVENTS}</Link>
        </li>
        {event?.title && (
          <>
            <li aria-hidden="true" className="breadcrumb-sep">
              /
            </li>
            <li aria-current="page">{event.title}</li>
          </>
        )}
      </ol>
    </nav>
  );

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="page">
        <Seo title="Event" noindex />
        {breadcrumb}
        <p className="sr-only" role="status" aria-live="polite">
          {EVENT_DETAIL.LOADING}
        </p>
        <DetailSkeleton />
      </div>
    );
  }

  /* ── Not found ───────────────────────────────────────────────────────── */
  if (notFound) {
    return (
      <div className="page">
        {/* A missing event must not be indexed. */}
        <Seo
          title={EVENT_DETAIL.NOT_FOUND_TITLE}
          description={EVENT_DETAIL.NOT_FOUND_MESSAGE}
          noindex
        />
        {breadcrumb}
        <div className="state-panel">
          <CalendarIcon size={28} />
          <h1 className="state-title">{EVENT_DETAIL.NOT_FOUND_TITLE}</h1>
          <p className="state-message">{EVENT_DETAIL.NOT_FOUND_MESSAGE}</p>
          <Link to="/events" className="btn btn--secondary">
            <ArrowLeftIcon size={14} /> {EVENT_DETAIL.BACK}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Load failure ────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="page">
        <Seo title="Event" noindex />
        {breadcrumb}
        <div className="state-panel" role="alert">
          <AlertCircleIcon size={28} />
          <h1 className="state-title">{EVENT_DETAIL.NOT_FOUND_TITLE}</h1>
          <p className="state-message">{error}</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => load()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!event) return null;

  /* ── Loaded ──────────────────────────────────────────────────────────── */
  const status = getEventStatus(event);
  const registration = getRegistrationState(event);
  const online = isOnlineLocation(event.location);
  const time = formatEventTime(event.date);
  const isoDate = toISODate(event.date);

  const metaDescription = event.description
    ? summarize(event.description)
    : `${event.title} — an event from the ACM Student Chapter at XIM University on ${formatEventDate(
        event.date,
        { long: false }
      )}.`;

  return (
    <div className="page">
      <Seo
        title={event.title}
        description={metaDescription}
        type="article"
        // Past events stay reachable but are kept out of the index so search
        // results never point visitors at something they cannot attend.
        noindex={status.isPast}
        jsonLd={[
          eventSchema(event),
          breadcrumbSchema([
            { name: EVENT_DETAIL.BREADCRUMB_HOME, path: "/" },
            { name: EVENT_DETAIL.BREADCRUMB_EVENTS, path: "/events" },
            { name: event.title, path: `/events/${event._id}` },
          ]),
        ]}
      />

      {breadcrumb}

      <article>
        <header className="page-header">
          <div className="event-detail-badges">
            <span className={`badge ${STATUS_BADGE[status.status]}`}>
              {status.label}
            </span>
            <span className={`badge ${REGISTRATION_BADGE[registration.state]}`}>
              {registration.label}
            </span>
          </div>

          <h1 className="page-title">{event.title}</h1>

          <dl className="meta-list meta-list--inline event-detail-meta">
            <div className="meta-block">
              <dt className="meta-key">
                <CalendarIcon size={13} /> {EVENT_DETAIL.LABEL_DATE}
              </dt>
              <dd className="meta-val">
                {isoDate ? (
                  <time dateTime={isoDate}>{formatEventDate(event.date)}</time>
                ) : (
                  formatEventDate(event.date)
                )}
              </dd>
            </div>

            {/* Only rendered when the record actually carries a time of day. */}
            {time && (
              <div className="meta-block">
                <dt className="meta-key">
                  <ClockIcon size={13} /> {EVENT_DETAIL.LABEL_TIME}
                </dt>
                <dd className="meta-val">{time}</dd>
              </div>
            )}

            {event.location && (
              <div className="meta-block">
                <dt className="meta-key">
                  <MapPinIcon size={13} />{" "}
                  {online
                    ? EVENT_DETAIL.LABEL_ONLINE_VENUE
                    : EVENT_DETAIL.LABEL_VENUE}
                </dt>
                <dd className="meta-val">{event.location}</dd>
              </div>
            )}

            <div className="meta-block">
              <dt className="meta-key">
                <UserIcon size={13} /> {EVENT_DETAIL.LABEL_ORGANISER}
              </dt>
              <dd className="meta-val">{EVENT_DETAIL.ORGANISER_VALUE}</dd>
            </div>
          </dl>
        </header>

        {event.description && (
          <section className="event-detail-section" aria-labelledby="about-heading">
            <h2 id="about-heading" className="section-heading">
              {EVENT_DETAIL.ABOUT_HEADING}
            </h2>
            <p className="prose">{event.description}</p>
          </section>
        )}

        <section
          className="event-detail-section"
          aria-labelledby="registration-heading"
        >
          <h2 id="registration-heading" className="section-heading">
            {EVENT_DETAIL.REGISTRATION_HEADING}
          </h2>

          <div className="card event-register-card">
            <p className="meta-val">{registration.hint}</p>

            {registration.state === "open" && (
              <>
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                >
                  {EVENT_DETAIL.BUTTON_REGISTER}
                  <ExternalLinkIcon size={14} />
                </a>
                <p className="field-hint">{EVENT_DETAIL.REGISTER_NOTE}</p>
              </>
            )}
          </div>
        </section>

        <section className="event-detail-section" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="section-heading">
            {EVENT_DETAIL.CONTACT_HEADING}
          </h2>
          <p className="meta-val" style={{ marginBottom: "var(--spacing-12)" }}>
            {EVENT_DETAIL.CONTACT_MESSAGE}
          </p>
          <ul className="event-contact-links">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.name}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--outline btn--sm"
                >
                  {link.name}
                  <ExternalLinkIcon size={12} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>

      {related.length > 0 && (
        <section className="event-detail-section" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-heading">
            {EVENT_DETAIL.RELATED_HEADING}
          </h2>
          <div className="events-grid" style={{ marginTop: "var(--spacing-16)" }}>
            {related.map((item) => (
              <EventCard key={item._id} event={item} />
            ))}
          </div>
        </section>
      )}

      <div className="event-detail-footer">
        <Link to="/events" className="btn btn--outline">
          <ArrowLeftIcon size={14} /> {EVENTS.HEADING}
        </Link>
      </div>
    </div>
  );
};

export default EventDetail;
