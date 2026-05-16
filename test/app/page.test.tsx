import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';

// useSearchParams suspends in real Next; stub it so HomeContent mounts.
vi.mock('next/navigation', () => ({
    useSearchParams: () => ({ get: () => null })
}));

// Stub the heavy children so the smoke test isolates page composition.
vi.mock('@/components/background', () => ({
    default: () => <div data-testid="bg" />
}));
vi.mock('@/components/settings', () => ({
    default: () => <div data-testid="settings" />
}));
vi.mock('@/components/alerts', () => ({
    default: () => <div data-testid="alerts" />
}));
vi.mock('@/components/currentWeather', () => ({
    default: () => <div data-testid="current" />
}));
vi.mock('@/components/weeklyWeather', () => ({
    default: () => <div data-testid="weekly" />
}));
vi.mock('@/components/dateTime', () => ({
    default: () => <div data-testid="datetime" />
}));

global.fetch = vi.fn().mockResolvedValue({
    json: async () => ({}),
    ok: true
}) as any;

import Home from '@/app/page';

describe('Home page (smoke)', () => {
    it('mounts and shows the loading splash before data resolves', () => {
        const { container } = render(<Home />);
        expect(container.querySelector('.splash-loading')).toBeTruthy();
    });
});
