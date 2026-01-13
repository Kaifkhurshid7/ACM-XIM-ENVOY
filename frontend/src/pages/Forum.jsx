import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Forum = () => {
    const [threads, setThreads] = useState([]);
    const [newThread, setNewThread] = useState({ title: '', description: '' });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        api.get('/forum').then(res => setThreads(res.data));
    }, []);

    const handleCreateThread = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/forum', newThread);
            setThreads([data, ...threads]);
            setNewThread({ title: '', description: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteThread = async (id) => {
        if (!window.confirm("Delete this thread?")) return;
        try {
            await api.delete(`/forum/${id}`);
            setThreads(threads.filter(t => t._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="forum-page">
            {/* Header */}
            <header className="forum-header">
                <h2>Discussion Forum</h2>
                <p>
                    A collaborative space for academic, technical, and chapter-related
                    discussions. Ask questions, share insights, and learn together.
                </p>
            </header>

            {/* New Thread */}
            {user && (
                <section className="forum-form">
                    <h3>Start a New Discussion</h3>
                    <form onSubmit={handleCreateThread}>
                        <input
                            type="text"
                            placeholder="Discussion title"
                            value={newThread.title}
                            onChange={(e) =>
                                setNewThread({ ...newThread, title: e.target.value })
                            }
                            required
                        />

                        <textarea
                            placeholder="Provide context, details, or your question"
                            value={newThread.description}
                            onChange={(e) =>
                                setNewThread({
                                    ...newThread,
                                    description: e.target.value
                                })
                            }
                            required
                        />

                        <button type="submit">Post Discussion</button>
                    </form>
                </section>
            )}

            {/* Threads */}
            <section className="threads-list">
                {threads.length === 0 ? (
                    <p className="forum-empty">
                        No discussions yet. Be the first to start one.
                    </p>
                ) : (
                    threads.map(t => (
                        <article key={t._id} className="thread-card">
                            <div className="thread-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3>{t.title}</h3>
                                {user && user.role === 'admin' && (
                                    <button
                                        onClick={() => handleDeleteThread(t._id)}
                                        style={{ background: '#ff4444', color: 'white', border: 'none', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>

                            <p className="thread-description">
                                {t.description}
                            </p>

                            <div className="replies-section">
                                <h4>Replies</h4>

                                {t.replies.length === 0 && (
                                    <p className="no-replies">
                                        No replies yet.
                                    </p>
                                )}

                                {t.replies.map((r, i) => (
                                    <div key={i} className="reply">
                                        {r.text}
                                    </div>
                                ))}

                                {user && (
                                    <div className="reply-input">
                                        <input
                                            type="text"
                                            placeholder="Write a reply and press Enter"
                                            onKeyDown={async (e) => {
                                                if (
                                                    e.key === 'Enter' &&
                                                    e.target.value.trim()
                                                ) {
                                                    const { data } =
                                                        await api.post(
                                                            `/forum/reply/${t._id}`,
                                                            { text: e.target.value }
                                                        );
                                                    setThreads(
                                                        threads.map(thread =>
                                                            thread._id === t._id
                                                                ? data
                                                                : thread
                                                        )
                                                    );
                                                    e.target.value = '';
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </article>
                    ))
                )}
            </section>
        </div>
    );
};

export default Forum;
