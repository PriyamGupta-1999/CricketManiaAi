import React from 'react';

const Scoreboard = ({ score, wickets, overs }) => {
    return (
        <div className="scoreboard">
            <div className="score-container">
                <h1 className="score">{score}/{wickets}</h1>
                <p className="overs">Overs: {overs}</p>
            </div>
        </div>
    );
};

export default Scoreboard;
