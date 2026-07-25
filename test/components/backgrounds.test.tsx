import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Clear from '@/components/backgrounds/clear';
import Clouds from '@/components/backgrounds/clouds';
import Rain from '@/components/backgrounds/rain';
import Drizzle from '@/components/backgrounds/drizzle';
import Snow from '@/components/backgrounds/snow';
import Thunderstorm from '@/components/backgrounds/thunderstom';
import Atmosphere from '@/components/backgrounds/atmosphere';

describe('Clear background', () => {
    it('renders the Sun in day, Moon at night', () => {
        const { container: day } = render(
            <Clear id={800} isNight={false} />
        );
        // Sun = ellipse + 14 ray rects
        expect(day.querySelectorAll('rect').length).toBe(14);

        const { container: night } = render(
            <Clear id={800} isNight={true} />
        );
        // Moon = single ellipse, no ray rects
        expect(night.querySelectorAll('rect').length).toBe(0);
        expect(night.querySelectorAll('ellipse').length).toBe(1);
    });

    it('uses a black bg at night/mono and blue bg for color day', () => {
        const { container: c1 } = render(
            <Clear id={800} isNight={false} />
        );
        expect(
            (c1.firstChild as HTMLElement).style.backgroundColor
        ).toBe('rgb(55, 114, 180)');

        const { container: c2 } = render(
            <Clear id={800} isNight={true} />
        );
        expect(
            (c2.firstChild as HTMLElement).style.backgroundColor
        ).toBe('black');

        const { container: c3 } = render(
            <Clear id={800} isNight={false} mono={true} />
        );
        expect(
            (c3.firstChild as HTMLElement).style.backgroundColor
        ).toBe('black');
    });

    it('passes inverted to the Sun (grey when inverted)', () => {
        const { container } = render(
            <Clear id={800} isNight={false} inverted={true} />
        );
        expect(
            container.querySelector('ellipse')!.getAttribute('fill')
        ).toBe('#5a5a5a');
    });
});

describe('weather backgrounds render without throwing', () => {
    it('Clouds', () => {
        expect(() =>
            render(<Clouds id={804 as any} isNight={true} />)
        ).not.toThrow();
    });
    it('Rain', () => {
        expect(() =>
            render(<Rain id={501 as any} isNight={true} />)
        ).not.toThrow();
    });
    it('Drizzle', () => {
        expect(() =>
            render(<Drizzle id={301 as any} isNight={true} />)
        ).not.toThrow();
    });
    it('Snow', () => {
        expect(() =>
            render(<Snow id={601 as any} isNight={true} />)
        ).not.toThrow();
    });
    it('Thunderstorm', () => {
        expect(() =>
            render(<Thunderstorm id={201 as any} isNight={true} />)
        ).not.toThrow();
    });
    it('Atmosphere uses a yellow moon in color and gray when inverted', () => {
        const { container: color } = render(
            <Atmosphere id={741 as any} isNight={true} />
        );
        expect(color.querySelectorAll('ellipse')[0].getAttribute('fill')).toBe(
            'rgba(244,211,94,0.35)'
        );
        expect(color.querySelectorAll('ellipse')[1].getAttribute('fill')).toBe(
            '#f4d35e'
        );

        const { container: inverted } = render(
            <Atmosphere id={741 as any} isNight={true} inverted />
        );
        expect(
            inverted.querySelectorAll('ellipse')[1].getAttribute('fill')
        ).toBe('#5a5a5a');
    });
});

describe('Rain background bg color', () => {
    it('is black at night, grey #5f646c by day', () => {
        const { container: n } = render(
            <Rain id={501 as any} isNight={true} />
        );
        expect(
            (n.firstChild as HTMLElement).style.backgroundColor
        ).toBe('black');
        const { container: d } = render(
            <Rain id={501 as any} isNight={false} />
        );
        expect(
            (d.firstChild as HTMLElement).style.backgroundColor
        ).toBe('rgb(95, 100, 108)');
    });
});

describe('precipitation solar tint', () => {
    it.each([
        ['Rain', <Rain key="rain" id={501 as any} isNight={false} />],
        ['Drizzle', <Drizzle key="drizzle" id={301 as any} isNight={false} />],
        ['Snow', <Snow key="snow" id={601 as any} isNight={false} />],
        [
            'Thunderstorm',
            <Thunderstorm key="thunder" id={201 as any} isNight={false} />
        ]
    ])('%s uses the muted solar gradient', (_name, background) => {
        const { container } = render(background);
        expect(
            (container.firstChild as HTMLElement).style.backgroundImage
        ).toBe('var(--precipitation-solar-transition-gradient, none)');
    });
});
