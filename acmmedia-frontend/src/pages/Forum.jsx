import React, { useEffect, useState, useContext } from 'react';
import { fetchThreads, createThread, deleteThread, replyToThread } from '../api/forum';
import { AuthContext } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Forum = () => {
    const [threads, setThreads] = useState([]);
    const [newThread, setNewThread] = useState({ title: '', description: '' });
    const { user } = useContext(AuthContext);
    const [isConnected, setIsConnected] = useState(false);
    const socket = useSocket();

    useEffect(() => {
        fetchThreads().then(res => setThreads(res.data));
    }, []);

    useEffect(() => {
        if (!socket) return;

        setIsConnected(socket.connected);

        const onNewReply = (data) => {
            console.log('Real-time reply received:', data);
            setThreads(prevThreads =>
                prevThreads.map(thread =>
                    thread._id === data.threadId
                        ? { ...thread, replies: data.replies }
                        : thread
                )
            );
        };

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('forum:new-reply', onNewReply);

        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('forum:new-reply', onNewReply);
        };
    }, [socket]);

    const handleCreateThread = async (e) => {
        e.preventDefault();
        try {
            const { data } = await createThread(newThread);
            setThreads([data, ...threads]);
            setNewThread({ title: '', description: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteThread = async (id) => {
        if (!window.confirm("Delete this thread?")) return;
        try {
            await deleteThread(id);
            setThreads(threads.filter(t => t._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="forum-page">
            {/* Header */}
            <header className="forum-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                    <h2 style={{ margin: 0 }}>Discussion Forum</h2>
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
                                                        await replyToThread(
                                                            t._id,
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
