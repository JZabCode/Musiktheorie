import { useState, useEffect, useRef } from 'react';

export type GameState = 'setup' | 'playing' | 'finished';

/**
 * Custom hook that encapsulates the quiz timer logic shared by all quiz components.
 * Manages game state, countdown timer, and provides a stable ref for use in setTimeout callbacks.
 */
export function useQuizTimer(initialDuration = 60) {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [gameDuration, setGameDuration] = useState(initialDuration);
    const [timeLeft, setTimeLeft] = useState(initialDuration);

    // Countdown timer
    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (gameState === 'playing' && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (gameState === 'playing' && timeLeft === 0) {
            setGameState('finished');
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft]);

    // Ref to always have the current gameState in setTimeout callbacks
    const gameStateRef = useRef(gameState);
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

    /** Update duration (used by setup slider). Also syncs timeLeft. */
    const setDuration = (seconds: number) => {
        setGameDuration(seconds);
        setTimeLeft(seconds);
    };

    /** Reset timer and switch to playing state. */
    const startPlaying = () => {
        setTimeLeft(gameDuration);
        setGameState('playing');
    };

    /** Reset for a new round (from finished screen). */
    const restart = () => {
        setTimeLeft(gameDuration);
        setGameState('playing');
    };

    return {
        gameState,
        setGameState,
        gameDuration,
        setDuration,
        timeLeft,
        gameStateRef,
        startPlaying,
        restart,
    };
}
