'use client';
import '@/css/weather-icons.css';
import { useInterval } from 'usehooks-ts';
import moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { Fragment, Suspense, useEffect, useState } from 'react';
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
    Sun2Pair,
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
    AWNDeviceToTempSensor,
    getLocationName,
    omWeatherToCurrent,
    omWeatherToForecast,
    owCurrentToCurrent,
    owWeatherToForecast
} from '@/lib/utils';
import Settings from '@/components/settings';
import { fakeWeather } from '@/constants/data';
import Alerts from '@/components/alerts';
import { Device } from 'ambient-weather-api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';

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

function HomeContent() {
    const [alerts, setAlerts] = useState<{ id: string; msg: string }[]>([]);
    const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
    const [isNight, setIsNight] = useState<boolean | undefined>();
    const [geoapifyApiKey, setGeoapifyApiKey] = useState<string | undefined>();
    const [openWeatherMapAppId, setOpenWeatherMapAppId] = useState<string | undefined>();
    const [awnApiKey, setAwnApiKey] = useState<string | undefined>();
    const [awnApplicationKey, setAwnApplicationKey] = useState<string | undefined>();
    const [latLon, setLatLon] = useState<LatLon | undefined>();
    const [forecast, setForecast] = useState<Forecast | undefined>();
    const [current, setCurrent] = useState<Current | undefined>();
    const [location, setLocation] = useState<Location | undefined>();
    const [zipcode, setZipcode] = useState<string | undefined>();
    const [zipCity, setZipCity] = useState<string | undefined>();
    const [tempSensor, setTempSensor] = useState<TempSensor | undefined>();
    const [weatherSource, setWeatherSource] = useState<
        WeatherSource | undefined
    >('OpenMeteo');
    const [useSun2, setUseSun2] = useState<boolean>(true);
    const [sun2Pairs, setSun2Pairs] = useState<Sun2Pair[]>([]);
    const [sun2Prefix, setSun2Prefix] = useState<string | undefined>();
    const [haSunrise, setHaSunrise] = useState<number | undefined>();
    const [haSunset, setHaSunset] = useState<number | undefined>();
    const [mono, setMono] = useState<boolean>(false);
    const [spoofWeather, setSpoofWeather] = useState<
        FakeWeatherKey | undefined
    >();

    const checkIsNight = () => {
        if (!spoofWeather) {
            const sunriseUnix = haSunrise ?? current?.sunrise;
            const sunsetUnix = haSunset ?? current?.sunset;
            setIsNight(
                sunriseUnix !== undefined && sunsetUnix !== undefined
                    ? moment().isAfter(moment.unix(sunsetUnix)) ||
                          moment().isBefore(moment.unix(sunriseUnix))
                    : false
            );
        }
    };

    const closeAlert = (id?: string) => {
        if (!id) {
            setAlerts([]);
        }
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
                (alert) => alert.msg === msg.toString()
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

    const getTempSensor = async (awnApiKey: string, awnApplicationKey: string) => {
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
                `api/awn?awnApiKey=${awnApiKey}&awnApplicationKey=${awnApplicationKey}`
            );
            if (result.status === 401) {
                throw new Error(
                    `Failed to authenticate with awn. Please set valid Secret Key and ApplicationKey.`
                );
            } else if (result.status < 200 || result.status > 299) {
                throw new Error(
                    `Failed to get awn temperature sensor data\nstatus code: ${result.status}\nmessage: ${await result.text()}`
                );
            }
            const resp: Device[] = await result.json();
            const awnTempSensor = AWNDeviceToTempSensor(resp[0]);
            setTempSensor(awnTempSensor);
            const store: LocalStorageTempSensor = {
                time: moment().unix(),
                tempSensor: awnTempSensor
            };
            localStorage.setItem('tempSensor', JSON.stringify(store));
        } catch (e) {
            addAlert(e);
        }
    };
    const getHaSun2 = async () => {
        // Lists every Sun2 sunrise/sunset pair the addon can see. 503 =
        // not inside HA — we stay quiet and let the weather provider's
        // sunrise/sunset win the fallback. The picker logic in the
        // sun2Pairs useEffect below decides which pair (if any) populates
        // haSunrise/haSunset.
        try {
            const r = await fetch('api/ha/sun2');
            if (!r.ok) return;
            const json = await r.json();
            setSun2Pairs(Array.isArray(json.pairs) ? json.pairs : []);
        } catch {
            // network error or non-JSON body — ignore, fallback wins
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
                        .isAfter(moment().subtract(2, 'minutes')) ||
                        moment
                            .unix(lastForecast.time)
                            .isAfter(moment().subtract(2, 'minutes'))) &&
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
                `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature,weather_code,precipitation,rain,cloud_cover&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_mean,weather_code&timezone=${moment.tz.guess()}&temperature_unit=fahrenheit`
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
                `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${openWeatherMapAppId}`
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
                `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}&appid=${openWeatherMapAppId}`
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
                `https://api.geoapify.com/v1/geocode/reverse?lat=${latLon?.lat}&lon=${latLon?.lon}&apiKey=${geoapifyApiKey}`,
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
                `https://api.geoapify.com/v1/geocode/search?text=${zipcode}&lang=en&limit=10&type=postcode&filter=countrycode:us&&format=json&apiKey=${geoapifyApiKey}`
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
    // Resolve a ZIP to its USPS place name (the "mailing city"). Geoapify
    // returns `city: null` for unincorporated areas — e.g. 80465 comes back
    // as "Jefferson County" even though its mailing city is Morrison — so we
    // look the postcode up via Zippopotam (free, no key, US data) and let
    // getLocationName prefer it over the county. Best-effort: a 404 (unknown
    // or non-US ZIP) or network error just leaves zipCity unset and the
    // geocoder's own fields win. Cached in localStorage so kiosks survive a
    // reload offline.
    const getZipCity = async (zip: string) => {
        const cacheKey = `zipCity:${zip}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            setZipCity(cached);
            return;
        }
        try {
            const result = await fetch(`https://api.zippopotam.us/us/${zip}`);
            if (!result.ok) return;
            const data = await result.json();
            const name: string | undefined = data?.places?.[0]?.['place name'];
            if (name) {
                setZipCity(name);
                localStorage.setItem(cacheKey, name);
            }
        } catch {
            // unknown/non-US ZIP or network error — fall back to geocoder name
        }
    };

    useInterval(() => {
        if (location) {
            getAppWeather(location);
        }
        if (awnApiKey && awnApplicationKey) {
            void getTempSensor(awnApiKey, awnApplicationKey);
        }
        if (useSun2) {
            void getHaSun2();
        }
        if (current) {
            checkIsNight();
        }
    }, 60000);

    useEffect(() => {
        if (searchParams) {
            setOpenWeatherMapAppId(searchParams.get('openWeatherMapAppId') || undefined);
            setGeoapifyApiKey(searchParams.get('geoapifyApiKey') || undefined);
            setAwnApiKey(searchParams.get('awnApiKey') || undefined);
            setAwnApplicationKey(searchParams.get('awnApplicationKey') || undefined);
            setWeatherSource(
                (searchParams.get('weatherSource') as WeatherSource) ||
                    'OpenMeteo'
            );
            // useSun2 defaults to on; only `useSun2=0` turns it off so
            // that an unset URL param means "use Sun2 if it's there".
            setUseSun2(searchParams.get('useSun2') !== '0');
            setSun2Prefix(searchParams.get('sun2Prefix') || undefined);
            setMono(searchParams.get('mono') === '1');
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
        if (awnApiKey && awnApplicationKey) {
            void getTempSensor(awnApiKey, awnApplicationKey);
        }
    }, [awnApiKey, awnApplicationKey]);

    useEffect(() => {
        if (latLon && geoapifyApiKey) {
            void getReverseLocation(latLon);
        }
    }, [latLon]);

    useEffect(() => {
        if (geoapifyApiKey && zipcode && (!location || location.postcode !== zipcode)) {
            void getZipcodeLocation(zipcode);
        }
    }, [zipcode]);

    // Look up the USPS mailing city for the displayed header whenever we know
    // a ZIP — whether it came straight from config or was filled in from the
    // resolved location's postcode (e.g. a lat/lon config). Needs no API key.
    useEffect(() => {
        if (zipcode) {
            void getZipCity(zipcode);
        } else {
            setZipCity(undefined);
        }
    }, [zipcode]);

    useEffect(() => {
        if (
            zipcode ||
            (zipcode === '' && zipcode !== searchParams?.get('zipcode')) ||
            geoapifyApiKey ||
            (geoapifyApiKey === '' && geoapifyApiKey !== searchParams?.get('geoapifyApiKey')) ||
            awnApiKey ||
            (awnApiKey === '' && awnApiKey !== searchParams?.get('awnApiKey')) ||
            awnApplicationKey ||
            (awnApplicationKey === '' &&
                awnApplicationKey !== searchParams?.get('awnApplicationKey')) ||
            openWeatherMapAppId ||
            (openWeatherMapAppId === '' && openWeatherMapAppId !== searchParams?.get('openWeatherMapAppId'))
        ) {
            const queryObj = {
                ...(latLon
                    ? { lat: latLon.lat.toString(), lon: latLon.lon.toString() }
                    : {}),
                ...(zipcode ? { zipcode } : {}),
                ...(openWeatherMapAppId ? { openWeatherMapAppId } : {}),
                ...(geoapifyApiKey ? { geoapifyApiKey } : {}),
                ...(awnApiKey ? { awnApiKey } : {}),
                ...(awnApplicationKey ? { awnApplicationKey } : {}),
                ...(weatherSource ? { weatherSource } : {}),
                ...(useSun2 ? {} : { useSun2: '0' }),
                ...(sun2Prefix ? { sun2Prefix } : {}),
                ...(mono ? { mono: '1' } : {})
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
    }, [zipcode, geoapifyApiKey, awnApiKey, awnApplicationKey, openWeatherMapAppId, latLon, weatherSource, useSun2, sun2Prefix, mono]);

    useEffect(() => {
        if (awnApiKey && awnApplicationKey) {
            void getTempSensor(awnApiKey, awnApplicationKey);
        }
    }, [awnApiKey, awnApplicationKey]);

    useEffect(() => {
        if (location) {
            if (
                !latLon ||
                location.lat.toFixed(3) !== latLon?.lat.toFixed(3) ||
                location.lon.toFixed(3) !== latLon?.lon.toFixed(3)
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
        if (!location && geoapifyApiKey) {
            if (latLon) {
                void getReverseLocation(latLon);
            } else if (zipcode) {
                void getZipcodeLocation(zipcode);
            }
        }
    }, [geoapifyApiKey]);

    useEffect(() => {
        if (current) {
            checkIsNight();
        }
    }, [current]);

    useEffect(() => {
        if (useSun2) {
            void getHaSun2();
        } else {
            setSun2Pairs([]);
            setHaSunrise(undefined);
            setHaSunset(undefined);
        }
    }, [useSun2]);

    useEffect(() => {
        // Picker logic: 0 pairs → fall back; 1 pair → use it; >1 pair →
        // require the user to choose (via sun2Prefix). Without a valid
        // choice we deliberately leave haSunrise/haSunset undefined so
        // the Settings modal can prompt rather than silently picking the
        // wrong location.
        if (!useSun2 || sun2Pairs.length === 0) {
            setHaSunrise(undefined);
            setHaSunset(undefined);
            return;
        }
        const chosen =
            sun2Pairs.length === 1
                ? sun2Pairs[0]
                : sun2Pairs.find((p) => p.prefix === sun2Prefix);
        if (!chosen) {
            setHaSunrise(undefined);
            setHaSunset(undefined);
            return;
        }
        const rise = moment(chosen.sunrise);
        const set = moment(chosen.sunset);
        setHaSunrise(rise.isValid() ? rise.unix() : undefined);
        setHaSunset(set.isValid() ? set.unix() : undefined);
    }, [useSun2, sun2Pairs, sun2Prefix]);

    useEffect(() => {
        if (current) {
            checkIsNight();
        }
    }, [haSunrise, haSunset]);

    useEffect(() => {
        if (spoofWeather) {
            setCurrent(fakeWeather[spoofWeather]);
        } else if (location) {
            getAppWeather(location);
        }
    }, [spoofWeather]);

    useEffect(() => {
        document.documentElement.classList.toggle('mono', mono);
        document.documentElement.classList.toggle('invert', mono);
        return () => {
            document.documentElement.classList.remove('mono');
            document.documentElement.classList.remove('invert');
        };
    }, [mono]);

    let localTemp = false;
    if (
        tempSensor?.lat.toFixed(3) === location?.lat.toFixed(3) &&
        tempSensor?.lon.toFixed(3) === location?.lon.toFixed(3)
    ) {
        localTemp = !!tempSensor?.temperature;
    }

    return (
        <main className="flex min-h-screen flex-col ">
            {current && forecast && location && isNight !== undefined ? (
                <Fragment>
                    <Background current={current} isNight={isNight} mono={mono} />
                    <div
                        style={{
                            position: 'absolute',
                            height: '100vh',
                            width: '100vw'
                        }}
                        className="flex flex-col justify-between grow p-8"
                    >
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row gap-5 content-center shrink">
                                <div className="text text-7xl">
                                    {getLocationName(location, zipCity)}
                                </div>
                                <div>
                                    {localTemp && (
                                        <FontAwesomeIcon
                                            icon={faLocationCrosshairs}
                                            inverse
                                            style={{ paddingTop: 30 }}
                                            size="xl"
                                        />
                                    )}
                                </div>
                            </div>
                            <DateTime />
                        </div>
                        <CurrentWeather
                            location={location}
                            current={current}
                            isNight={isNight}
                            tempSensor={tempSensor}
                            haSunrise={haSunrise}
                            haSunset={haSunset}
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
                geoapifyApiKey={geoapifyApiKey}
                setGeoapifyApiKey={setGeoapifyApiKey}
                awnApiKey={awnApiKey}
                setAwnApiKey={setAwnApiKey}
                awnApplicationKey={awnApplicationKey}
                setAwnApplicationKey={setAwnApplicationKey}
                weatherSource={weatherSource}
                setWeatherSource={setWeatherSource}
                openWeatherMapAppId={openWeatherMapAppId}
                setOpenWeatherMapAppId={setOpenWeatherMapAppId}
                sun2Pairs={sun2Pairs}
                sun2Prefix={sun2Prefix}
                setSun2Prefix={setSun2Prefix}
                spoofWeather={spoofWeather}
                setSpoofWeather={setSpoofWeather}
                isNight={isNight}
                setIsNight={setIsNight}
                mono={mono}
                setMono={setMono}
                addAlert={addAlert}
            />
            <Alerts alerts={alerts} closeAlert={closeAlert} />
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<Loading />}>
            <HomeContent />
        </Suspense>
    );
}
