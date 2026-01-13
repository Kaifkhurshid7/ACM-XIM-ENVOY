import React from 'react';

const ForumCard = ({ forum }) => {
    return (
        <div className="forum-card">
            <h3>{forum?.name || 'Forum Name'}</h3>
            <p>{forum?.description || 'Forum description...'}</p>
        </div>
    );
};

export default ForumCard;
