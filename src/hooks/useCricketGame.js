import { useState, useCallback } from 'react';

const OUTCOMES = [0, 1, 2, 3, 4, 6, 'W', 0, 1, 0]; // Simple probability distribution

export const useCricketGame = () => {
    const [gameState, setGameState] = useState({
        score: 0,
        wickets: 0,
        balls: 0,
        overs: 0,
        currentOver: [],
        scanner: "Ready",
        isGameOver: false,
        commentary: [],
    });

    const [players, setPlayers] = useState({
        batsman: "Player 1",
        bowler: "Computer Bowler"
    });

    const bowlBall = useCallback(() => {
        if (gameState.isGameOver) return null;

        const outcomeIndex = Math.floor(Math.random() * OUTCOMES.length);
        const outcome = OUTCOMES[outcomeIndex];

        let eventType = 'DOT';
        let runs = 0;
        let isWicket = false;

        if (outcome === 'W') {
            isWicket = true;
            eventType = 'WICKET';
        } else {
            runs = outcome;
            if (runs === 4) eventType = 'FOUR';
            else if (runs === 6) eventType = 'SIX';
            else if (runs > 0) eventType = 'RUNS';
        }

        const newBalls = gameState.balls + 1;
        const newOvers = Math.floor(newBalls / 6);
        const ballsInOver = newBalls % 6;

        setGameState(prev => {
            const newScore = prev.score + runs;
            const newWickets = isWicket ? prev.wickets + 1 : prev.wickets;
            const isAllOut = newWickets >= 10;
            const isMatchOver = isAllOut || newOvers >= 5; // Limit to 5 overs for demo

            return {
                ...prev,
                score: newScore,
                wickets: newWickets,
                balls: newBalls,
                overs: newOvers + (ballsInOver / 10), // Display format e.g., 0.1
                currentOver: [...prev.currentOver, outcome],
                isGameOver: isMatchOver,
                scanner: isWicket ? "OUT!" : `${runs} Runs`
            };
        });

        return {
            type: eventType,
            runs,
            batsman: players.batsman,
            bowler: players.bowler,
            isWicket
        };

    }, [gameState.balls, gameState.isGameOver, players]);

    const resetGame = () => {
        setGameState({
            score: 0,
            wickets: 0,
            balls: 0,
            overs: 0,
            currentOver: [],
            scanner: "Ready",
            isGameOver: false,
            commentary: []
        });
    };

    const addCommentary = (text) => {
        setGameState(prev => ({
            ...prev,
            commentary: [{ id: Date.now(), text }, ...prev.commentary]
        }));
    };

    return { gameState, bowlBall, resetGame, addCommentary };
};
