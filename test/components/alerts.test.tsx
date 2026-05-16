import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@material-tailwind/react', () => ({
    Alert: ({ children, onClose }: any) => (
        <div role="alert">
            {children}
            <button aria-label="close" onClick={onClose} />
        </div>
    )
}));

import Alerts from '@/components/alerts';

describe('Alerts', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('renders one alert per item plus a Clear All control', () => {
        render(
            <Alerts
                alerts={[
                    { id: 'a', msg: 'first error' },
                    { id: 'b', msg: 'second error' }
                ]}
                closeAlert={vi.fn()}
            />
        );
        expect(screen.getAllByRole('alert')).toHaveLength(2);
        expect(screen.getByText('first error')).toBeInTheDocument();
        expect(screen.getByText('second error')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Clear All' })
        ).toBeInTheDocument();
    });

    it('renders nothing / no Clear All when there are no alerts', () => {
        render(<Alerts alerts={[]} closeAlert={vi.fn()} />);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        expect(
            screen.queryByRole('button', { name: 'Clear All' })
        ).not.toBeInTheDocument();
    });

    it('Clear All triggers closeAlert', () => {
        const closeAlert = vi.fn();
        render(
            <Alerts
                alerts={[{ id: 'a', msg: 'x' }]}
                closeAlert={closeAlert}
            />
        );
        fireEvent.click(
            screen.getByRole('button', { name: 'Clear All' })
        );
        expect(closeAlert).toHaveBeenCalled();
    });
});
