import seedrandom from 'seedrandom';
import { Current, Forecast, OWCurrent, OWWeather } from '@/types';
import moment from 'moment';

export const getTemp = (temp: number, type: string) => {
    if (type === 'c') {
        return Math.round(temp - 273);
    } else if (type === 'f') {
        return Math.round((temp - 273) * (9 / 5) + 32);
    }
};

export const getPrecipitationPercent = (pop: number) => {
    return Math.round(pop * 100) + '%';
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

export const owCurrentToCurrent = (current: OWCurrent): Current => {
    return {
        id: current.weather[0].id,
        temp: current.main.temp,
        min_temp: current.main.temp_min,
        max_temp: current.main.temp_max,
        sunrise: moment.unix(current.sys.sunrise),
        sunset: moment.unix(current.sys.sunset),
        description: current.weather[0].main
    };
};

export const owWeatherToForecast = (weather: OWWeather): Forecast => {
    return {
        daily: weather.daily.map((day) => ({
            id: day.weather[0].id,
            min_temp: day.temp.min,
            max_temp: day.temp.max,
            sunrise: moment.unix(day.sunrise),
            sunset: moment.unix(day.sunset),
            description: day.weather[0].main,
            dt: moment.unix(day.dt),
            pop: day.pop
        }))
    };
};
