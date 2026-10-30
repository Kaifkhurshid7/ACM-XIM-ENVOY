import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchEvents, deleteEvent } from "../api/events";
import { AuthContext } from "../context/AuthContext";
import { extractArray } from "../utils/api";
import { EVENTS, CONFIRMATIONS } from "../constants/copy";
import {
  parseEventDate,
  formatEventDate,
  formatEventTime,
  getEventStatus,
  getRegistrationState,
  groupEventsByStatus,
  isOnlineLocation,
  EVENT_STATUS,
} from "../utils/events";
import Seo from "../components/Seo";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { CalendarIcon, MapPinIcon, ExternalLinkIcon, TrashIcon, ClockIcon } from "../components/ui/Icons";
import "../styles/events-page.css";

/** Calendar parts for an event, honouring the UTC anchoring of date-only values. */
const dateParts = (value) => {
  const d = parseEventDate(value);
  if (!d) return null;
  const dateOnly =
    d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0;
  const y = dateOnly ? d.getUTCFullYear() : d.getFullYear();
  const m = dateOnly ? d.getUTCMonth() : d.getMonth();
  const day = dateOnly ? d.getUTCDate() : d.getDate();
  const weekday = new Date(y, m, day).toLocaleDateString("en-IN", { weekday: "short" });
  return {
    day: String(day).padStart(2, "0"),
    mon: new Date(y, m, day).toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    weekday,
    monthKey: `${y}-${String(m + 1).padStart(2, "0")}`,
    monthLabel: new Date(y, m, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
    daysAway: Math.round((new Date(y, m, day) - new Date(new Date().setHours(0, 0, 0, 0))) / 86400000),
  };
};

const countdown = (event) => {
  const { status } = getEventStatus(event);
  if (status === EVENT_STATUS.TODAY) return "Today";
  const parts = dateParts(event.date);
  if (!parts || parts.daysAway < 0) return null;
  if (parts.daysAway === 1) return "Tomorrow";
  return `In ${parts.daysAway} days`;
};

const Meta = ({ event }) => {
  const time = formatEventTime(event.date);
  const online = isOnlineLocation(event.location);
  return (
    <ul className="ev-meta">
      <li><CalendarIcon size={15} />{formatEventDate(event.date)}</li>
      {time && <li><ClockIcon size={15} />{time}</li>}
      {event.location && (
        <li>
          <MapPinIcon size={15} />
          {event.location}
          {online && <span className="ev-online">Online</span>}
        </li>
      )}
    </ul>
  );
};

const Actions = ({ event, isAdmin, onDelete, large }) => {
  const reg = getRegistrationState(event);
  return (
    <div className="ev-actions">
      {reg.state === "open" ? (
        <a
          href={event.registrationLink}
          target="_blank"
          rel="noreferrer"
          className={`ev-btn ev-btn--primary ${large ? "ev-btn--lg" : ""}`}
          aria-label={`Register for ${event.title}`}
        >
          Register <ExternalLinkIcon size={14} />
        </a>
      ) : (
        <span className={`ev-reg ev-reg--${reg.state}`}>{reg.label}</span>
      )}
      {isAdmin && (
        <button
          type="button"
          className="ev-btn ev-btn--danger"
          onClick={() => onDelete(event._id)}
          aria-label={`Delete event: ${event.title}`}
        >
          <TrashIcon size={14} /> Delete
        </button>
      )}
    </div>
  );
};

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [tab, setTab] = useState("upcoming");
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEvents();
      setEvents(extractArray(res.data, ["data", "events"]));
      setError(null);
    } catch {
      setError(EVENTS.ERROR_LOAD);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteEvent = (id) => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_EVENT,
      onConfirm: async () => {
        try {
          await deleteEvent(id);
          setEvents((prev) => prev.filter((e) => e._id !== id));
          setToast({ type: "success", message: "Event deleted." });
        } catch {
          setToast({ type: "error", message: EVENTS.ERROR_DELETE });
        }
      },
    });
  };

  const { upcoming, past } = useMemo(() => groupEventsByStatus(events), [events]);

  // With nothing upcoming, open on the past tab so the page is never empty by default.
  useEffect(() => {
    if (!loading && upcoming.length === 0 && past.length > 0) setTab("past");
  }, [loading, upcoming.length, past.length]);

  const list = tab === "upcoming" ? upcoming : past;
  const featured = tab === "upcoming" ? list[0] : null;
  const rows = tab === "upcoming" ? list.slice(1) : list;

  const months = useMemo(() => {
    const groups = [];
    rows.forEach((event) => {
      const p = dateParts(event.date);
      const key = p?.monthKey || "tba";
      let g = groups[groups.length - 1];
      if (!g || g.key !== key) {
        g = { key, label: p?.monthLabel || "Date to be announced", items: [] };
        groups.push(g);
      }
      g.items.push(event);
    });
    return groups;
  }, [rows]);

  return (
    <div className="ev">
      <Seo title="Events & Workshops" description="Upcoming ACM XIM workshops, hackathons, seminars and technical sessions." />

      <header className="ev-masthead">
        <div>
          <p className="ev-kicker">// Events</p>
          <h1>{EVENTS.HEADING}</h1>
          <p className="ev-sub">{EVENTS.SUBHEADING}</p>
        </div>

        <div className="ev-tabs" role="tablist" aria-label="Event timeline">
          <button type="button" role="tab" aria-selected={tab === "upcoming"} className={tab === "upcoming" ? "active" : ""} onClick={() => setTab("upcoming")}>
            Upcoming <span>{upcoming.length}</span>
          </button>
          <button type="button" role="tab" aria-selected={tab === "past"} className={tab === "past" ? "active" : ""} onClick={() => setTab("past")}>
            Past <span>{past.length}</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="ev-skeleton" role="status" aria-live="polite" aria-label={EVENTS.LOADING}>
          <div className="ev-skel ev-skel--hero" />
          {[0, 1, 2].map((i) => <div key={i} className="ev-skel" />)}
        </div>
      ) : error ? (
        <div className="ev-state" role="alert">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button type="button" className="ev-btn ev-btn--primary" onClick={load}>Try again</button>
        </div>
      ) : list.length === 0 ? (
        <div className="ev-state" role="status">
          <span className="ev-state-icon"><CalendarIcon size={28} /></span>
          <h2>{tab === "upcoming" ? "Nothing on the calendar yet" : "No past events"}</h2>
          <p>{EVENTS.EMPTY}</p>
          <div className="ev-state-actions">
            <a className="ev-btn ev-btn--primary" href="https://www.instagram.com/xim_acm/" target="_blank" rel="noopener noreferrer">
              Follow on Instagram
            </a>
            <a className="ev-btn" href="https://www.linkedin.com/company/xim-acm/" target="_blank" rel="noopener noreferrer">
              Suggest an event
            </a>
          </div>
        </div>
      ) : (
        <>
          {featured && (() => {
            const p = dateParts(featured.date);
            const status = getEventStatus(featured);
            const when = countdown(featured);
            return (
              <article className="ev-featured" aria-label="Next event">
                <div className="ev-featured-date" aria-hidden="true">
                  <span>{p?.mon || "TBA"}</span>
                  <strong>{p?.day || "--"}</strong>
                  <em>{p?.weekday}</em>
                </div>
                <div className="ev-featured-body">
                  <div className="ev-chips">
                    <span className="ev-chip ev-chip--solid">Next up</span>
                    {when && <span className="ev-chip">{when}</span>}
                    {status.status === EVENT_STATUS.TODAY && <span className="ev-chip ev-chip--live">Happening today</span>}
                  </div>
                  <h2>{featured.title}</h2>
                  {featured.description && <p className="ev-desc">{featured.description}</p>}
                  <Meta event={featured} />
                  <Actions event={featured} isAdmin={isAdmin} onDelete={handleDeleteEvent} large />
                </div>
              </article>
            );
          })()}

          {months.map((group) => (
            <section key={group.key} className="ev-month" aria-label={group.label}>
              <h2 className="ev-month-title">{group.label}</h2>
              <ol className="ev-list">
                {group.items.map((event) => {
                  const p = dateParts(event.date);
                  const status = getEventStatus(event);
                  return (
                    <li key={event._id} className={`ev-row ${status.isPast ? "is-past" : ""}`}>
                      <div className="ev-row-date" aria-hidden="true">
                        <strong>{p?.day || "--"}</strong>
                        <span>{p?.mon || "TBA"}</span>
                        <em>{p?.weekday}</em>
                      </div>
                      <article className="ev-card">
                        <div className="ev-card-head">
                          <h3>{event.title}</h3>
                          {status.isPast && <span className="ev-chip">Completed</span>}
                          {status.status === EVENT_STATUS.TODAY && <span className="ev-chip ev-chip--live">Today</span>}
                        </div>
                        {event.description && <p className="ev-desc">{event.description}</p>}
                        <Meta event={event} />
                        <Actions event={event} isAdmin={isAdmin} onDelete={handleDeleteEvent} />
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default Events;
