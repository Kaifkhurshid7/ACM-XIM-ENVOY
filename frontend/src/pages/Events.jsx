import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Events = () => {
    const [events, setEvents] = useState([]);

    const { user } = useContext(AuthContext);

    useEffect(() => {
        api.get('/events').then(res => setEvents(res.data));
    }, []);

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            setEvents(events.filter(e => e._id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete event");
        }
    };

    return (
        <div className="events-page">
            {/* Header */}
            <header className="events-header">
                <h2>Chapter Events</h2>
                <p>
                    Official workshops, hackathons, seminars, and academic activities
                    organized by the ACM Student Chapter under the ACM-XIM-ENVOY platform.
                </p>
            </header>

            {/* Content */}
            {events.length === 0 ? (
                <p className="no-events">
                    There are no upcoming events at the moment. Please check back soon.
                </p>
            ) : (
                <section className="events-grid">
                    {events.map(event => (
                        <article key={event._id} className="event-card">
                            <div className="event-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h3>{event.title}</h3>
                                {user && user.role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteEvent(event._id)}
                                        style={{
                                            background: '#ff4444',
                                            color: 'white',
                                            border: 'none',
                                            padding: '0.3rem 0.8rem',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            marginLeft: '1rem'
                                        }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <p className="event-description">
                                {event.description}
                            </p>

                            <div className="event-meta">
                                <div>
                                    <span className="meta-label">Date</span>
                                    <span>
                                        {new Date(event.date).toLocaleDateString()}
                                    </span>
                                </div>

                                <div>
                                    <span className="meta-label">Location</span>
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            {event.registrationLink && (
                                <a
                                    href={event.registrationLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="event-register"
                                >
                                    View Registration →
                                </a>
                            )}
                        </article>
                    ))}
                </section>
            )}
        </div>
    );
};

export default Events;
