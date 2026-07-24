import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Sun from '@/components/sun';
import Moon from '@/components/moon';
import Cloud from '@/components/cloud';
import Raining from '@/components/raining';
import ThunderCloud from '@/components/thunderCloud';

describe('Sun', () => {
    it('renders a center ellipse + 14 ray rects, yellow by default', () => {
        const { container } = render(<Sun />);
        const ellipses = container.querySelectorAll('ellipse');
        const rects = container.querySelectorAll('rect');
        expect(ellipses).toHaveLength(1);
        expect(rects).toHaveLength(14);
        expect(ellipses[0].getAttribute('fill')).toBe('#f1a20f');
        rects.forEach((r) => expect(r.getAttribute('fill')).toBe('#f1a20f'));
    });

    it('uses grey (#5a5a5a) when inverted', () => {
        const { container } = render(<Sun inverted />);
        expect(container.querySelector('ellipse')!.getAttribute('fill')).toBe(
            '#5a5a5a'
        );
    });
});

describe('Moon', () => {
    it('renders one ellipse rx/ry 58, golden yellow by default', () => {
        const { container } = render(<Moon />);
        const e = container.querySelector('ellipse')!;
        expect(e.getAttribute('fill')).toBe('#f4d35e');
        expect(e.getAttribute('rx')).toBe('58');
        expect(e.getAttribute('ry')).toBe('58');
    });

    it('uses #2a2a2a when inverted', () => {
        const { container } = render(<Moon inverted />);
        expect(container.querySelector('ellipse')!.getAttribute('fill')).toBe(
            '#2a2a2a'
        );
    });
});

describe('Cloud', () => {
    const base = { y: 0, fill: '#abcdef', duration: 1000, delay: 0 };

    it('renders a single path when not fuzzy, with the given fill', () => {
        const { container } = render(<Cloud {...base} fuzzy={false} />);
        const paths = container.querySelectorAll('path');
        expect(paths).toHaveLength(1);
        expect(paths[0].getAttribute('fill')).toBe('#abcdef');
    });

    it('renders three layered paths when fuzzy', () => {
        const { container } = render(<Cloud {...base} fuzzy={true} />);
        const paths = container.querySelectorAll('path');
        expect(paths).toHaveLength(3);
        paths.forEach((p) =>
            expect(p.getAttribute('fill')).toBe('#abcdef')
        );
    });
});

describe('Raining', () => {
    it('renders amount*2 raindrops in a darkgrey group', () => {
        const { container } = render(
            <Raining amount={4} diagonal={false} size="large" />
        );
        const rects = container.querySelectorAll('rect');
        expect(rects).toHaveLength(8);
        const g = container.querySelector('g[fill="darkgrey"]');
        expect(g).toBeTruthy();
    });

    it('uses shorter drops for size=small', () => {
        const { container } = render(
            <Raining amount={1} diagonal={false} size="small" />
        );
        const rect = container.querySelector('rect')!;
        expect(rect.getAttribute('height')).toBe('5');
    });

    it('uses tall drops for size=large', () => {
        const { container } = render(
            <Raining amount={1} diagonal={false} size="large" />
        );
        const rect = container.querySelector('rect')!;
        expect(rect.getAttribute('height')).toBe('15');
    });
});

describe('ThunderCloud', () => {
    it('renders cloud circles without throwing', () => {
        const { container } = render(
            <ThunderCloud y={0} delay={0} fill="#2d2d2d" />
        );
        expect(container.querySelectorAll('circle').length).toBeGreaterThan(0);
    });
});
