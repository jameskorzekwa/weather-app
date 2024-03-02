import seedrandom from 'seedrandom';
import {
    Current,
    Forecast,
    OMWeather,
    OMWeatherCode,
    OWCurrent,
    OWWeather,
    OWWeatherId
} from '@/types';
import moment from 'moment';

export const getTemp = (temp: number, from: string, to: string): number => {
    if (from === 'f') {
        temp = ((temp - 32) * 5) / 9 + 273.15;
    } else if (from === 'c') {
        temp = temp + 273.15;
    }
    if (to === 'c') {
        return Math.round(temp - 273);
    } else if (to === 'f') {
        return Math.round((temp - 273) * (9 / 5) + 32);
    }
    return temp;
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

export const omWeatherToCurrent = (current: OMWeather): Current => {
    return {
        id: omWeatherCodeToId(current.current.weather_code as OMWeatherCode),
        temp: getTemp(current.current.temperature, 'f', 'f'),
        min_temp: getTemp(current.daily.temperature_2m_min[0], 'f', 'f'),
        max_temp: getTemp(current.daily.temperature_2m_max[0], 'f', 'f'),
        sunrise: moment(current.daily.sunrise[0]).unix(),
        sunset: moment(current.daily.sunset[0]).unix(),
        description: omWeatherCodeToDescription(
            current.current.weather_code as OMWeatherCode
        ),
        lat: current.latitude,
        lon: current.longitude
    };
};

export const owWeatherToForecast = (weather: OWWeather): Forecast => {
    return {
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
        daily: Array.from(Array(5), (_e, i) => ({
            id: omWeatherCodeToId(
                weather.daily.weather_code[i + 1] as OMWeatherCode
            ),
            min_temp: weather.daily.temperature_2m_min[i + 1],
            max_temp: weather.daily.temperature_2m_max[i + 1],
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
