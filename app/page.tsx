'use client';
import '/css/weather-icons.css';
import { useInterval } from 'usehooks-ts';
import moment from 'moment-timezone';
import { useEffect, useState } from 'react';
import Background from '@/components/background';
import {
    Current,
    Forecast,
    LatLon,
    LocalStorageCurrent,
    LocalStorageForecast,
    LocalStorageLocation,
    LocalStorageTempSensor,
    Location,
    OMWeather,
    OWCurrent,
    OWWeather,
    ReverseLocation,
    TempSensor,
    ZipcodeLocation
} from '@/types';
import { useSearchParams } from 'next/navigation';
import WeeklyWeather from '@/components/weeklyWeather';
import CurrentWeather from '@/components/currentWeather';
import DateTime from '@/components/dateTime';
import Loading from '@/components/loading';
import {
    getTemp,
    omWeatherToCurrent,
    omWeatherToForecast,
    owCurrentToCurrent,
    owWeatherToForecast
} from '@/lib/utils';

if (typeof window !== 'undefined') {
    const { fetch: originalFetch } = window;
    window.fetch = async (...args) => {
        let [resource, config] = args;

        let response = await originalFetch(resource, config);
        let reqVersion = response.headers.get('x-version');

        if (reqVersion) {
            const prevVersion = localStorage.getItem('version');
            if (!prevVersion) {
                localStorage.setItem('version', reqVersion);
            } else if (prevVersion !== reqVersion) {
                localStorage.setItem('version', reqVersion);
                window.location.reload();
            }
        }

        return response;
    };
}

export default function Home() {
    const [datetime, setDatetime] = useState<moment.Moment>(moment());
    const [isNight, setIsNight] = useState<boolean | null>(null);
    const [apikey, setApikey] = useState<string | null>(null);
    const [appid, setAppid] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [latLon, setLatLon] = useState<LatLon | null>(null);
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [current, setCurrent] = useState<Current | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [zipcode, setZipcode] = useState<string | null>();
    const [tempSensor, setTempSensor] = useState<TempSensor | null>(null);

    const searchParams = useSearchParams();

    let getTempSensor = async (secretKey: string, token: string) => {
        const localStorageTempSensor = localStorage.getItem('tempSensor');
        if (localStorageTempSensor) {
            try {
                const last: LocalStorageTempSensor = JSON.parse(
                    localStorageTempSensor
                );
                if (
                    moment
                        .unix(last.time)
                        .isAfter(moment().subtract(1, 'minutes'))
                ) {
                    setTempSensor(last.tempSensor);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `/api/switchbot?secret=${secretKey}&token=${token}`
        );
        const resp: TempSensor = await result.json();
        if (resp.body?.temperature) {
            resp.body.temperature = getTemp(resp.body.temperature, 'c', 'f');
        }
        setTempSensor(resp);
        const store: LocalStorageTempSensor = {
            time: moment().unix(),
            tempSensor: resp
        };
        localStorage.setItem('tempSensor', JSON.stringify(store));
    };
    let getWeather = async (location: Location, force: boolean = false) => {
        const localStorageCurrent = localStorage.getItem('current');
        const localStorageForecast = localStorage.getItem('forecast');

        if (localStorageCurrent && localStorageForecast) {
            try {
                const lastCurrent: LocalStorageCurrent =
                    JSON.parse(localStorageCurrent);
                const lastForecast: LocalStorageForecast =
                    JSON.parse(localStorageForecast);
                if (
                    !force &&
                    (moment
                        .unix(lastCurrent.time)
                        .isAfter(moment().subtract(5, 'minutes')) ||
                        moment
                            .unix(lastForecast.time)
                            .isAfter(moment().subtract(5, 'minutes'))) &&
                    lastCurrent.current.lat.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastCurrent.current.lon.toFixed(6) ===
                        location?.lon.toFixed(6) &&
                    lastForecast.forecast.daily[0].lat?.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastForecast.forecast.daily[0].lon?.toFixed(6) ===
                        location?.lon.toFixed(6)
                ) {
                    setCurrent(lastCurrent.current);
                    setForecast(lastForecast.forecast);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_mean,weather_code&timezone=${moment.tz.guess()}&temperature_unit=fahrenheit`
        );
        const data: OMWeather = await result.json();
        data.latitude = location.lat;
        data.longitude = location.lon;
        setCurrent(omWeatherToCurrent(data));
        setForecast(omWeatherToForecast(data));
        const curr: LocalStorageCurrent = {
            time: moment().unix(),
            current: omWeatherToCurrent(data)
        };
        const fore: LocalStorageForecast = {
            time: moment().unix(),
            forecast: omWeatherToForecast(data)
        };
        localStorage.setItem('current', JSON.stringify(curr));
        localStorage.setItem('forecast', JSON.stringify(fore));
    };
    let getCurrent = async (location: Location, force: boolean = false) => {
        const localStorageCurrent = localStorage.getItem('current');
        if (localStorageCurrent) {
            try {
                const lastCurrent: LocalStorageCurrent =
                    JSON.parse(localStorageCurrent);
                if (
                    !force &&
                    moment
                        .unix(lastCurrent.time)
                        .isAfter(moment().subtract(5, 'minutes')) &&
                    lastCurrent.current.lat.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastCurrent.current.lon.toFixed(6) ===
                        location?.lon.toFixed(6)
                ) {
                    setCurrent(lastCurrent.current);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
        );
        const data: OWCurrent = await result.json();
        data.coord = { lat: location.lat, lon: location.lon };
        setCurrent(owCurrentToCurrent(data));
        const store: LocalStorageCurrent = {
            time: moment().unix(),
            current: owCurrentToCurrent(data)
        };
        localStorage.setItem('current', JSON.stringify(store));
    };
    let getForecast = async (location: Location, force: boolean = false) => {
        const localStorageForecast = localStorage.getItem('forecast');
        if (localStorageForecast) {
            try {
                const lastWeather: LocalStorageForecast =
                    JSON.parse(localStorageForecast);
                if (
                    !force &&
                    moment
                        .unix(lastWeather.time)
                        .isAfter(moment().subtract(1, 'hours')) &&
                    lastWeather.forecast.daily[0].lat.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastWeather.forecast.daily[0].lon.toFixed(6) ===
                        location?.lon.toFixed(6)
                ) {
                    setForecast(lastWeather.forecast);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
        );
        const data: OWWeather = await result.json();
        data.lat = location.lat;
        data.lon = location.lon;
        setForecast(owWeatherToForecast(data));
        const store: LocalStorageForecast = {
            time: moment().unix(),
            forecast: owWeatherToForecast(data)
        };
        localStorage.setItem('forecast', JSON.stringify(store));
    };

    let getReverseLocation = async (latLon: LatLon) => {
        const localStorageLocation = localStorage.getItem('location');
        if (localStorageLocation) {
            try {
                const lastLocation: LocalStorageLocation =
                    JSON.parse(localStorageLocation);
                if (
                    lastLocation.location.lat.toFixed(6) ===
                        latLon?.lat.toFixed(6) &&
                    lastLocation.location.lon.toFixed(6) ===
                        latLon?.lon.toFixed(6) &&
                    lastLocation.source === 'latlon'
                ) {
                    setLocation(lastLocation.location);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latLon?.lat}&lon=${latLon?.lon}&apiKey=${apikey}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'j2k-weather-app'
                }
            }
        );
        const data: ReverseLocation = await result.json();
        setLocation(data.features[0].properties);
        const store: LocalStorageLocation = {
            time: moment().unix(),
            location: data.features[0].properties,
            source: 'latlon'
        };
        localStorage.setItem('location', JSON.stringify(store));
    };
    let getZipcodeLocation = async (zipcode: string) => {
        const localStorageLocation = localStorage.getItem('location');
        if (localStorageLocation) {
            try {
                const lastLocation: LocalStorageLocation =
                    JSON.parse(localStorageLocation);
                if (
                    lastLocation.location.postcode === zipcode &&
                    lastLocation.source === 'zipcode'
                ) {
                    setLocation(lastLocation.location);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.geoapify.com/v1/geocode/search?text=${zipcode}&lang=en&limit=10&type=postcode&filter=countrycode:us&&format=json&apiKey=${apikey}`
        );
        const data: ZipcodeLocation = await result.json();
        setLocation(data.results[0]);
        const store: LocalStorageLocation = {
            time: moment().unix(),
            location: data.results[0],
            source: 'zipcode'
        };
        localStorage.setItem('location', JSON.stringify(store));
    };

    useInterval(() => {
        const now = moment();
        setDatetime(now);
        setIsNight(
            current
                ? now.isAfter(moment.unix(current.sunset)) ||
                      now.isBefore(moment.unix(current.sunrise))
                : false
        );
    }, 1000);

    useInterval(() => {
        if (appid && location) {
            // void getForecast(location);
            // void getCurrent(location);
            void getWeather(location);
        }
        if (secretKey && token) {
            void getTempSensor(secretKey, token);
        }
    }, 60000);

    useEffect(() => {
        if (searchParams) {
            setAppid(searchParams.get('appid'));
            setApikey(searchParams.get('apikey'));
            setSecretKey(searchParams.get('secretKey'));
            setToken(searchParams.get('token'));
            const zipcode = searchParams.get('zipcode');
            const lat = searchParams.get('lat');
            const lon = searchParams.get('lon');
            if (lat && Number(lat) && lon && Number(lon)) {
                setLatLon({ lat: parseFloat(lat), lon: parseFloat(lon) });
            } else if (zipcode) {
                setZipcode(zipcode);
            }
        }
    }, []);

    useEffect(() => {
        if (secretKey && token) {
            void getTempSensor(secretKey, token);
        }
    }, [secretKey, token]);

    useEffect(() => {
        if (!location && latLon) {
            void getReverseLocation(latLon);
        }
    }, [latLon]);

    useEffect(() => {
        if (apikey && zipcode && !location) {
            void getZipcodeLocation(zipcode);
        }
    }, [zipcode]);

    useEffect(() => {
        if (secretKey && token) {
            void getTempSensor(secretKey, token);
        }
    }, [secretKey, token]);

    useEffect(() => {
        if (location) {
            if (!latLon) {
                setLatLon({ lat: location.lat, lon: location.lon });
            }
            if (!zipcode) {
                setZipcode(location.postcode);
            }
            if (appid && location) {
                // void getCurrent(location);
                // void getForecast(location);
                void getWeather(location);
            }
        }
    }, [location]);

    useEffect(() => {
        if (current) {
            setIsNight(
                current
                    ? moment().isAfter(moment.unix(current.sunset)) ||
                          moment().isBefore(moment.unix(current.sunrise))
                    : false
            );
        }
    }, [current]);

    return current && forecast && location && isNight !== null ? (
        <main className="flex min-h-screen flex-col ">
            <Background current={current} isNight={isNight} />
            <div
                style={{
                    position: 'absolute',
                    height: '100vh',
                    width: '100vw'
                }}
                className="flex flex-col justify-between grow p-16"
            >
                <div className="flex flex-row justify-between">
                    <div className="text text-7xl">{location.city}</div>
                    <DateTime datetime={datetime} />
                </div>
                <CurrentWeather
                    current={current}
                    isNight={isNight}
                    tempSensor={tempSensor}
                />
                <WeeklyWeather forecast={forecast} />
            </div>
        </main>
    ) : (
        <Loading />
    );
}
