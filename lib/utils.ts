import seedrandom from 'seedrandom';
import {
    Current,
    Forecast,
    Location,
    OMWeather,
    OMWeatherCode,
    OWCurrent,
    OWWeather,
    OWWeatherId,
    TempSensor
} from '@/types';
import moment from 'moment';
import { Device } from 'ambient-weather-api';

export const getTemp = (temp: number, from: string, to: string): number => {
    if (from === 'f') {
        temp = ((temp - 32) * 5) / 9 + 273.15;
    } else if (from === 'c') {
        temp = temp + 273.15;
    }
    if (to === 'c') {
        temp = temp - 273;
    } else if (to === 'f') {
        temp = (temp - 273) * (9 / 5) + 32;
    }
    return Math.round(temp);
};

// Best available place name for the header. Geoapify only fills `city` for
// incorporated places; rural/unincorporated coordinates come back with
// `city: null` and a coarser field (county/state) populated instead — e.g.
// ZIP 80465 reverse-geocodes to "Jefferson County", not its USPS mailing
// city "Morrison". `zipCity` is the USPS place name looked up from the
// postcode (see getZipCity in page.tsx); it slots in right after the
// geocoder's own city so an unincorporated address shows its mailing city
// rather than the county. Walk fine-to-coarse and never render blank.
export const getLocationName = (
    location: Location,
    zipCity?: string
): string => {
    return (
        location.city ||
        zipCity ||
        location.town ||
        location.village ||
        location.hamlet ||
        location.suburb ||
        location.municipality ||
        location.county ||
        location.state ||
        ''
    );
};

export const getPrecipitationPercent = (pop: number): number => {
    return Math.round(pop * 100);
};

export const roundTo = (number: number, count: number) => {
    return Math.round((number * 10) ^ count) / (10 ^ count);
};

export const seededRandomNumber = (
    gen: seedrandom.PRNG,
    min: number,
    max: number
) => {
    return Math.floor(gen() * (max - min + 1) + min);
};

export const omWeatherCodeToId = (weatherCode: OMWeatherCode): OWWeatherId => {
    switch (weatherCode) {
        case 0:
        case 1:
            return 800;
        case 2:
            return 801;
        case 3:
            return 803;
        case 45:
        case 48:
            return 741;
        case 51:
            return 300;
        case 53:
        case 56:
            return 301;
        case 55:
        case 57:
            return 302;
        case 61:
            return 500;
        case 63:
        case 66:
        case 80:
            return 501;
        case 65:
        case 67:
        case 81:
            return 502;
        case 71:
        case 85:
            return 600;
        case 73:
        case 77:
            return 601;
        case 75:
        case 86:
            return 602;
        case 82:
            return 504;
        case 95:
            return 202;
        case 96:
        case 99:
            return 221;
    }
};

export const omWeatherCodeToDescription = (
    weatherCode: OMWeatherCode
): string => {
    switch (weatherCode) {
        case 0:
        case 1:
            return 'Clear';
        case 2:
        case 3:
            return 'Clouds';
        case 45:
        case 48:
            return 'Fog';
        case 51:
        case 53:
        case 55:
            return 'Drizzle';
        case 56:
        case 57:
            return 'Freezing Drizzle';
        case 61:
        case 63:
        case 65:
        case 80:
        case 81:
        case 82:
            return 'Rain';
        case 66:
        case 67:
            return 'Freezing Rain';
        case 71:
        case 73:
        case 75:
        case 77:
        case 85:
        case 86:
            return 'Snow';
        case 95:
        case 96:
        case 99:
            return 'Thunderstorm';
    }
};

export const owCurrentToCurrent = (current: OWCurrent): Current => {
    return {
        source: 'OpenWeatherMap',
        id: current.weather[0].id,
        temp: getTemp(current.main.temp, 'k', 'f'),
        min_temp: getTemp(current.main.temp_min, 'k', 'f'),
        max_temp: getTemp(current.main.temp_max, 'k', 'f'),
        sunrise: current.sys.sunrise,
        sunset: current.sys.sunset,
        description: current.weather[0].main,
        lat: current.coord.lat,
        lon: current.coord.lon
    };
};

// OpenMeteo weather codes that imply liquid precipitation reaching the
// ground (drizzle / rain / showers / thunderstorm). Snow codes are
// deliberately excluded — the dry-storm guard keys off the `rain`/
// `precipitation` fields, which are legitimately 0 during snow.
const OM_WET_CODES = new Set<OMWeatherCode>([
    51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99
]);

// Map an OpenMeteo cloud-cover percentage onto the OpenWeatherMap-style
// clear/clouds ids the backgrounds route on (800 clear, 801–804 clouds).
export const cloudCoverToId = (cloudCover?: number): OWWeatherId => {
    if (cloudCover === undefined) return 803; // no data → assume cloudy
    if (cloudCover < 13) return 800; // clear
    if (cloudCover < 50) return 801; // few clouds
    if (cloudCover < 85) return 803; // broken clouds
    return 804; // overcast
};

export const omWeatherToCurrent = (current: OMWeather): Current => {
    const code = current.current.weather_code as OMWeatherCode;
    let id = omWeatherCodeToId(code);
    let description = omWeatherCodeToDescription(code);

    // Dry-storm guard: OpenMeteo over-reports thunderstorms/rain — it returns
    // a wet code (e.g. 95) even when its own `precipitation`/`rain` read 0mm.
    // When the code says wet but nothing is actually falling, trust the cloud
    // cover instead so an overcast-but-dry sky doesn't render as a storm. The
    // fields are optional (older cached responses lack them); if precipitation
    // is absent we leave the provider's code untouched.
    const precip = current.current.precipitation;
    const rain = current.current.rain;
    if (
        OM_WET_CODES.has(code) &&
        precip === 0 &&
        (rain ?? 0) === 0
    ) {
        id = cloudCoverToId(current.current.cloud_cover);
        description = id === 800 ? 'Clear' : 'Clouds';
    }

    return {
        source: 'OpenMeteo',
        id,
        temp: getTemp(current.current.temperature, 'f', 'f'),
        min_temp: getTemp(current.daily.temperature_2m_min[0], 'f', 'f'),
        max_temp: getTemp(current.daily.temperature_2m_max[0], 'f', 'f'),
        sunrise: moment(current.daily.sunrise[0]).unix(),
        sunset: moment(current.daily.sunset[0]).unix(),
        description,
        lat: current.latitude,
        lon: current.longitude
    };
};

export const owWeatherToForecast = (weather: OWWeather): Forecast => {
    return {
        source: 'OpenWeatherMap',
        daily: weather.daily.map((day) => ({
            id: day.weather[0].id,
            min_temp: getTemp(day.temp.min, 'k', 'f'),
            max_temp: getTemp(day.temp.max, 'k', 'f'),
            sunrise: day.sunrise,
            sunset: day.sunset,
            description: day.weather[0].main,
            dt: day.dt,
            pop: getPrecipitationPercent(day.pop),
            lat: weather.lat,
            lon: weather.lon
        }))
    };
};

export const omWeatherToForecast = (weather: OMWeather): Forecast => {
    return {
        source: 'OpenMeteo',
        daily: Array.from(Array(5), (_e, i) => ({
            id: omWeatherCodeToId(
                weather.daily.weather_code[i + 1] as OMWeatherCode
            ),
            min_temp: getTemp(
                weather.daily.temperature_2m_min[i + 1],
                'f',
                'f'
            ),
            max_temp: getTemp(
                weather.daily.temperature_2m_max[i + 1],
                'f',
                'f'
            ),
            sunrise: moment(weather.daily.sunrise[i + 1]).unix(),
            sunset: moment(weather.daily.sunset[i + 1]).unix(),
            description: omWeatherCodeToDescription(
                weather.daily.weather_code[i + 1] as OMWeatherCode
            ),
            dt: moment(weather.daily.time[i + 1]).unix(),
            pop: weather.daily.precipitation_probability_mean[i + 1],
            lat: weather.latitude,
            lon: weather.longitude
        }))
    };
};

export const AWNDeviceToTempSensor = (awnDevice: Device): TempSensor => {
    return {
        temperature: awnDevice.lastData.tempf,
        humidity: awnDevice.lastData.humidity,
        lat: awnDevice.info.coords.coords.lat,
        lon: awnDevice.info.coords.coords.lon
    };
};
