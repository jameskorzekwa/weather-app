'use client';
import '/css/weather-icons.css';
import { useInterval } from 'usehooks-ts';
import moment from 'moment';
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
    LocalStorageWeather,
    Location,
    ReverseLocation,
    TempSensor,
    Weather,
    ZipcodeLocation
} from '@/types';
import { useSearchParams } from 'next/navigation';
import WeeklyWeather from '@/components/weeklyWeather';
import CurrentWeather from '@/components/currentWeather';
import DateTime from '@/components/dateTime';
import Loading from '@/components/loading';

export default function Home() {
    const [datetime, setDatetime] = useState<moment.Moment>(moment());
    const [isNight, setIsNight] = useState<boolean>(false);
    const [apikey, setApikey] = useState<string | null>(null);
    const [appid, setAppid] = useState<string | null>(null);
    const [secretKey, setSecretKey] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [latLon, setLatLon] = useState<LatLon | null>(null);
    const [forecast, setForecast] = useState<Forecast | null>(null);
    const [current, setCurrent] = useState<Current | null>(null);
    const [weather, setWeather] = useState<Weather | null>(null);
    const [location, setLocation] = useState<Location | null>(null);
    const [zipcode, setZipcode] = useState<string | null>();
    const [tempSensor, setTempSensor] = useState<TempSensor | null>(null);

    const searchParams = useSearchParams();
    const fakeCurrent: Current | null = null;

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
            resp.body.temperature = resp.body.temperature + 273;
        }
        setTempSensor(resp);
        const store: LocalStorageTempSensor = {
            time: moment().unix(),
            tempSensor: resp
        };
        localStorage.setItem('tempSensor', JSON.stringify(store));
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
                    lastCurrent.current.coord.lat.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastCurrent.current.coord.lon.toFixed(6) ===
                        location?.lon.toFixed(6)
                ) {
                    setCurrent(lastCurrent.current);
                    setIsNight(
                        moment().isAfter(
                            moment.unix(lastCurrent.current.sys.sunset)
                        ) ||
                            moment().isBefore(
                                moment.unix(lastCurrent.current.sys.sunrise)
                            )
                    );
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
        );
        const data: Current = await result.json();
        data.coord = { lat: location.lat, lon: location.lon };
        setCurrent(data);
        setIsNight(
            data
                ? moment().isAfter(moment.unix(data.sys.sunset)) ||
                      moment().isBefore(moment.unix(data.sys.sunrise))
                : false
        );
        const store: LocalStorageCurrent = {
            time: moment().unix(),
            current: data
        };
        localStorage.setItem('current', JSON.stringify(store));
    };
    let getWeather = async (location: Location, force: boolean = false) => {
        const localStorageWeather = localStorage.getItem('weather');
        if (localStorageWeather) {
            try {
                const lastWeather: LocalStorageWeather =
                    JSON.parse(localStorageWeather);
                if (
                    !force &&
                    moment
                        .unix(lastWeather.time)
                        .isAfter(moment().subtract(1, 'hours')) &&
                    lastWeather.weather.lat.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastWeather.weather.lon.toFixed(6) ===
                        location?.lon.toFixed(6)
                ) {
                    setWeather(lastWeather.weather);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
        );
        const data: Weather = await result.json();
        data.lat = location.lat;
        data.lon = location.lon;
        setWeather(data);
        const store: LocalStorageWeather = {
            time: moment().unix(),
            weather: data
        };
        localStorage.setItem('weather', JSON.stringify(store));
    };
    let getForecast = async (location: Location, force: boolean = false) => {
        const localStorageForecast = localStorage.getItem('forecast');
        if (localStorageForecast) {
            try {
                const lastForecast: LocalStorageForecast =
                    JSON.parse(localStorageForecast);
                if (
                    !force &&
                    moment
                        .unix(lastForecast.time)
                        .isAfter(moment().subtract(10, 'minutes')) &&
                    lastForecast.forecast.city.coord.lat.toFixed(6) ===
                        location?.lat.toFixed(6) &&
                    lastForecast.forecast.city.coord.lon.toFixed(6) ===
                        location?.lon.toFixed(6)
                ) {
                    setForecast(lastForecast.forecast);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
        }
        const result = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
        );
        const data: Forecast = await result.json();
        data.city.coord = { lat: location.lat, lon: location.lon };
        setForecast(data);
        const store: LocalStorageForecast = {
            time: moment().unix(),
            forecast: data
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
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latLon?.lat}&lon=${latLon?.lon}&apiKey=${apikey}`
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
                ? now.isAfter(moment.unix(current.sys.sunset)) ||
                      now.isBefore(moment.unix(current.sys.sunrise))
                : false
        );
    }, 1000);

    useInterval(() => {
        if (appid && location) {
            void getWeather(location);
            void getCurrent(location);
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
                void getCurrent(location);
                void getWeather(location);
                void getForecast(location);
            }
        }
    }, [location]);

    return current && weather && forecast && latLon ? (
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
                    <div className="text text-7xl">
                        {location?.city || forecast.city.name}
                    </div>
                    <DateTime datetime={datetime} />
                </div>
                <CurrentWeather
                    current={current}
                    isNight={isNight}
                    tempSensor={tempSensor}
                />
                <WeeklyWeather weather={weather} />
            </div>
        </main>
    ) : (
        <Loading />
    );
}
