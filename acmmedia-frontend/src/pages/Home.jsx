import React, { useEffect, useState, useContext } from "react";
import { fetchPosts } from "../api/posts";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import TechPulse from "../components/TechPulse";
import { useSocket } from "../context/SocketContext";
import { extractArray } from "../utils/api";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [postsError, setPostsError] = useState('');
    const { user } = useContext(AuthContext);

    const [isConnected, setIsConnected] = useState(false);
    const socket = useSocket();

    useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoadingPosts(true);
                setPostsError('');
                const res = await fetchPosts();
                setPosts(extractArray(res.data, ['posts', 'data']));
            } catch (err) {
                console.error('Failed to load posts', err);
                setPosts([]);
                setPostsError('Unable to load chapter updates right now.');
            } finally {
                setLoadingPosts(false);
            }
        };

        loadPosts();
    }, []);

    useEffect(() => {
        if (!socket) return;

        setIsConnected(socket.connected);

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);

        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket]);

    const handleDeletePost = (id) => {
        setPosts(posts.filter(p => p._id !== id));
    };

    return (
        <div className="home-wrapper">
            <TechPulse mode="ticker" />
            {/* Page Header */}
            <header className="home-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                    <h1 style={{ margin: 0 }}>ACM-XIM-ENVOY</h1>
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
                    Official announcements, achievements, and updates from the
                    ACM Student Chapter.
                </p>
            </header>

            {/* Feed */}
            <section className="home-feed">
                {loadingPosts ? (
                    <p className="home-empty">
                        Loading latest chapter updates...
                    </p>
                ) : postsError ? (
                    <p className="home-empty">
                        {postsError}
                    </p>
                ) : posts.length === 0 ? (
                    <p className="home-empty">
                        No updates available at the moment.
                    </p>
                ) : (
                    posts.map(p => (
                        <PostCard
                            key={p._id}
                            post={p}
                            onDelete={handleDeletePost}
                        />
                    ))
                )}
            </section>
        </div>
    );
}
