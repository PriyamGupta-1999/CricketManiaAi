import React from 'react';

/**
 * Game activity controls for bowing and batting actions.
 * 
 * @param {Object} props
 * @param {string} props.phase - Current game phase.
 * @param {boolean} props.isAimLocked - Whether bowling aim is locked.
 * @param {Function} props.onBowl - Callback to trigger bowling.
 * @param {Function} props.onSwing - Callback to trigger batting swing.
 */
const Controls = ({ phase, isAimLocked, onBowl, onSwing }) => {
    return (
        <div className="controls" role="group" aria-label="Game Controls">
            {phase === 'AIMING' && (
                <button
                    className={`btn-control bowl ${isAimLocked ? 'active' : ''}`}
                    onClick={onBowl}
                    disabled={!isAimLocked}
                    aria-label="Bowl the ball"
                    title={isAimLocked ? "Click to Bowl" : "Lock aim first (Press Enter)"}
                >
                    🏏 BOWL
                </button>
            )}
            {phase === 'BATTING' && (
                <button
                    className="btn-control swing"
                    onClick={onSwing}
                    aria-label="Swing the bat"
                >
                    ⚡ SWING
                </button>
            )}
        </div>
    );
};

export default Controls;
