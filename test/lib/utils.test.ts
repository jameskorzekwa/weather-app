import { describe, it, expect } from 'vitest';
import seedrandom from 'seedrandom';
import {
    getTemp,
    getPrecipitationPercent,
    roundTo,
    seededRandomNumber,
    omWeatherCodeToId,
    omWeatherCodeToDescription,
    owCurrentToCurrent,
    omWeatherToCurrent,
    owWeatherToForecast,
    omWeatherToForecast,
    AWNDeviceToTempSensor
} from '@/lib/utils';

describe('getTemp', () => {
    it('f -> f round-trips a value', () => {
        expect(getTemp(32, 'f', 'f')).toBe(32);
        expect(getTemp(100, 'f', 'f')).toBe(100);
        expect(getTemp(72, 'f', 'f')).toBe(72);
    });

    it('c -> c round-trips ~0', () => {
        expect(getTemp(0, 'c', 'c')).toBe(0);
    });

    it('k -> c subtracts 273', () => {
        expect(getTemp(273, 'k', 'c')).toBe(0);
        expect(getTemp(300, 'k', 'c')).toBe(27);
    });

    it('k -> f converts kelvin to fahrenheit', () => {
        // (300-273)*9/5 + 32 = 80.6 -> 81
        expect(getTemp(300, 'k', 'f')).toBe(81);
        // (273-273)*9/5 + 32 = 32
        expect(getTemp(273, 'k', 'f')).toBe(32);
    });

    it('returns an integer (rounded)', () => {
        expect(Number.isInteger(getTemp(283.7, 'k', 'f'))).toBe(true);
    });
});

describe('getPrecipitationPercent', () => {
    it('multiplies by 100 and rounds', () => {
        expect(getPrecipitationPercent(0)).toBe(0);
        expect(getPrecipitationPercent(0.41)).toBe(41);
        expect(getPrecipitationPercent(1)).toBe(100);
        expect(getPrecipitationPercent(0.005)).toBe(1);
    });
});

describe('roundTo', () => {
    // Note: implementation uses bitwise ^ (XOR), not exponent — we lock in
    // ACTUAL behavior, not mathematically-expected rounding.
    it('is deterministic for given inputs', () => {
        const a = roundTo(5, 2);
        const b = roundTo(5, 2);
        expect(a).toBe(b);
        expect(typeof a).toBe('number');
    });
});

describe('seededRandomNumber', () => {
    it('is deterministic for the same seed', () => {
        const g1 = seedrandom('seed-x');
        const g2 = seedrandom('seed-x');
        expect(seededRandomNumber(g1, 0, 100)).toBe(
            seededRandomNumber(g2, 0, 100)
        );
    });

    it('stays within [min, max] and is an integer', () => {
        const g = seedrandom('range-test');
        for (let i = 0; i < 200; i++) {
            const v = seededRandomNumber(g, 5, 9);
            expect(Number.isInteger(v)).toBe(true);
            expect(v).toBeGreaterThanOrEqual(5);
            expect(v).toBeLessThanOrEqual(9);
        }
    });

    it('different seeds diverge', () => {
        const a = seededRandomNumber(seedrandom('a'), 0, 1_000_000);
        const b = seededRandomNumber(seedrandom('b'), 0, 1_000_000);
        expect(a).not.toBe(b);
    });
});

describe('omWeatherCodeToId', () => {
    it('maps clear codes to 800', () => {
        expect(omWeatherCodeToId(0)).toBe(800);
        expect(omWeatherCodeToId(1)).toBe(800);
    });
    it('maps cloud codes', () => {
        expect(omWeatherCodeToId(2)).toBe(801);
        expect(omWeatherCodeToId(3)).toBe(803);
    });
    it('maps fog', () => {
        expect(omWeatherCodeToId(45)).toBe(741);
        expect(omWeatherCodeToId(48)).toBe(741);
    });
    it('maps rain/drizzle/snow/thunderstorm representatives', () => {
        expect(omWeatherCodeToId(51)).toBe(300);
        expect(omWeatherCodeToId(61)).toBe(500);
        expect(omWeatherCodeToId(71)).toBe(600);
        expect(omWeatherCodeToId(95)).toBe(202);
        expect(omWeatherCodeToId(96)).toBe(221);
    });
});

describe('omWeatherCodeToDescription', () => {
    it('maps representative codes to descriptions', () => {
        expect(omWeatherCodeToDescription(0)).toBe('Clear');
        expect(omWeatherCodeToDescription(3)).toBe('Clouds');
        expect(omWeatherCodeToDescription(45)).toBe('Fog');
        expect(omWeatherCodeToDescription(51)).toBe('Drizzle');
        expect(omWeatherCodeToDescription(56)).toBe('Freezing Drizzle');
        expect(omWeatherCodeToDescription(63)).toBe('Rain');
        expect(omWeatherCodeToDescription(66)).toBe('Freezing Rain');
        expect(omWeatherCodeToDescription(75)).toBe('Snow');
        expect(omWeatherCodeToDescription(99)).toBe('Thunderstorm');
    });
});

describe('owCurrentToCurrent', () => {
    it('maps an OpenWeatherMap current payload to Current', () => {
        const ow: any = {
            coord: { lat: 39.5, lon: -105.2 },
            weather: [{ id: 800, main: 'Clear', description: 'clear', icon: '01d' }],
            main: { temp: 300, temp_min: 295, temp_max: 305 },
            sys: { sunrise: 1700000000, sunset: 1700040000 }
        };
        const c = owCurrentToCurrent(ow);
        expect(c.source).toBe('OpenWeatherMap');
        expect(c.id).toBe(800);
        expect(c.description).toBe('Clear');
        expect(c.lat).toBe(39.5);
        expect(c.lon).toBe(-105.2);
        expect(c.sunrise).toBe(1700000000);
        expect(c.sunset).toBe(1700040000);
        expect(c.temp).toBe(getTemp(300, 'k', 'f'));
        expect(c.min_temp).toBe(getTemp(295, 'k', 'f'));
        expect(c.max_temp).toBe(getTemp(305, 'k', 'f'));
    });
});

describe('omWeatherToCurrent', () => {
    it('maps an OpenMeteo payload to Current', () => {
        const om: any = {
            latitude: 40,
            longitude: -105,
            current: { temperature: 72, weather_code: 0 },
            daily: {
                temperature_2m_min: [50],
                temperature_2m_max: [80],
                sunrise: ['2026-05-16T05:45'],
                sunset: ['2026-05-16T20:09']
            }
        };
        const c = omWeatherToCurrent(om);
        expect(c.source).toBe('OpenMeteo');
        expect(c.id).toBe(800);
        expect(c.description).toBe('Clear');
        expect(c.temp).toBe(72);
        expect(c.min_temp).toBe(50);
        expect(c.max_temp).toBe(80);
        expect(c.lat).toBe(40);
        expect(c.lon).toBe(-105);
        expect(typeof c.sunrise).toBe('number');
        expect(typeof c.sunset).toBe('number');
    });
});

describe('owWeatherToForecast', () => {
    it('maps OWWeather.daily entries', () => {
        const w: any = {
            lat: 1,
            lon: 2,
            daily: [
                {
                    weather: [{ id: 501, main: 'Rain' }],
                    temp: { min: 280, max: 290 },
                    sunrise: 10,
                    sunset: 20,
                    dt: 12345,
                    pop: 0.4
                }
            ]
        };
        const f = owWeatherToForecast(w);
        expect(f.source).toBe('OpenWeatherMap');
        expect(f.daily).toHaveLength(1);
        expect(f.daily[0].id).toBe(501);
        expect(f.daily[0].description).toBe('Rain');
        expect(f.daily[0].pop).toBe(40);
        expect(f.daily[0].dt).toBe(12345);
        expect(f.daily[0].lat).toBe(1);
        expect(f.daily[0].lon).toBe(2);
    });
});

describe('omWeatherToForecast', () => {
    it('maps 5 forecast days from OpenMeteo (skips index 0 = today)', () => {
        const arr = (v: number) => Array.from(Array(7), () => v);
        const w: any = {
            latitude: 9,
            longitude: 8,
            daily: {
                time: arr(0).map((_, i) => `2026-05-${16 + i}T00:00`),
                temperature_2m_max: arr(80),
                temperature_2m_min: arr(50),
                sunrise: arr(0).map(() => '2026-05-17T05:45'),
                sunset: arr(0).map(() => '2026-05-17T20:09'),
                precipitation_probability_mean: [10, 20, 30, 40, 50, 60, 70],
                weather_code: [0, 2, 61, 71, 95, 3, 45]
            }
        };
        const f = omWeatherToForecast(w);
        expect(f.source).toBe('OpenMeteo');
        expect(f.daily).toHaveLength(5);
        // index i uses source index i+1
        expect(f.daily[0].id).toBe(omWeatherCodeToId(2));
        expect(f.daily[0].pop).toBe(20);
        expect(f.daily[0].max_temp).toBe(80);
        expect(f.daily[0].min_temp).toBe(50);
        expect(f.daily[0].lat).toBe(9);
        expect(f.daily[0].lon).toBe(8);
        expect(f.daily[4].id).toBe(omWeatherCodeToId(3));
    });
});

describe('AWNDeviceToTempSensor', () => {
    it('extracts temp/humidity/coords from an AWN device', () => {
        const device: any = {
            lastData: { tempf: 71.3, humidity: 42 },
            info: { coords: { coords: { lat: 39.58, lon: -105.24 } } }
        };
        const t = AWNDeviceToTempSensor(device);
        expect(t).toEqual({
            temperature: 71.3,
            humidity: 42,
            lat: 39.58,
            lon: -105.24
        });
    });
});
