/**
 * Game phases available in the cricket match.
 * @enum {string}
 */

import { useState, useCallback, useEffect } from 'react';
export const GAME_PHASES = {
    IDLE: 'IDLE',         // Game not started / waiting for next ball
    AIMING: 'AIMING',     // Bowler selecting pitch spot
    BOWLING: 'BOWLING',   // Ball traveling to pitch
    BATTING: 'BATTING',   // Ball bouncing to batsman
    RUNNING: 'RUNNING',   // Batsmen running between wickets
    RESULT: 'RESULT',     // Wicket/runs shown
    INNINGS_BREAK: 'BREAK' // Innings switch
};

/**
 * Default team configurations.
 */
export const TEAMS = {
    A: { name: "Team India", color: "#1976d2" },
    B: { name: "Team Australia", color: "#fbc02d" }
};

/**
 * Custom hook that encapsulates the core cricket game logic, 
 * including scoring, phase management, and state transitions.
 * 
 * @returns {Object} Game state and control functions.
 */
export const useCricketGame = () => {
    const [matchConfig, setMatchConfig] = useState({
        teamA: { name: "Team India", color: "#1976d2", flag: "🇮🇳" },
        teamB: { name: "Team Australia", color: "#fbc02d", flag: "🇦🇺" },
        totalOvers: 5
    });

    const [gameState, setGameState] = useState({
        teams: {
            A: { score: 0, wickets: 0, overs: 0, balls: 0, history: [] },
            B: { score: 0, wickets: 0, overs: 0, balls: 0, history: [] }
        },
        currentInnings: 'A',
        target: null,
        matchStatus: 'IN_PROGRESS',
        winner: null,
        currentOver: [],
        scanner: "Ready",
        commentary: [],
        phase: GAME_PHASES.AIMING,
        markerPos: { x: 0, z: 2 },
        isAimLocked: false,
        hasSwung: false,
    });

    /**
     * Initializes the match with a new configuration.
     * @param {Object} config - { teamA, teamB, overs }
     */
    const initializeMatch = useCallback((config) => {
        setMatchConfig({
            teamA: config.teamA,
            teamB: config.teamB,
            totalOvers: config.overs
        });

        setGameState({
            teams: {
                A: { score: 0, wickets: 0, overs: 0, balls: 0, history: [] },
                B: { score: 0, wickets: 0, overs: 0, balls: 0, history: [] }
            },
            currentInnings: 'A',
            target: null,
            matchStatus: 'IN_PROGRESS',
            winner: null,
            currentOver: [],
            scanner: "Ready",
            commentary: [],
            phase: GAME_PHASES.AIMING,
            markerPos: { x: 0, z: 2 },
            isAimLocked: false,
            hasSwung: false,
        });
    }, []);

    const setPhase = useCallback((phase) => {
        setGameState(prev => ({ ...prev, phase }));
    }, []);

    /**
     * Updates the ball's pitch marker position.
     * @param {number} x - Horizontal position.
     * @param {number} z - Depth position.
     */
    const updateMarker = useCallback((x, z) => {
        setGameState(prev => {
            if (prev.phase === GAME_PHASES.AIMING && !prev.isAimLocked) {
                return { ...prev, markerPos: { x, z } };
            }
            return prev;
        });
    }, []);

    const toggleAimLock = useCallback(() => {
        setGameState(prev => {
            if (prev.phase === GAME_PHASES.AIMING) {
                return { ...prev, isAimLocked: !prev.isAimLocked };
            }
            return prev;
        });
    }, []);

    /**
     * Transitions the game from AIMING to BOWLING phase.
     */
    const startDelivery = useCallback(() => {
        setGameState(prev => {
            if (prev.phase === GAME_PHASES.AIMING) {
                return { ...prev, phase: GAME_PHASES.BOWLING, scanner: "Bowling...", isAimLocked: false, hasSwung: false };
            }
            return prev;
        });
    }, []);

    /**
     * Core logic to apply runs/wickets to the current innings and handle match completion/breaks.
     * @param {number} runs - Total runs scored on the delivery.
     * @param {string} type - Event type (e.g., 'SIX', 'WICKET').
     * @param {boolean} isWicket - Whether the batsman is out.
     */
    const applyScoreUpdate = useCallback((runs, type, isWicket) => {
        setGameState(prev => {
            const team = prev.currentInnings;
            const currentTeamData = prev.teams[team];
            if (!currentTeamData) return prev;

            const newScore = currentTeamData.score + runs;
            const newWickets = isWicket ? currentTeamData.wickets + 1 : currentTeamData.wickets;
            const newBalls = currentTeamData.balls + 1;
            const newOversVal = Math.floor(newBalls / 6) + (newBalls % 6) / 10;

            const updatedTeam = {
                ...currentTeamData,
                score: newScore,
                wickets: newWickets,
                balls: newBalls,
                overs: newOversVal,
                history: [...currentTeamData.history, isWicket ? 'W' : runs]
            };

            const isAllOut = newWickets >= 10;
            const ballsPerInnings = matchConfig.totalOvers * 6;
            const isOversFinished = newBalls >= ballsPerInnings;
            const inningOver = isAllOut || isOversFinished;

            let matchStatus = prev.matchStatus;
            let winner = prev.winner;
            let nextInnings = prev.currentInnings;
            let phase = GAME_PHASES.AIMING;
            let scannerMsg = isWicket ? "OUT!" : (runs > 0 ? (runs >= 4 ? (runs === 6 ? "SIX!!" : "FOUR!") : `${runs} RUNS`) : "DOT");

            if (prev.currentInnings === 'B') {
                if (newScore > (prev.target || 0)) {
                    matchStatus = 'COMPLETED';
                    winner = 'Team B';
                    scannerMsg = "Team B WINS!";
                    phase = GAME_PHASES.IDLE;
                } else if (inningOver) {
                    if (newScore === prev.target) {
                        matchStatus = 'COMPLETED';
                        winner = 'Draw';
                        scannerMsg = "MATCH TIED!";
                    } else {
                        matchStatus = 'COMPLETED';
                        winner = 'Team A';
                        scannerMsg = "Team A WINS!";
                    }
                    phase = GAME_PHASES.IDLE;
                }
            } else if (prev.currentInnings === 'A' && inningOver) {
                nextInnings = 'B';
                phase = GAME_PHASES.INNINGS_BREAK;
                scannerMsg = `Innings Break! Target: ${newScore + 1}`;
            }

            return {
                ...prev,
                teams: {
                    ...prev.teams,
                    [team]: updatedTeam
                },
                currentInnings: nextInnings,
                target: prev.currentInnings === 'A' && inningOver ? newScore : prev.target,
                matchStatus,
                winner,
                scanner: scannerMsg,
                phase: phase === GAME_PHASES.INNINGS_BREAK ? GAME_PHASES.INNINGS_BREAK : GAME_PHASES.AIMING,
                isAimLocked: false
            };
        });
    }, [matchConfig.totalOvers]);

    const handleResultOutcome = useCallback((runs, type, isWicket) => {
        if (runs > 0 && runs < 4 && !isWicket) {
            setGameState(prev => ({ ...prev, phase: GAME_PHASES.RUNNING, scanner: "Running..." }));
            setTimeout(() => {
                applyScoreUpdate(runs, type, isWicket);
            }, 2000);
        } else {
            applyScoreUpdate(runs, type, isWicket);
        }
    }, [applyScoreUpdate]);

    /**
     * Calculates the batting outcome based on swing timing.
     * @param {number} timingDelta - Difference between bounce and swing (lower is better).
     * @returns {Object} The outcome result.
     */
    const playerSwing = useCallback((timingDelta) => {
        let runs = 0;
        let type = 'DOT';
        let isWicket = false;

        if (timingDelta < 0.8) {
            runs = 6;
            type = 'SIX';
        } else if (timingDelta < 1.3) {
            runs = 4;
            type = 'FOUR';
        } else if (timingDelta < 1.5) {
            runs = Math.random() > 0.5 ? 2 : 1;
            type = 'RUNS';
        } else {
            if (Math.random() > 0.7) {
                isWicket = true;
                type = 'WICKET';
            } else {
                type = 'DOT';
            }
        }

        const teamA = matchConfig.teamA?.name || "Team A";
        const teamB = matchConfig.teamB?.name || "Team B";

        // IMPORTANT: Use direct logic here to avoid capture issues
        setGameState(prev => {
            const currentTeamName = prev.currentInnings === 'A' ? teamA : teamB;
            const bowlerName = prev.currentInnings === 'A' ? teamB : teamA;

            // We can't return the result from here directly, so we'll need to handle it.
            // But App.jsx expects the result immediately.
            return { ...prev, hasSwung: true };
        });

        // Re-calulating result for immediate return
        // Note: This is slightly redundant but ensures App.jsx gets what it needs.
        setGameState(prev => {
            const currentTeamName = prev.currentInnings === 'A' ? teamA : teamB;
            const bowlerName = prev.currentInnings === 'A' ? teamB : teamA;
            const result = { runs, type, isWicket, bowler: bowlerName, batsman: currentTeamName };
            // Note: handleResultOutcome is called outside of setGameState to avoid nested updates
            return prev;
        });

        // Better way: get current innings from matchConfig if possible or state ref
        // For now, let's just use the fact that playerSwing is recreated/memoized correctly.
        const currentTeamName = gameState.currentInnings === 'A' ? teamA : teamB;
        const bowlerName = gameState.currentInnings === 'A' ? teamB : teamA;
        const result = { runs, type, isWicket, bowler: bowlerName, batsman: currentTeamName };

        handleResultOutcome(runs, type, isWicket);
        return result;
    }, [gameState.currentInnings, matchConfig, handleResultOutcome]);

    useEffect(() => {
        if (gameState.phase === GAME_PHASES.INNINGS_BREAK) {
            const timer = setTimeout(() => {
                setGameState(prev => ({
                    ...prev,
                    phase: GAME_PHASES.AIMING,
                    scanner: "2nd Innings Start"
                }));
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [gameState.phase]);

    const resetGame = useCallback(() => {
        setGameState({
            teams: {
                A: { score: 0, wickets: 0, overs: 0, balls: 0, history: [] },
                B: { score: 0, wickets: 0, overs: 0, balls: 0, history: [] }
            },
            currentInnings: 'A',
            target: null,
            matchStatus: 'IN_PROGRESS',
            winner: null,
            currentOver: [],
            scanner: "Ready",
            commentary: [],
            phase: GAME_PHASES.AIMING,
            markerPos: { x: 0, z: 2 },
            isAimLocked: false,
            hasSwung: false,
        });
    }, []);

    const addCommentary = useCallback((text) => {
        setGameState(prev => ({
            ...prev,
            commentary: [{ id: Date.now(), text }, ...prev.commentary]
        }));
    }, []);

    return {
        gameState,
        matchConfig,
        setPhase,
        updateMarker,
        startDelivery,
        playerSwing,
        resetGame,
        addCommentary,
        toggleAimLock,
        initializeMatch
    };
};
