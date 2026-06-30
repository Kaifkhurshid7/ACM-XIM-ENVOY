import { useEffect, useState, useContext } from "react";
import { fetchEvents, deleteEvent } from "../api/events";
import { AuthContext } from "../context/AuthContext";
import { extractArray } from "../utils/api";
import { EVENTS, CONFIRMATIONS } from "../constants/copy";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { CalendarIcon, MapPinIcon, ExternalLinkIcon, TrashIcon } from "../components/ui/Icons";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents().then((res) => setEvents(extractArray(res.data, ["data", "events"])));
  }, []);

  const handleDeleteEvent = (id) => {
    setConfirm({
      ...CONFIRMATIONS.DELETE_EVENT,
      onConfirm: async () => {
        try {
          await deleteEvent(id);
          setEvents(events.filter((e) => e._id !== id));
          setToast({ type: "success", message: "Event removed." });
        } catch (err) {
          setToast({ type: "error", message: EVENTS.ERROR_DELETE });
        }
      },
    });
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <h2 className="section-title">{EVENTS.HEADING}</h2>
        <p className="section-subtitle">{EVENTS.SUBHEADING}</p>
      </header>

      {events.length === 0 ? (
        <div className="empty-state-container" role="status">
          <CalendarIcon size={32} />
          <p className="no-events">{EVENTS.EMPTY}</p>
        </div>
      ) : (
        <section className="events-grid" aria-label="Upcoming events">
          {events.map((event) => (
            <article key={event._id} className="event-card">
              <div className="event-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 className="event-title">{event.title}</h3>
                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="admin-delete-btn"
                    aria-label={`Delete event: ${event.title}`}
                  >
                    <TrashIcon size={14} /> Remove
                  </button>
                )}
              </div>
              <p className="event-description">{event.description}</p>
              <div className="event-meta">
                <div className="meta-item">
                  <span className="meta-label">
                    <CalendarIcon size={14} /> {EVENTS.LABEL_DATE}
                  </span>
                  <span className="meta-value">
                    {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">
                    <MapPinIcon size={14} /> {EVENTS.LABEL_LOCATION}
                  </span>
                  <span className="meta-value">{event.location}</span>
                </div>
              </div>
              {event.registrationLink && (
                <div className="event-action-wrapper">
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="event-register"
                    aria-label={`Register for ${event.title}`}
                  >
                    <ExternalLinkIcon size={14} /> {EVENTS.BUTTON_REGISTER}
                  </a>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog dialog={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
};

export default Events;
