import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@material-tailwind/react', () => ({
    Dialog: ({ open, children }: any) =>
        open ? <div role="dialog">{children}</div> : null,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogBody: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    Input: ({ label, value, onChange }: any) => (
        <input
            aria-label={label}
            value={value || ''}
            onChange={onChange}
        />
    ),
    Select: ({ label, value, onChange, children }: any) => (
        <select
            aria-label={label}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        >
            {children}
        </select>
    ),
    Option: ({ value, children }: any) => (
        <option value={value}>{children}</option>
    ),
    Button: ({ children, onClick, disabled }: any) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
    Checkbox: ({ label, checked, onChange }: any) => (
        <label>
            <input
                type="checkbox"
                checked={!!checked}
                onChange={onChange}
            />
            {label}
        </label>
    ),
    Spinner: () => <span>loading</span>,
    Typography: ({ children }: any) => <p>{children}</p>
}));

import Settings from '@/components/settings';

const baseProps = () => ({
    settingsOpen: true,
    setSettingsOpen: vi.fn(),
    latlon: { lat: 39.5, lon: -105.2 },
    setLatlon: vi.fn(),
    zipcode: '80465',
    setZipcode: vi.fn(),
    geoapifyApiKey: 'geo-key',
    setGeoapifyApiKey: vi.fn(),
    awnApplicationKey: 'app-key',
    setAwnApplicationKey: vi.fn(),
    awnApiKey: 'awn-key',
    setAwnApiKey: vi.fn(),
    weatherSource: 'OpenMeteo' as const,
    setWeatherSource: vi.fn(),
    openWeatherMapAppId: '',
    setOpenWeatherMapAppId: vi.fn(),
    spoofWeather: undefined,
    setSpoofWeather: vi.fn(),
    isNight: false,
    setIsNight: vi.fn(),
    mono: false,
    setMono: vi.fn(),
    addAlert: vi.fn()
});

describe('Settings', () => {
    it('renders the dialog with header + Color Mode control when open', () => {
        render(<Settings {...baseProps()} />);
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(
            screen.getByRole('combobox', { name: 'Color Mode' })
        ).toBeInTheDocument();
    });

    it('does not render when settingsOpen is false', () => {
        render(<Settings {...baseProps()} settingsOpen={false} />);
        expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    it('Save with valid props closes the dialog and persists mono', () => {
        const props = baseProps();
        render(<Settings {...props} />);
        fireEvent.click(
            screen.getByRole('button', { name: /save/i })
        );
        expect(props.setSettingsOpen).toHaveBeenCalledWith(false);
        expect(props.setMono).toHaveBeenCalled();
        expect(props.setLatlon).toHaveBeenCalled();
    });

    it('Save proceeds even with missing fields — documents that validate() is a no-op (it returns a stale `valid` because the validation runs inside an async setForm updater)', () => {
        const props = baseProps();
        render(
            <Settings
                {...props}
                latlon={undefined}
                zipcode=""
                geoapifyApiKey=""
            />
        );
        fireEvent.click(
            screen.getByRole('button', { name: /save/i })
        );
        // Known limitation in components/settings.tsx: validate() can't block.
        expect(props.setSettingsOpen).toHaveBeenCalledWith(false);
    });

    it('changing Color Mode to Monochrome is reflected on Save', () => {
        const props = baseProps();
        render(<Settings {...props} />);
        fireEvent.change(
            screen.getByRole('combobox', { name: 'Color Mode' }),
            { target: { value: 'mono' } }
        );
        fireEvent.click(
            screen.getByRole('button', { name: /save/i })
        );
        expect(props.setMono).toHaveBeenCalledWith(true);
    });
});
