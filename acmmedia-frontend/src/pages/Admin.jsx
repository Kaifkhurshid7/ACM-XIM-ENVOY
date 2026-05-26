import React, { useState, useEffect, useContext } from 'react';
import { createPost, fetchPosts } from '../api/posts';
import { createEvent } from '../api/events';
import { fetchThreads } from '../api/forum';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { extractArray, extractErrorMessage } from '../utils/api';

const Admin = () => {
    const [stats, setStats] = useState({
        likes: 0,
        comments: 0,
        posts: 0,
        members: 0,
        admins: 0
    });
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [submittingPost, setSubmittingPost] = useState(false);
    const [submittingEvent, setSubmittingEvent] = useState(false);
    const socket = useSocket();

    const [postData, setPostData] = useState({ title: '', content: '' });
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        registrationLink: ''
    });

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const refreshFallbackStats = async () => {
        const [postsRes, threadsRes] = await Promise.all([
            fetchPosts(),
            fetchThreads()
        ]);

        const posts = extractArray(postsRes.data, ['posts', 'data']);
        const threads = extractArray(threadsRes.data, ['threads', 'data']);

        const localStats = {
            posts: posts.length,
            likes: posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0),
            comments: threads.reduce((acc, t) => acc + (t.replies?.length || 0), 0),
            members: 0
        };

        setStats(prev => ({ ...prev, ...localStats }));
    };

    // Fallback: Fetch initial data and count locally
    useEffect(() => {
        const fetchInitialStats = async () => {
            try {
                await refreshFallbackStats();
                setLoading(false);
            } catch (err) {
                console.error("Fallback analytics fetch failed", err);
                setLoading(false);
            }
        };

        fetchInitialStats();
    }, []);

    useEffect(() => {
        if (!socket) return;

        setIsConnected(socket.connected);

        const onConnect = () => {
            setIsConnected(true);
            socket.emit('analytics:request');
        };
        const onDisconnect = () => setIsConnected(false);
        const onAnalyticsUpdate = (data) => {
            console.log('Real-time analytics received:', data);
            // Prioritize backend data over client-side counts
            setStats(prev => ({ ...prev, ...data }));
            setLoading(false);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('analytics:update', onAnalyticsUpdate);

        if (socket.connected) {
            setIsConnected(true);
            socket.emit('analytics:request');
        }

        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000); // 5s timeout for initial sync

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('analytics:update', onAnalyticsUpdate);
            clearTimeout(timeout);
        };
    }, [socket]);

    // Protect admin route
    useEffect(() => {
        if (!user) navigate('/login');
        else if (user.role !== 'admin') navigate('/');
    }, [user, navigate]);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            setSubmittingPost(true);
            await createPost(postData);
            await refreshFallbackStats();
            alert('Post created successfully!');
            setPostData({ title: '', content: '' });
        } catch (err) {
            console.error(err);
            alert(extractErrorMessage(err, 'Failed to create post.'));
        } finally {
            setSubmittingPost(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            setSubmittingEvent(true);
            await createEvent(eventData);
            alert('Event created successfully!');
            setEventData({
                title: '',
                description: '',
                date: '',
                location: '',
                registrationLink: ''
            });
        } catch (err) {
            console.error(err);
            alert(extractErrorMessage(err, 'Failed to create event.'));
        } finally {
            setSubmittingEvent(false);
        }
    };

    return (
        <div className="admin-page">

            {/* HEADER */}
            <header className="admin-header">
                <h1>Admin Control Panel</h1>
                <p>
                    Welcome to the <strong>ACM-XIM-ENVOY</strong> administration dashboard.
                </p>
            </header>

            {/* MAIN ACTIONS */}
            <section className="admin-actions">

                {/* CREATE POST */}
                <div className="admin-card">
                    <h2>Publish Chapter News</h2>
                    <p>
                        Create official announcements, achievements, notices, and
                        updates that will appear on the main feed for all members.
                    </p>

                    <form onSubmit={handleCreatePost}>
                        <input
                            type="text"
                            placeholder="News Title"
                            value={postData.title}
                            onChange={(e) =>
                                setPostData({ ...postData, title: e.target.value })
                            }
                            required
                        />

                        <textarea
                            placeholder="Write detailed news content here..."
                            value={postData.content}
                            onChange={(e) =>
                                setPostData({ ...postData, content: e.target.value })
                            }
                            required
                        />

                        <button type="submit" disabled={submittingPost}>
                            {submittingPost ? 'Publishing...' : 'Publish News'}
                        </button>
                    </form>
                </div>

                {/* CREATE EVENT */}
                <div className="admin-card">
                    <h2>Create & Schedule Event</h2>
                    <p>
                        Add upcoming workshops, hackathons, seminars, or competitions.

                    </p>

                    <form onSubmit={handleCreateEvent}>
                        <input
                            type="text"
                            placeholder="Event Title"
                            value={eventData.title}
                            onChange={(e) =>
                                setEventData({ ...eventData, title: e.target.value })
                            }
                            required
                        />

                        <input
                            type="date"
                            value={eventData.date}
                            onChange={(e) =>
                                setEventData({ ...eventData, date: e.target.value })
                            }
                            required
                        />

                        <input
                            type="text"
                            placeholder="Event Location / Mode (Online / Offline)"
                            value={eventData.location}
                            onChange={(e) =>
                                setEventData({ ...eventData, location: e.target.value })
                            }
                            required
                        />

                        <input
                            type="text"
                            placeholder="Registration Link (optional)"
                            value={eventData.registrationLink}
                            onChange={(e) =>
                                setEventData({
                                    ...eventData,
                                    registrationLink: e.target.value
                                })
                            }
                        />

                        <textarea
                            placeholder="Describe agenda, speakers, eligibility, and details..."
                            value={eventData.description}
                            onChange={(e) =>
                                setEventData({
                                    ...eventData,
                                    description: e.target.value
                                })
                            }
                            required
                        />

                        <button type="submit" disabled={submittingEvent}>
                            {submittingEvent ? 'Saving Event...' : 'Add Event'}
                        </button>
                    </form>
                </div>
            </section>

            {/* CONTENT MANAGEMENT INFO */}
            <section className="admin-info">
                <h2>Content Moderation & Management</h2>
                <p>
                    Administrators have extended privileges across the platform.
                    You can manage posts, remove inappropriate content, and moderate
                    discussions directly from the main feed.
                </p>

                <button
                    className="admin-btn-outline"
                    onClick={() => navigate('/')}
                >
                    ← Go to Main Feed
                </button>
            </section>

            {/* ANALYTICS */}
            <section className="admin-analytics" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h2>Platform Insights & Overview</h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '20px',
                            background: isConnected ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                            color: isConnected ? '#4ade80' : '#f87171',
                            border: `1px solid ${isConnected ? '#4ade8055' : '#f8717155'}`
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: isConnected ? '#4ade80' : '#f87171',
                                boxShadow: isConnected ? '0 0 8px #4ade80' : 'none'
                            }}></span>
                            {isConnected ? 'LIVE' : 'DISCONNECTED'}
                        </div>
                    </div>
                </div>

                <p>
                    A high-level overview of platform engagement and user activity.
                </p>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                        <div className="loader-dots">Synchronizing analytics...</div>
                    </div>
                ) : (
                    <div className="analytics-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1.5rem',
                        marginTop: '2rem'
                    }}>
                        <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}></div>
                            <h4>Total Users</h4>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                {stats.members || 'Syncing...'}
                            </p>
                        </div>

                        <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}></div>
                            <h4>Total Posts</h4>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                {stats.posts}
                            </p>
                        </div>

                        <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}></div>
                            <h4>Total Comments</h4>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                {stats.comments}
                            </p>
                        </div>

                        <div className="analytics-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem' }}></div>
                            <h4>Total Likes</h4>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                {stats.likes}
                            </p>
                        </div>
                    </div>
                )}
            </section>

        </div>
    );
};

export default Admin;
