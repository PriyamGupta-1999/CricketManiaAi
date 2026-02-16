import React from 'react';

/**
 * Scoreboard component that displays live match statistics.
 * Uses ARIA live regions for real-time score accessibility.
 * 
 * @param {Object} props
 * @param {Object} props.gameState - Current game state object.
 * @param {Object} props.teamA - Data for Team A.
 * @param {Object} props.teamB - Data for Team B.
 */
const Scoreboard = ({ gameState, teamA, teamB }) => {
    const { teams, currentInnings, target, matchStatus, winner } = gameState;
    const battingTeam = teams[currentInnings];
    const battingTeamInfo = currentInnings === 'A' ? teamA : teamB;

    return (
        <div className="scoreboard" role="region" aria-label="Game Scoreboard">
            <div className="score-main" aria-live="polite">
                <div className="team-display">
                    <span className="team-flag">{battingTeamInfo?.flag}</span>
                    <span className="team-name">{battingTeamInfo?.name}</span>
                </div>
                <div className="score-numbers">
                    <span className="runs">{battingTeam.score}</span>
                    <span className="divider">/</span>
                    <span className="wickets">{battingTeam.wickets}</span>
                </div>
            </div>

            <div className="match-stats">
                <div className="stat-item" aria-label={`Overs: ${battingTeam.overs}`}>
                    <span className="label">Overs</span>
                    <span className="value">{battingTeam.overs}</span>
                </div>
                {target && (
                    <div className="stat-item target" aria-live="assertive">
                        <span className="label">Target</span>
                        <span className="value">{target + 1}</span>
                    </div>
                )}
            </div>

            {target && matchStatus !== 'COMPLETED' && (
                <div className="target-banner">
                    Target: {target + 1} ({target + 1 - teamB.score} runs needed)
                </div>
            )}
        </div>
    );
};

export default Scoreboard;
