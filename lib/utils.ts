import seedrandom from 'seedrandom';

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
    return (Math.round((number * 10) ^ count) / 10) ^ count;
};

export const seededRandomNumber = (
    gen: seedrandom.PRNG,
    min: number,
    max: number
) => {
    return Math.floor(gen() * (max - min + 1) + min);
};
