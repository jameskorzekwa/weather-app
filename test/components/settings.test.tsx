import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@material-tailwind/react', () => ({
    Dialog: ({ open, children }: any) =>
        open ? <div role="dialog">{children}</div> : null,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogBody: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
    Input: ({ label, value, onChange, type = 'text' }: any) => (
        <input
            aria-label={label}
            type={type}
            value={value || ''}
            onChange={onChange}
        />
    ),
    Select: ({ label, value, onChange, children, disabled }: any) => (
        <select
            aria-label={label}
            value={value}
            disabled={disabled}
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
            <input type="checkbox" checked={!!checked} onChange={onChange} />
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
    sun2Pairs: [],
    sun2Prefix: undefined,
    setSun2Prefix: vi.fn(),
    spoofWeather: undefined,
    setSpoofWeather: vi.fn(),
    isNight: false,
    setIsNight: vi.fn(),
    fakeTime: undefined,
    setFakeTime: vi.fn(),
    playingDay: false,
    playbackSpeed: 'medium' as const,
    setPlaybackSpeed: vi.fn(),
    startDayPlayback: vi.fn(),
    stopDayPlayback: vi.fn(),
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
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
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
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        // Known limitation in components/settings.tsx: validate() can't block.
        expect(props.setSettingsOpen).toHaveBeenCalledWith(false);
    });

    it('changing Color Mode to Monochrome is reflected on Save', () => {
        const props = baseProps();
        render(<Settings {...props} />);
        fireEvent.change(screen.getByRole('combobox', { name: 'Color Mode' }), {
            target: { value: 'mono' }
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(props.setMono).toHaveBeenCalledWith(true);
    });

    it('saves a frozen fake time', () => {
        const props = baseProps();
        render(<Settings {...props} />);
        fireEvent.change(screen.getByLabelText('Fake Time'), {
            target: { value: '20:03' }
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(props.setFakeTime).toHaveBeenCalledWith('20:03');
    });

    it('clears fake time to restore the live clock', () => {
        const props = baseProps();
        render(<Settings {...props} fakeTime="20:03" />);
        fireEvent.change(screen.getByLabelText('Fake Time'), {
            target: { value: '' }
        });
        fireEvent.click(screen.getByRole('button', { name: /save/i }));
        expect(props.setFakeTime).toHaveBeenCalledWith(undefined);
    });

    it('hides the manual night override while fake time controls the scene', () => {
        render(
            <Settings {...baseProps()} spoofWeather="clear" fakeTime="20:03" />
        );
        expect(screen.queryByText('Is Night')).not.toBeInTheDocument();
    });

    it('starts the day playback and closes the dialog', () => {
        const props = baseProps();
        render(<Settings {...props} />);
        fireEvent.click(screen.getByRole('button', { name: /play day/i }));
        expect(props.startDayPlayback).toHaveBeenCalledOnce();
        expect(props.setSettingsOpen).toHaveBeenCalledWith(false);
    });

    it('changes the playback speed for the next run', () => {
        const props = baseProps();
        render(<Settings {...props} />);
        fireEvent.change(
            screen.getByRole('combobox', { name: 'Playback Speed' }),
            { target: { value: 'fast' } }
        );
        expect(props.setPlaybackSpeed).toHaveBeenCalledWith('fast');
    });

    it('stops an active day playback without closing the dialog', () => {
        const props = baseProps();
        render(<Settings {...props} playingDay />);
        fireEvent.click(screen.getByRole('button', { name: /stop day/i }));
        expect(props.stopDayPlayback).toHaveBeenCalledOnce();
        expect(props.setSettingsOpen).not.toHaveBeenCalled();
        expect(
            screen.getByRole('combobox', { name: 'Playback Speed' })
        ).toBeDisabled();
    });
});
