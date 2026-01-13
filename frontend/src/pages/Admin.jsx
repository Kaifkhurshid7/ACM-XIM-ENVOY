import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [postData, setPostData] = useState({ title: '', content: '' });
    const [eventData, setEventData] = useState({ title: '', description: '', date: '', location: '', registrationLink: '' });
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if not logged in or not admin
    useEffect(() => {
        if (!user) navigate('/login');
        else if (user.role !== 'admin') navigate('/');
    }, [user, navigate]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            await api.post('/posts', postData);
            alert("Post created successfully!");
            setPostData({ title: '', content: '' });
        } catch (err) {
            alert("Failed to create post.");
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', eventData);
            alert("Event created successfully!");
            setEventData({ title: '', description: '', date: '', location: '', registrationLink: '' });
        } catch (err) {
            alert("Failed to create event.");
        }
    };

    return (
        <div className="admin-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* HEADER */}
            <header style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Admin Control Panel
                </h1>
                <p style={{ color: '#aaa', maxWidth: '700px' }}>
                    Welcome to the <strong>ACM-XIM-ENVOY</strong> administration dashboard.
                    From here, administrators can publish official chapter news, manage events,
                    and monitor platform engagement for the ACM Student Chapter.
                </p>
            </header>

            {/* MAIN ACTIONS */}
            <section
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3rem',
                    alignItems: 'start'
                }}
            >
                {/* CREATE POST */}
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>Publish Chapter News</h2>
                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
                        Use this section to post official announcements, achievements,
                        notices, or updates that will appear on the main feed.
                    </p>

                    <form onSubmit={handleCreatePost}>
                        <input
                            type="text"
                            placeholder="News Title"
                            value={postData.title}
                            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                            required
                        />

                        <textarea
                            placeholder="Write detailed news content here..."
                            value={postData.content}
                            onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                            required
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '1rem',
                                minHeight: '150px'
                            }}
                        />

                        <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                            Publish News
                        </button>
                    </form>
                </div>

                {/* CREATE EVENT */}
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px' }}>
                    <h2 style={{ marginBottom: '0.5rem' }}>Create & Schedule Event</h2>
                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
                        Add upcoming workshops, hackathons, seminars, or competitions.
                        These events will be visible to all platform users.
                    </p>

                    <form onSubmit={handleCreateEvent}>
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={eventData.title}
                            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                            required
                        />

                        <input
                            type="date"
                            value={eventData.date}
                            onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Event Location / Mode (Online / Offline)"
                            value={eventData.location}
                            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Registration Link (optional)"
                            value={eventData.registrationLink}
                            onChange={(e) => setEventData({ ...eventData, registrationLink: e.target.value })}
                        />

                        <textarea
                            placeholder="Describe the event, agenda, speakers, and eligibility..."
                            value={eventData.description}
                            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            required
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                color: 'white',
                                borderRadius: '10px',
                                padding: '1rem',
                                minHeight: '150px'
                            }}
                        />

                        <button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
                            Add Event
                        </button>
                    </form>
                </div>
            </section>

            {/* CONTENT MANAGEMENT INFO */}
            <section
                style={{
                    marginTop: '4rem',
                    padding: '2.5rem',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.05)',
                    textAlign: 'center'
                }}
            >
                <h2 style={{ color: 'var(--primary)' }}>Content Moderation & Management</h2>
                <p style={{ color: '#aaa', maxWidth: '700px', margin: '1rem auto' }}>
                    Administrators have extended privileges across the platform.
                    You can manage posts, remove inappropriate content,
                    and moderate discussions directly from the main feed.
                </p>

                <button
                    onClick={() => navigate('/')}
                    style={{
                        marginTop: '1.5rem',
                        padding: '0.9rem 2rem',
                        fontSize: '1rem',
                        background: 'transparent',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)'
                    }}
                >
                    ← Go to Main Feed
                </button>
            </section>

            {/* ANALYTICS */}
            <section
                style={{
                    marginTop: '3rem',
                    padding: '2.5rem',
                    borderRadius: '18px',
                    border: '1px solid var(--primary)',
                    background: 'var(--card-bg)'
                }}
            >
                <h2>Platform Insights & Overview</h2>
                <p style={{ color: '#aaa', maxWidth: '600px' }}>
                    This section provides a quick overview of platform engagement
                    and user activity. (Static preview – can be connected to real analytics later.)
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: '2rem',
                        marginTop: '2rem',
                        flexWrap: 'wrap'
                    }}
                >
                    <div style={{ flex: 1, minWidth: '220px', padding: '1.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '12px' }}>
                        <h4 style={{ color: 'var(--secondary)' }}>User Engagement</h4>
                        <p>👍 Likes: 120+</p>
                        <p>💬 Comments: 45+</p>
                        <p>📰 Posts Published: 30+</p>
                    </div>

                    <div style={{ flex: 1, minWidth: '220px', padding: '1.5rem', background: 'rgba(0,0,0,0.25)', borderRadius: '12px' }}>
                        <h4 style={{ color: 'var(--secondary)' }}>User Base</h4>
                        <p>👥 Members: 200+</p>
                        <p>🛡️ Admins: 2</p>
                        <p>🕒 Active Sessions: High</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Admin;
