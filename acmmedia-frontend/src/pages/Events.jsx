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
    if (!window.confirm("Delete this event permanently? This action cannot be undone.")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      alert("Unable to delete this event. Please try again.");
    }
  };

  return (
    <div className="events-page">
      <header className="events-header">
        <h2 className="section-title">Events & Engagements</h2>
        <p className="section-subtitle">
          Workshops, hackathons, seminars, and technical sessions curated by the ACM Student Chapter.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="empty-state-container">
          <p className="no-events">No upcoming events. Check back soon for new sessions and activities.</p>
        </div>
      ) : (
        <section className="events-grid">
          {events.map((event) => (
            <article key={event._id} className="event-card">
              <div className="event-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <h3 className="event-title">{event.title}</h3>
                {user?.role === "admin" && (
                  <button onClick={() => handleDeleteEvent(event._id)} className="admin-delete-btn">Delete</button>
                )}
              </div>
              <p className="event-description">{event.description}</p>
              <div className="event-meta">
                <div className="meta-item">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">
                    {new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{event.location}</span>
                </div>
              </div>
              {event.registrationLink && (
                <div className="event-action-wrapper">
                  <a href={event.registrationLink} target="_blank" rel="noreferrer" className="event-register">Register →</a>
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
