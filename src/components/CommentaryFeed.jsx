import React from 'react';

const CommentaryFeed = ({ commentary }) => {
    return (
        <div className="commentary-feed">
            <h3>Live Commentary</h3>
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
