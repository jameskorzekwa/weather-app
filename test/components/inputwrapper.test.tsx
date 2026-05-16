import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@material-tailwind/react', () => ({
    Typography: ({ children }: any) => (
        <p data-testid="error-text">{children}</p>
    )
}));

import InputWrapper from '@/components/inputwrapper';

function Probe(props: any) {
    return <input data-testid="probe" data-error={String(props.error)} />;
}

describe('InputWrapper', () => {
    it('injects the error flag into component children', () => {
        render(
            <InputWrapper error="bad">
                <Probe />
            </InputWrapper>
        );
        expect(screen.getByTestId('probe').dataset.error).toBe('true');
    });

    it('does NOT inject error onto raw DOM-element children', () => {
        render(
            <InputWrapper error="bad">
                <div data-testid="rawdiv" />
            </InputWrapper>
        );
        const raw = screen.getByTestId('rawdiv');
        expect(raw.getAttribute('error')).toBeNull();
    });

    it('renders the error message text', () => {
        render(
            <InputWrapper error="Invalid format">
                <Probe />
            </InputWrapper>
        );
        expect(screen.getByTestId('error-text')).toHaveTextContent(
            'Invalid format'
        );
    });

    it('renders empty error text when no error', () => {
        render(
            <InputWrapper>
                <Probe />
            </InputWrapper>
        );
        expect(screen.getByTestId('error-text')).toHaveTextContent('');
        expect(screen.getByTestId('probe').dataset.error).toBe('false');
    });
});
