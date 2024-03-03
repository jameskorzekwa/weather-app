export type Weather = LatLon & {
    id: number;
    min_temp: number;
    max_temp: number;
    sunrise: number;
    sunset: number;
    description: string;
};

export type Current = Weather & {
    source: WeatherSource;
    temp: number;
};

export type Daily = Weather & {
    dt: number;
    pop: number;
};

export type Forecast = {
    source: WeatherSource;
    daily: Daily[];
};

export type OWCurrent = {
    coord: {
        lon: number;
        lat: number;
    };
    weather: [
        {
            id: number;
            main: string;
            description: string;
            icon: string;
        }
    ];
    base: string;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
        sea_level: number;
        grnd_level: number;
    };
    visibility: number;
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    rain: {
        '1h': number;
    };
    clouds: {
        all: number;
    };
    dt: number;
    sys: {
        type: number;
        id: number;
        country: string;
        sunrise: number;
        sunset: number;
    };
    timezone: number;
    id: number;
    name: string;
    cod: number;
};

export type OWForecast = {
    cod: number;
    message: number;
    cnt: number;
    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
    list: [
        {
            dt: number;
            sunrise: number;
            sunset: number;
            temp: {
                day: number;
                min: number;
                max: number;
                night: number;
                eve: number;
                morn: number;
            };
            feels_like: {
                day: number;
                night: number;
                eve: number;
                morn: number;
            };
            pressure: number;
            humidity: number;
            weather: [
                {
                    id: number;
                    main: string;
                    description: string;
                    icon: string;
                }
            ];
            speed: number;
            deg: number;
            gust: number;
            clouds: number;
            pop: number;
            rain: number;
        }
    ];
};

export type OWWeather = {
    lat: number;
    lon: number;
    timezone: string;
    timezone_offset: string;
    current: {
        dt: number;
        sunrise: number;
        sunset: number;
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
        dew_point: number;
        uvi: number;
        clouds: number;
        visibiliy: number;
        wind_speed: number;
        wind_deg: number;
        wind_gust: number;
        weather: [
            {
                id: number;
                main: string;
                description: string;
                icon: string;
            }
        ];
    };
    minutely: [
        {
            dt: number;
            precipitation: number;
        }
    ];
    hourly: [
        {
            dt: number;
            temp: number;
            feels_like: number;
            pressure: number;
            humidity: number;
            dew_point: number;
            uvi: number;
            clouds: number;
            visibiliy: number;
            wind_speed: number;
            wind_deg: number;
            wind_gust: number;
            weather: [
                {
                    id: number;
                    main: string;
                    description: string;
                    icon: string;
                }
            ];
            pop: number;
        }
    ];
    daily: [
        {
            dt: number;
            sunrise: number;
            sunset: number;
            moonrise: number;
            moonset: number;
            moon_phase: number;
            summary: string;
            temp: {
                day: number;
                min: number;
                max: number;
                night: number;
                eve: number;
                morn: number;
            };
            feels_like: {
                day: number;
                night: number;
                eve: number;
                morn: number;
            };
            pressure: number;
            humidity: number;
            dew_point: number;
            wind_speed: number;
            wind_deg: number;
            wind_gust: number;
            weather: [
                {
                    id: number;
                    main: string;
                    description: string;
                    icon: string;
                }
            ];
            clouds: number;
            pop: number;
            rain: number;
            uvi: number;
        }
    ];
    alerts: [
        {
            sender_name: string;
            event: string;
            start: number;
            end: number;
            description: string;
            tags: string[];
        }
    ];
};

export type OMWeather = {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: {
        time: string;
        interval: string;
        temperature: string;
        weather_code: string;
    };
    current: {
        time: string;
        interval: number;
        temperature: number;
        weather_code: number;
    };
    daily_units: {
        time: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        sunrise: string;
        sunset: string;
        precipitation_sum: string;
        precipitation_probability_max: string;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        sunrise: string[];
        sunset: string[];
        precipitation_probability_mean: number[];
        weather_code: number[];
    };
};

export type Location = {
    datasource: {
        sourcename: string;
        attribution: string;
        license: string;
        url: string;
    };
    country: string;
    country_code: string;
    state: string;
    county: string;
    postcode: string;
    street: string;
    housenumber: string;
    lon: number;
    lat: number;
    state_code: string;
    distance: number;
    result_type: string;
    city: string;
    formatted: string;
    address_line1: string;
    address_line2: string;
    timezone: {
        name: string;
        offset_STD: string;
        offset_STD_seconds: number;
        offset_DST: string;
        offset_DST_seconds: number;
        abbreviation_STD: string;
        abbreviation_DST: string;
    };
    plus_code: string;
    rank: {
        importance: number;
        popularity: number;
    };
    place_id: string;
};

export type ReverseLocation = {
    type: string;
    features: [
        {
            type: string;
            properties: Location;
            geometry: {
                type: string;
                coordinates: number[];
            };
            bbox: number[];
        }
    ];
    query: {
        lat: number;
        lon: number;
        plus_code: string;
    };
};

export type ZipcodeLocation = {
    results: Location[];
    query: {
        text: string;
        parsed: {
            postcode: string;
            expected_type: string;
        };
    };
};

export type LocalStorageCurrent = {
    current: Current;
    time: number;
};

export type LocalStorageForecast = {
    forecast: Forecast;
    time: number;
};

export type LocalStorageLocation = {
    location: Location;
    time: number;
    source: 'zipcode' | 'latlon';
};

export type LocalStorageTempSensor = {
    tempSensor: TempSensor;
    time: number;
};

export type LatLon = {
    lat: number;
    lon: number;
};

export type TempSensor = {
    statusCode: number;
    body: {
        deviceId: string;
        deviceType: string;
        humidity: number;
        temperature: number;
        version: string;
        battery: number;
    };
    message: string;
    zipcode: string;
};

export type FakeWeatherKey =
    | 'thunderstorm'
    | 'drizzle'
    | 'rain'
    | 'snow'
    | 'atmosphere'
    | 'clear'
    | 'clouds';

export type FakeWeather = {
    [key in FakeWeatherKey]: Current;
};

export type ThunderstormId =
    | 200
    | 201
    | 202
    | 210
    | 211
    | 212
    | 221
    | 230
    | 231
    | 232;
export type DrizzleId = 300 | 301 | 302 | 310 | 311 | 312 | 313 | 314 | 321;
export type RainId = 500 | 501 | 502 | 503 | 504 | 511 | 520 | 521 | 522 | 531;
export type SnowId = 600 | 601 | 602 | 611 | 612 | 613 | 616 | 620 | 621 | 622;
export type AtmosphereId =
    | 701
    | 711
    | 721
    | 731
    | 741
    | 751
    | 761
    | 762
    | 771
    | 781;
export type ClearId = 800;
export type CloudId = 801 | 802 | 803 | 804;
export type OWWeatherId =
    | DrizzleId
    | RainId
    | SnowId
    | ThunderstormId
    | CloudId
    | AtmosphereId
    | ClearId;

export type OMWeatherCode =
    | 0
    | 1
    | 2
    | 3
    | 45
    | 48
    | 51
    | 53
    | 55
    | 56
    | 57
    | 61
    | 63
    | 65
    | 66
    | 67
    | 71
    | 73
    | 75
    | 77
    | 80
    | 81
    | 82
    | 85
    | 86
    | 95
    | 96
    | 99;

export type WeatherSource = 'OpenMeteo' | 'OpenWeatherMap';
