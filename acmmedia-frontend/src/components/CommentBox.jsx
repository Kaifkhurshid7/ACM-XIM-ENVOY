import React, { useState } from 'react';

const CommentBox = ({ onAdd }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (!text.trim()) return;
        onAdd(text);
        setText('');
    };

    return (
        <div className="comment-box" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                style={{ flex: 1, padding: '0.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
            />
            <button onClick={handleSubmit} style={{ padding: '0.5rem 1rem' }}>Send</button>
        </div>
    );
};

export default CommentBox;
