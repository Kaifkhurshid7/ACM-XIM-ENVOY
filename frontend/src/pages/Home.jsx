import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import TechPulse from "../components/TechPulse";

export default function Home() {
    const [posts, setPosts] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        api.get("/posts").then(res => setPosts(res.data));
    }, []);

    const handleDeletePost = (id) => {
        setPosts(posts.filter(p => p._id !== id));
    };

    return (
        <div className="home-wrapper">
            <TechPulse mode="ticker" />
            {/* Page Header */}
            <header className="home-header">
                <h1>ACM-XIM-ENVOY</h1>
                <p>
                    Official announcements, achievements, and updates from the
                    ACM Student Chapter.
                </p>
            </header>

            {/* Feed */}
            <section className="home-feed">
                {posts.length === 0 ? (
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
