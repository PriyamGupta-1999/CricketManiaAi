import React from 'react';

const CommentaryFeed = ({ commentary, loading }) => {
    return (
        <div className="commentary-feed">
            {loading && <div className="commentary-loading">Typing commentary...</div>}
            <ul>
                {commentary.map((comm) => (
                    <li key={comm.id} className="commentary-item">
                        {comm.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentaryFeed;
