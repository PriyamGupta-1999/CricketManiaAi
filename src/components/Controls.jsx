import React from 'react';

const Controls = ({ onBowl, disabled }) => {
    return (
        <div className="controls">
            <button
                onClick={onBowl}
                disabled={disabled}
                className="bowl-btn"
            >
                BOWL
            </button>
        </div>
    );
};

export default Controls;
