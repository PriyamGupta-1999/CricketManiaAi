import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCricketGame, GAME_PHASES } from './useCricketGame';

describe('useCricketGame Hook', () => {
    it('should initialize with correct default state', () => {
        const { result } = renderHook(() => useCricketGame());
        expect(result.current.gameState.phase).toBe(GAME_PHASES.AIMING);
        expect(result.current.gameState.matchStatus).toBe('IN_PROGRESS');
    });

    it('should lock aim correctly', () => {
        const { result } = renderHook(() => useCricketGame());
        act(() => {
            result.current.toggleAimLock();
        });
        expect(result.current.gameState.isAimLocked).toBe(true);
    });

    it('should transition to BOWLING phase', () => {
        const { result } = renderHook(() => useCricketGame());
        act(() => {
            result.current.toggleAimLock();
            result.current.startDelivery();
        });
        expect(result.current.gameState.phase).toBe(GAME_PHASES.BOWLING);
    });
});
