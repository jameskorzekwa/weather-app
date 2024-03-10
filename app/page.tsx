'use client';
import '/css/weather-icons.css';
import { useInterval } from 'usehooks-ts';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { Fragment, useEffect, useState } from 'react';
import Background from '@/components/background';
import {
    Current,
    FakeWeatherKey,
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
    WeatherSource,
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
import Settings from '@/components/settings';
import { fakeWeather } from '@/constants/data';
import Alerts from '@/components/alerts';

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
    const [alerts, setAlerts] = useState<{ id: string; msg: string }[]>([]);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [isNight, setIsNight] = useState<boolean | undefined>();
    const [apikey, setApikey] = useState<string | undefined>();
    const [appid, setAppid] = useState<string | undefined>();
    const [secretKey, setSecretKey] = useState<string | undefined>();
    const [token, setToken] = useState<string | undefined>();
    const [latLon, setLatLon] = useState<LatLon | undefined>();
    const [forecast, setForecast] = useState<Forecast | undefined>();
    const [current, setCurrent] = useState<Current | undefined>();
    const [location, setLocation] = useState<Location | undefined>();
    const [zipcode, setZipcode] = useState<string | undefined>();
    const [tempSensor, setTempSensor] = useState<TempSensor | undefined>();
    const [weatherSource, setWeatherSource] = useState<
        WeatherSource | undefined
    >('OpenMeteo');
    const [spoofWeather, setSpoofWeather] = useState<
        FakeWeatherKey | undefined
    >();

    const closeAlert = (id: string) => {
        setAlerts((prevState) => {
            const idx = prevState.findIndex((element) => element.id === id);
            if (idx !== -1) {
                prevState.splice(idx, 1);
            }
            return [...prevState];
        });
    };

    const addAlert = (msg: string | unknown) => {
        // @ts-ignore
        setAlerts((prevState) => {
            const idx = prevState.findIndex(
                // @ts-ignore
                (alert) => (alert.msg = msg.toString())
            );
            return [
                ...prevState,
                ...(idx === -1
                    ? [
                          {
                              id: uuidv4(),
                              // @ts-ignore
                              msg: msg.toString()
                          }
                      ]
                    : [])
            ];
        });
    };

    const searchParams = useSearchParams();

    const getAppWeather = (location: Location) => {
        if (!spoofWeather) {
            if (weatherSource === 'OpenWeatherMap') {
                void getCurrent(location);
                void getForecast(location);
            } else if (weatherSource === 'OpenMeteo') {
                void getWeather(location);
            }
        }
    };

    const getTempSensor = async (secretKey: string, token: string) => {
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
                addAlert(e);
            }
        }
        try {
            const result = await fetch(
                `/api/switchbot?secret=${secretKey}&token=${token}`
            );
            if (result.status === 401) {
                throw new Error(
                    `Failed to authenticate with switchbot. Please set valid Secret Key and Token.`
                );
            } else if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get switchbot temperature sensor data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
            const resp: TempSensor = await result.json();
            if (resp.body?.temperature) {
                resp.body.temperature = getTemp(
                    resp.body.temperature,
                    'c',
                    'f'
                );
            }
            setTempSensor(resp);
            const store: LocalStorageTempSensor = {
                time: moment().unix(),
                tempSensor: resp
            };
            localStorage.setItem('tempSensor', JSON.stringify(store));
        } catch (e) {
            addAlert(e);
        }
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
                    lastCurrent.current.source === weatherSource &&
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
                addAlert(e);
            }
        }
        try {
            const result = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature,weather_code&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_mean,weather_code&timezone=${moment.tz.guess()}&temperature_unit=fahrenheit`
            );
            if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get open-meteo weather data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
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
        } catch (e) {
            addAlert(e);
        }
    };
    let getCurrent = async (location: Location, force: boolean = false) => {
        const localStorageCurrent = localStorage.getItem('current');
        if (localStorageCurrent) {
            try {
                const lastCurrent: LocalStorageCurrent =
                    JSON.parse(localStorageCurrent);
                if (
                    !force &&
                    lastCurrent.current.source === weatherSource &&
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
                alert(JSON.stringify(e));
            }
        }
        try {
            const result = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
            );
            if (result.status === 401) {
                throw new Error(
                    `Failed to authenticate with openweathermap. Please set valid OWM App ID.`
                );
            } else if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get openweathermap current data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
            const data: OWCurrent = await result.json();
            data.coord = { lat: location.lat, lon: location.lon };
            setCurrent(owCurrentToCurrent(data));
            const store: LocalStorageCurrent = {
                time: moment().unix(),
                current: owCurrentToCurrent(data)
            };
            localStorage.setItem('current', JSON.stringify(store));
        } catch (e) {
            addAlert(e);
        }
    };
    let getForecast = async (location: Location, force: boolean = false) => {
        const localStorageForecast = localStorage.getItem('forecast');
        if (localStorageForecast) {
            try {
                const lastWeather: LocalStorageForecast =
                    JSON.parse(localStorageForecast);
                if (
                    !force &&
                    lastWeather.forecast.source === weatherSource &&
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
                addAlert(e);
            }
        }
        try {
            const result = await fetch(
                `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}&appid=${appid}`
            );
            if (result.status === 401) {
                throw new Error(
                    `Failed to authenticate with openweathermap. Please set valid OWM App ID.`
                );
            } else if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get openweathermap forecast data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
            const data: OWWeather = await result.json();
            data.lat = location.lat;
            data.lon = location.lon;
            setForecast(owWeatherToForecast(data));
            const store: LocalStorageForecast = {
                time: moment().unix(),
                forecast: owWeatherToForecast(data)
            };
            localStorage.setItem('forecast', JSON.stringify(store));
        } catch (e) {
            addAlert(e);
        }
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
                addAlert(e);
            }
        }
        try {
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
            if (result.status === 401) {
                throw new Error(
                    `Failed to authenticate with geoapify. Please set valid API Key.`
                );
            } else if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get geoapify location data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
            const data: ReverseLocation = await result.json();
            setLocation(data.features[0].properties);
            const store: LocalStorageLocation = {
                time: moment().unix(),
                location: data.features[0].properties,
                source: 'latlon'
            };
            localStorage.setItem('location', JSON.stringify(store));
        } catch (e) {
            addAlert(e);
        }
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
                addAlert(e);
            }
        }
        try {
            const result = await fetch(
                `https://api.geoapify.com/v1/geocode/search?text=${zipcode}&lang=en&limit=10&type=postcode&filter=countrycode:us&&format=json&apiKey=${apikey}`
            );
            if (result.status === 401) {
                throw new Error(
                    `Failed to authenticate with geoapify. Please set valid API Key.`
                );
            } else if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get geoapify location data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
            const data: ZipcodeLocation = await result.json();
            setLocation(data.results[0]);
            const store: LocalStorageLocation = {
                time: moment().unix(),
                location: data.results[0],
                source: 'zipcode'
            };
            localStorage.setItem('location', JSON.stringify(store));
        } catch (e) {
            // @ts-ignore
            addAlert(e);
        }
    };

    useInterval(() => {
        setIsNight(
            current
                ? moment().isAfter(moment.unix(current.sunset)) ||
                      moment().isBefore(moment.unix(current.sunrise))
                : false
        );
        if (location) {
            getAppWeather(location);
        }
        if (secretKey && token) {
            void getTempSensor(secretKey, token);
        }
    }, 60000);

    useEffect(() => {
        if (searchParams) {
            setAppid(searchParams.get('appid') || undefined);
            setApikey(searchParams.get('apikey') || undefined);
            setSecretKey(searchParams.get('secretKey') || undefined);
            setToken(searchParams.get('token') || undefined);
            setWeatherSource(
                (searchParams.get('weatherSource') as WeatherSource) ||
                    'OpenMeteo'
            );
            const zipcode = searchParams.get('zipcode');
            const lat = searchParams.get('lat');
            const lon = searchParams.get('lon');
            if (lat && Number(lat) && lon && Number(lon)) {
                setLatLon({ lat: parseFloat(lat), lon: parseFloat(lon) });
            }
            if (zipcode) {
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
        if (latLon && apikey) {
            void getReverseLocation(latLon);
        }
    }, [latLon]);

    useEffect(() => {
        if (apikey && zipcode && (!location || location.postcode !== zipcode)) {
            void getZipcodeLocation(zipcode);
        }
    }, [zipcode]);

    useEffect(() => {
        if (
            zipcode ||
            (zipcode === '' && zipcode !== searchParams?.get('zipcode')) ||
            apikey ||
            (apikey === '' && apikey !== searchParams?.get('apikey')) ||
            secretKey ||
            (secretKey === '' &&
                secretKey !== searchParams?.get('secretKey')) ||
            token ||
            (token === '' && token !== searchParams?.get('token')) ||
            appid ||
            (appid === '' && appid !== searchParams?.get('appid'))
        ) {
            const queryObj = {
                ...(latLon
                    ? { lat: latLon.lat.toString(), lon: latLon.lon.toString() }
                    : {}),
                ...(zipcode ? { zipcode } : {}),
                ...(appid ? { appid } : {}),
                ...(apikey ? { apikey } : {}),
                ...(secretKey ? { secretKey } : {}),
                ...(token ? { token } : {}),
                ...(weatherSource ? { weatherSource } : {})
            };
            const queryParams = new URLSearchParams(queryObj);
            if ('?' + queryParams.toString() !== window.location.search) {
                const newUrl =
                    window.location.protocol +
                    '//' +
                    window.location.host +
                    window.location.pathname +
                    '?' +
                    queryParams.toString();
                window.history.pushState({ path: newUrl }, '', newUrl);
            }
        }
    }, [zipcode, apikey, secretKey, token, appid, latLon, weatherSource]);

    useEffect(() => {
        if (secretKey && token) {
            void getTempSensor(secretKey, token);
        }
    }, [secretKey, token]);

    useEffect(() => {
        if (location) {
            if (
                !latLon ||
                location.lat.toFixed(6) !== latLon?.lat.toFixed(6) ||
                location.lon.toFixed(6) !== latLon?.lon.toFixed(6)
            ) {
                setLatLon({ lat: location.lat, lon: location.lon });
            }
            if (!zipcode || zipcode !== location.postcode) {
                setZipcode(location.postcode);
            }
            if (location) {
                getAppWeather(location);
            }
        }
    }, [location]);

    useEffect(() => {
        if (location) {
            getAppWeather(location);
        }
    }, [weatherSource]);

    useEffect(() => {
        if (!location && apikey) {
            if (latLon) {
                void getReverseLocation(latLon);
            } else if (zipcode) {
                void getZipcodeLocation(zipcode);
            }
        }
    }, [apikey]);

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

    useEffect(() => {
        if (spoofWeather) {
            setCurrent(fakeWeather[spoofWeather]);
        } else if (location) {
            getAppWeather(location);
        }
    }, [spoofWeather]);

    return (
        <main className="flex min-h-screen flex-col ">
            {current && forecast && location && isNight !== undefined ? (
                <Fragment>
                    <Background current={current} isNight={isNight} />
                    <div
                        style={{
                            position: 'absolute',
                            height: '100vh',
                            width: '100vw'
                        }}
                        className="flex flex-col justify-between grow p-8"
                    >
                        <div className="flex flex-row justify-between">
                            <div className="text text-7xl">{location.city}</div>
                            <DateTime />
                        </div>
                        <CurrentWeather
                            location={location}
                            current={current}
                            isNight={isNight}
                            tempSensor={tempSensor}
                        />
                        <WeeklyWeather forecast={forecast} />
                    </div>
                </Fragment>
            ) : (
                <Loading />
            )}
            <Settings
                settingsOpen={settingsOpen}
                setSettingsOpen={setSettingsOpen}
                latlon={latLon}
                setLatlon={setLatLon}
                zipcode={zipcode}
                setZipcode={setZipcode}
                apikey={apikey}
                setApikey={setApikey}
                secretKey={secretKey}
                setSecretKey={setSecretKey}
                token={token}
                setToken={setToken}
                weatherSource={weatherSource}
                setWeatherSource={setWeatherSource}
                appid={appid}
                setAppid={setAppid}
                spoofWeather={spoofWeather}
                setSpoofWeather={setSpoofWeather}
            />
            <Alerts alerts={alerts} closeAlert={closeAlert} />
        </main>
    );
}
