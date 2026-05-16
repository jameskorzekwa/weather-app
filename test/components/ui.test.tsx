import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Loading from '@/components/loading';
import DateTime from '@/components/dateTime';
import CurrentWeather from '@/components/currentWeather';
import WeeklyWeather from '@/components/weeklyWeather';
import type { Current, Forecast, Location, TempSensor } from '@/types';

describe('Loading', () => {
    it('renders the splash classes + sun svg', () => {
        const { container } = render(<Loading />);
        expect(container.querySelector('.splash-loading')).toBeTruthy();
        expect(container.querySelector('.splash-sun')).toBeTruthy();
        expect(container.querySelector('title')?.textContent).toBe(
            'sun-color'
        );
    });
});

describe('DateTime', () => {
    it('renders a formatted date and a 12h time', () => {
        const { container } = render(<DateTime />);
        const text = container.textContent || '';
        expect(text).toMatch(
            /\w+, \w+ \d{1,2}(st|nd|rd|th) \d{4}/
        );
        expect(text).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });
});

const location: Location = {
    lat: 39.583,
    lon: -105.25,
    city: 'Morrison'
} as Location;

const current: Current = {
    source: 'OpenMeteo',
    id: 800,
    temp: 72,
    min_temp: 50,
    max_temp: 80,
    sunrise: 1700000000,
    sunset: 1700040000,
    description: 'Clear',
    lat: 39.583,
    lon: -105.25
};

describe('CurrentWeather', () => {
    it('shows current temp, description and H/L', () => {
        render(
            <CurrentWeather
                location={location}
                current={current}
                isNight={false}
            />
        );
        expect(screen.getByText('Clear')).toBeInTheDocument();
        expect(screen.getByText(/72/)).toBeInTheDocument();
        expect(screen.getByText(/H 80/)).toBeInTheDocument();
        expect(screen.getByText(/L 50/)).toBeInTheDocument();
    });

    it('prefers the local temp sensor when coords match', () => {
        const tempSensor: TempSensor = {
            temperature: 68,
            lat: 39.583,
            lon: -105.25
        };
        render(
            <CurrentWeather
                location={location}
                current={current}
                isNight={false}
                tempSensor={tempSensor}
            />
        );
        expect(screen.getByText(/68/)).toBeInTheDocument();
    });

    it('uses the day icon when not night and night icon when night', () => {
        const { container, rerender } = render(
            <CurrentWeather
                location={location}
                current={current}
                isNight={false}
            />
        );
        expect(
            container.querySelector('.wi-owm-day-800')
        ).toBeTruthy();
        rerender(
            <CurrentWeather
                location={location}
                current={current}
                isNight={true}
            />
        );
        expect(
            container.querySelector('.wi-owm-night-800')
        ).toBeTruthy();
    });
});

describe('WeeklyWeather', () => {
    const forecast: Forecast = {
        source: 'OpenMeteo',
        daily: Array.from(Array(5), (_e, i) => ({
            id: 800 + i,
            min_temp: 40 + i,
            max_temp: 60 + i,
            sunrise: 1700000000,
            sunset: 1700040000,
            description: 'Clear',
            dt: 1700000000 + i * 86400,
            pop: 10 * i,
            lat: 1,
            lon: 2
        }))
    };

    it('renders 5 forecast cards with pop% and H/L', () => {
        const { container } = render(
            <WeeklyWeather forecast={forecast} />
        );
        expect(
            container.querySelectorAll('.forecast-card')
        ).toHaveLength(5);
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByText('40%')).toBeInTheDocument();
        expect(screen.getByText(/H 60/)).toBeInTheDocument();
    });
});
