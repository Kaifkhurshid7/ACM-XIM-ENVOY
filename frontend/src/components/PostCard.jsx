import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import CommentBox from './CommentBox';

const PostCard = ({ post, onDelete }) => {
    const { user } = useContext(AuthContext);
    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [loadingComments, setLoadingComments] = useState(false);

    const isLiked = user && likes.includes(user._id);
    const isAdmin = user && user.role === 'admin';

    const handleLike = async () => {
        if (!user) return alert('Please login to like posts');
        try {
            const { data } = await api.put(`/posts/like/${post._id}`);
            // Backend returns the updated likes array
            setLikes(data);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const { data } = await api.get(`/comments/${post._id}`);
                setComments(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (text) => {
        if (!user) return alert("Login to comment");
        try {
            const { data } = await api.post('/comments', { postId: post._id, text });
            setComments([data, ...comments]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await api.delete(`/comments/${commentId}`);
            setComments(comments.filter(c => c._id !== commentId));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        try {
            await api.delete(`/posts/${post._id}`);
            if (onDelete) onDelete(post._id);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="post-card">
            <h3>{post.title}</h3>
            <p style={{ lineHeight: '1.6' }}>{post.content}</p>

            <div className="post-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={handleLike}
                        style={{
                            padding: '0.5rem 1rem',
                            background: isLiked ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            color: isLiked ? 'black' : 'white'
                        }}
                    >
                        {isLiked ? '❤️' : '🤍'} {likes.length}
                    </button>
                    <button
                        onClick={toggleComments}
                        style={{ padding: '0.5rem 1rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                    >
                        💬 Comments
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ opacity: 0.6, fontSize: '0.9rem' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={handleDeletePost}
                            style={{ background: '#ff4444', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                            Delete Post
                        </button>
                    )}
                </div>
            </div>

            {showComments && (
                <div className="comments-section" style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px' }}>
                    <CommentBox onAdd={handleAddComment} />

                    {loadingComments ? (
                        <p style={{ textAlign: 'center', color: '#aaa' }}>Loading comments...</p>
                    ) : (
                        <div style={{ marginTop: '1rem' }}>
                            {comments.length === 0 && <p style={{ color: '#aaa', fontStyle: 'italic' }}>No comments yet.</p>}
                            {comments.map(c => (
                                <div key={c._id} style={{ padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--secondary)', fontSize: '0.9rem' }}>
                                            {c.user?.name || "Unknown User"}
                                        </span>
                                        {isAdmin && (
                                            <span
                                                onClick={() => handleDeleteComment(c._id)}
                                                style={{ color: '#ff4444', cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                Delete
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{c.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PostCard;
