import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { Current } from '@/types';

// Factories are hoisted by vi.mock, so each must be fully self-contained
// (no references to outer-scope variables).
vi.mock('@/components/backgrounds/thunderstom', () => ({
    default: (p: any) => (
        <div data-testid="thunderstorm" data-isnight={String(p.isNight)} />
    )
}));
vi.mock('@/components/backgrounds/drizzle', () => ({
    default: (p: any) => (
        <div data-testid="drizzle" data-isnight={String(p.isNight)} />
    )
}));
vi.mock('@/components/backgrounds/rain', () => ({
    default: (p: any) => (
        <div data-testid="rain" data-isnight={String(p.isNight)} />
    )
}));
vi.mock('@/components/backgrounds/snow', () => ({
    default: (p: any) => (
        <div data-testid="snow" data-isnight={String(p.isNight)} />
    )
}));
vi.mock('@/components/backgrounds/clouds', () => ({
    default: (p: any) => (
        <div data-testid="clouds" data-isnight={String(p.isNight)} />
    )
}));
vi.mock('@/components/backgrounds/clear', () => ({
    default: (p: any) => (
        <div
            data-testid="clear"
            data-isnight={String(p.isNight)}
            data-mono={String(p.mono)}
            data-inverted={String(p.inverted)}
        />
    )
}));
vi.mock('@/components/backgrounds/atmosphere', () => ({
    default: (p: any) => (
        <div
            data-testid="atmosphere"
            data-isnight={String(p.isNight)}
            data-inverted={String(p.inverted)}
        />
    )
}));

import Background from '@/components/background';

const cur = (id: number): Current => ({ id, source: 'OpenMeteo' }) as Current;

describe('Background routing', () => {
    const cases: [number, string][] = [
        [201, 'thunderstorm'],
        [301, 'drizzle'],
        [501, 'rain'],
        [601, 'snow'],
        [741, 'atmosphere'],
        [800, 'clear'],
        [803, 'clouds']
    ];

    it.each(cases)('id %i renders the %s background', (id, testid) => {
        const { getByTestId } = render(
            <Background current={cur(id)} isNight={false} />
        );
        expect(getByTestId(testid)).toBeInTheDocument();
    });
});

describe('Background night/inverted flags', () => {
    it('night = isNight || mono for non-clear backgrounds', () => {
        const { getByTestId, rerender } = render(
            <Background current={cur(501)} isNight={false} />
        );
        expect(getByTestId('rain').dataset.isnight).toBe('false');

        rerender(<Background current={cur(501)} isNight={true} />);
        expect(getByTestId('rain').dataset.isnight).toBe('true');

        rerender(<Background current={cur(501)} isNight={false} mono={true} />);
        expect(getByTestId('rain').dataset.isnight).toBe('true');
    });

    it('atmosphere receives inverted = mono', () => {
        const { getByTestId, rerender } = render(
            <Background current={cur(741)} isNight={false} />
        );
        expect(getByTestId('atmosphere').dataset.inverted).toBe('false');
        rerender(<Background current={cur(741)} isNight={false} mono={true} />);
        expect(getByTestId('atmosphere').dataset.inverted).toBe('true');
    });

    it('clear gets the REAL isNight (not forced) plus mono + inverted', () => {
        const { getByTestId } = render(
            <Background current={cur(800)} isNight={false} mono={true} />
        );
        const el = getByTestId('clear');
        expect(el.dataset.isnight).toBe('false');
        expect(el.dataset.mono).toBe('true');
        expect(el.dataset.inverted).toBe('true');
    });
});

describe('Background solar transition colors', () => {
    const sunrise = new Date('2026-07-23T05:45:00').getTime() / 1000;
    const sunset = new Date('2026-07-23T20:23:00').getTime() / 1000;

    it('provides a sunrise gradient to colored weather scenes', () => {
        const { container } = render(
            <Background
                current={cur(800)}
                isNight={false}
                sunrise={sunrise}
                fakeTime="05:45"
            />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.dataset.solarTransitionActive).toBe('true');
        expect(
            root.style.getPropertyValue('--solar-transition-gradient')
        ).toContain('linear-gradient');
        expect(root.style.getPropertyValue('--solar-cloud-opacity')).toBe(
            '0.450'
        );
    });

    it('provides a sunset gradient to colored weather scenes', () => {
        const { container } = render(
            <Background
                current={cur(800)}
                isNight={false}
                sunset={sunset}
                fakeTime="20:03"
            />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.dataset.solarTransitionActive).toBe('true');
        expect(
            root.style.getPropertyValue('--solar-transition-gradient')
        ).toContain('linear-gradient');
        expect(root.style.getPropertyValue('--solar-cloud-opacity')).toBe(
            '0.450'
        );
    });

    it('does not provide any colored gradient in monochrome mode', () => {
        const { container } = render(
            <Background
                current={cur(800)}
                isNight={false}
                sunset={sunset}
                fakeTime="20:03"
                mono={true}
            />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.dataset.solarTransitionActive).toBe('false');
        expect(
            root.style.getPropertyValue('--solar-transition-gradient')
        ).toBe('none');
        expect(root.style.getPropertyValue('--solar-cloud-opacity')).toBe(
            '1.000'
        );
    });

    it('leaves the normal palette alone outside the sunset window', () => {
        const { container } = render(
            <Background
                current={cur(800)}
                isNight={false}
                sunset={sunset}
                fakeTime="12:00"
            />
        );
        const root = container.firstElementChild as HTMLElement;
        expect(root.dataset.solarTransitionActive).toBe('false');
        expect(root.style.getPropertyValue('--solar-cloud-opacity')).toBe(
            '1.000'
        );
    });
});
