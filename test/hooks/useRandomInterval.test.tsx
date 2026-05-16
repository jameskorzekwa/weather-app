import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRandomInterval } from '@/hooks/useRandomInterval';

describe('useRandomInterval', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('invokes the callback after the scheduled delay', () => {
        const cb = vi.fn();
        renderHook(() => useRandomInterval(cb, 100, 100));
        expect(cb).not.toHaveBeenCalled();
        vi.advanceTimersByTime(100);
        expect(cb).toHaveBeenCalledTimes(1);
        vi.advanceTimersByTime(100);
        expect(cb).toHaveBeenCalledTimes(2);
    });

    it('returns a cancel function that stops further ticks', () => {
        const cb = vi.fn();
        const { result } = renderHook(() =>
            useRandomInterval(cb, 50, 50)
        );
        result.current();
        vi.advanceTimersByTime(500);
        expect(cb).not.toHaveBeenCalled();
    });

    it('clears the timer on unmount', () => {
        const cb = vi.fn();
        const { unmount } = renderHook(() =>
            useRandomInterval(cb, 50, 50)
        );
        unmount();
        vi.advanceTimersByTime(500);
        expect(cb).not.toHaveBeenCalled();
    });
});
