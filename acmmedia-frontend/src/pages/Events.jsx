/**
 * Events Page
 * 
 * Displays chapter events (workshops, hackathons, seminars).
 * Events are sorted by date and include registration links.
 * 
 * Features:
 * - Public event listing with rich metadata
 * - Admin delete controls for content moderation
 * - Graceful empty state when no events are scheduled
 * - External registration link support
 * 
 * @page
 */

import React, { useEffect, useState, useContext } from "react";
import { fetchEvents, deleteEvent } from "../api/events";
import { AuthContext } from "../context/AuthContext";
import { extractArray } from "../utils/api";

const Events = () => {
  const [events, setEvents] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents().then((res) => setEvents(extractArray(res.data, ["data", "events"])));
  }, []);

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to permanently remove this event from the portal?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error: Unable to delete the event. Please try again later.");
    }
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <h2 className="section-title">Chapter Events & Technical Engagements</h2>
        <p className="section-subtitle">
          Explore high-impact Events, workshops, hackathons, and seminars curated by the
          <strong> ACM Student Chapter of XIM University</strong>. Stay informed
          and registered through the central Envoy platform.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="empty-state-container">
          <p className="no-events">
            No scheduled engagements found. Follow our announcements for upcoming
            technical sessions and chapter activities.
          </p>
        </div>
      ) : (
        <section className="events-grid">
          {events.map((event) => (
            <article key={event._id} className="event-card">
              <div className="event-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 className="event-title">{event.title}</h3>
                {user && user.role === "admin" && (
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="admin-delete-btn"
                    style={{
                      background: "#dc2626", color: "white", border: "none",
                      padding: "0.4rem 0.8rem", borderRadius: "6px", cursor: "pointer",
                      fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase",
                      letterSpacing: "0.05em", marginLeft: "1rem",
                    }}
                  >
                    Delete Record
                  </button>
                )}
              </div>

              <p className="event-description">{event.description}</p>

              <div className="event-meta">
                <div className="meta-item">
                  <span className="meta-label">Schedule Date</span>
                  <span className="meta-value">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long", year: "numeric", month: "long", day: "numeric",
                    })}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Venue / Mode</span>
                  <span className="meta-value">{event.location}</span>
                </div>
              </div>

              {event.registrationLink && (
                <div className="event-action-wrapper">
                  <a href={event.registrationLink} target="_blank" rel="noreferrer" className="event-register">
                    Registration Link <span className="arrow-icon"> →</span>
                  </a>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Events;
