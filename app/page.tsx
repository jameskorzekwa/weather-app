"use client";
import '/css/weather-icons.css'
import {useInterval} from 'usehooks-ts'
import moment from "moment";
import {useEffect, useState} from "react";
import Background from "./background"
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
} from "@/app/types";
import {getPrecipitationPercent, getTemp, roundTo} from "@/app/helpers";
import {useSearchParams} from "next/navigation";


export default function Home() {
    const [datetime, setDatetime] = useState<moment.Moment>(moment())
    const [isNight, setIsNight] = useState<boolean>(false)
    const [apikey, setApikey] = useState<string | null>(null)
    const [appid, setAppid] = useState<string | null>(null)
    const [secretKey, setSecretKey] = useState<string | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [latLon, setLatLon] = useState<LatLon | null>(null)
    const [forecast, setForecast] = useState<Forecast | null>(null)
    const [current, setCurrent] = useState<Current | null>(null)
    const [weather, setWeather] = useState<Weather | null>(null)
    const [location, setLocation] = useState<Location | null>(null)
    const [zipcode, setZipcode] = useState<string | null>()
    const [tempSensor, setTempSensor] = useState<TempSensor | null>()

    const searchParams = useSearchParams()

    let getTempSensor = async () => {
        const localStorageTempSensor = localStorage.getItem("tempSensor")
        if (localStorageTempSensor) {
            try {
                const last: LocalStorageTempSensor = JSON.parse(localStorageTempSensor)
                if (moment.unix(last.time).isAfter(moment().subtract(0, "minutes"))) {
                    setTempSensor(last.tempSensor)
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }

        const result = await fetch(`/api/switchbot?secret=${secretKey}&token=${token}`);
        const resp: TempSensor = await result.json()
        if (resp.body?.temperature) {
            resp.body.temperature = resp.body.temperature + 273
        }
        setTempSensor(resp)
        const store: LocalStorageTempSensor = {time: moment().unix(), tempSensor: resp}
        localStorage.setItem("tempSensor", JSON.stringify(store))
    }

    let getCurrent = async (location: Location, force: boolean = false) => {
        const localStorageCurrent = localStorage.getItem("current")
        if (localStorageCurrent) {
            try {
                const lastCurrent: LocalStorageCurrent = JSON.parse(localStorageCurrent)
                if (!force && moment.unix(lastCurrent.time).isAfter(moment().subtract(5, "minutes")) &&
                    (roundTo(lastCurrent.current.coord.lat, 6) === roundTo(location?.lat, 6) &&
                        roundTo(lastCurrent.current.coord.lon, 6) === roundTo(location?.lon, 6))) {
                    setCurrent(lastCurrent.current)
                    setIsNight(moment().isAfter(moment.unix(lastCurrent.current.sys.sunset)) || moment().isBefore(moment.unix(lastCurrent.current.sys.sunrise)))
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${appid}`)
        const data: Current = await result.json()
        data.coord = {lat: location.lat, lon: location.lon}
        setCurrent(data)
        setIsNight(data ? moment().isAfter(moment.unix(data.sys.sunset)) || moment().isBefore(moment.unix(data.sys.sunrise)) : false)
        const store: LocalStorageCurrent = {time: moment().unix(), current: data}
        localStorage.setItem("current", JSON.stringify(store))
    }
    let getWeather = async (location: Location, force: boolean = false) => {
        const localStorageWeather = localStorage.getItem("weather")
        if (localStorageWeather) {
            try {
                const lastWeather: LocalStorageWeather = JSON.parse(localStorageWeather)
                if (!force && moment.unix(lastWeather.time).isAfter(moment().subtract(1, "hours")) &&
                    (roundTo(lastWeather.weather.lat, 6) === roundTo(location?.lat, 6) &&
                        roundTo(lastWeather.weather.lon, 6) === roundTo(location?.lon, 6))) {
                    setWeather(lastWeather.weather)
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        const result = await fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}&appid=${appid}`)
        const data: Weather = await result.json()
        data.lat = location.lat;
        data.lon = location.lon
        setWeather(data)
        const store: LocalStorageWeather = {time: moment().unix(), weather: data}
        localStorage.setItem("weather", JSON.stringify(store))
    }

    let getForecast = async (location: Location, force: boolean = false) => {
        const localStorageForecast = localStorage.getItem("forecast")
        if (localStorageForecast) {
            try {
                const lastForecast: LocalStorageForecast = JSON.parse(localStorageForecast)
                if (!force && moment.unix(lastForecast.time).isAfter(moment().subtract(10, "minutes")) &&
                    (roundTo(lastForecast.forecast.city.coord.lat, 6) === roundTo(location?.lat, 6) &&
                        roundTo(lastForecast.forecast.city.coord.lon, 6) === roundTo(location?.lon, 6))) {
                    setForecast(lastForecast.forecast)
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        const result = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lon}&appid=${appid}`)
        const data: Forecast = await result.json()
        data.city.coord = {lat: location.lat, lon: location.lon}
        setForecast(data)
        const store: LocalStorageForecast = {time: moment().unix(), forecast: data}
        localStorage.setItem("forecast", JSON.stringify(store))
    }

    let getReverseLocation = async (latLon: LatLon) => {
        const localStorageLocation = localStorage.getItem("location")
        if (localStorageLocation) {
            try {
                const lastLocation: LocalStorageLocation = JSON.parse(localStorageLocation)
                if (roundTo(lastLocation.location.lat, 4) === roundTo(latLon?.lat, 4) &&
                    roundTo(lastLocation.location.lon, 4) === roundTo(latLon?.lon, 4)) {
                    setLocation(lastLocation.location)
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        const result = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latLon?.lat}&lon=${latLon?.lon}&apiKey=${apikey}`)
        const data: ReverseLocation = await result.json()
        setLocation(data.features[0].properties)
        const store: LocalStorageLocation = {time: moment().unix(), location: data.features[0].properties}
        localStorage.setItem("location", JSON.stringify(store))
    }

    let getZipcodeLocation = async () => {
        const localStorageLocation = localStorage.getItem("location")
        if (localStorageLocation) {
            try {
                const lastLocation: LocalStorageLocation = JSON.parse(localStorageLocation)
                if (lastLocation.location.postcode === zipcode) {
                    setLocation(lastLocation.location)
                    return
                }
            } catch (e) {
                console.log(e)
            }
        }
        const result = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${zipcode}&lang=en&limit=10&type=postcode&filter=countrycode:us&&format=json&apiKey=${apikey}`)
        const data: ZipcodeLocation = await result.json()
        setLocation(data.results[0])
        const store: LocalStorageLocation = {time: moment().unix(), location: data.results[0]}
        localStorage.setItem("location", JSON.stringify(store))
    }

    useInterval(() => {
        const now = moment()
        setDatetime(now)
        setIsNight(current ? now.isAfter(moment.unix(current.sys.sunset)) || now.isBefore(moment.unix(current.sys.sunrise)) : false)
    }, 1000)

    useInterval(() => {
        if (appid && location) {
            getWeather(location)
            getCurrent(location)
        }
    }, 60000)

    useEffect(() => {
        if (searchParams) {
            setAppid(searchParams.get("appid"))
            setApikey(searchParams.get("apikey"))
            setSecretKey(searchParams.get("secretKey"))
            setToken(searchParams.get("token"))
            getTempSensor()
            const zipcode = searchParams.get("zipcode")
            const lat = searchParams.get("lat")
            const lon = searchParams.get("lon")
            if (lat && Number(lat) && lon && Number(lon)) {
                setLatLon({lat: parseFloat(lat), lon: parseFloat(lon)})
            } else if (zipcode) {
                setZipcode(zipcode)
            }
        }
    }, [])

    useEffect(() => {
        if (secretKey && token) {
            getTempSensor()
        }
    }, [secretKey, token])

    useEffect(() => {
        if (!location && latLon) {
            getReverseLocation(latLon)
        }
    }, [latLon])

    useEffect(() => {
        if (apikey && zipcode) {
            getZipcodeLocation()
        }
    }, [zipcode])

    useEffect(() => {
        if (location) {
            if (!latLon) {
                setLatLon({lat: location.lat, lon: location.lon})
            }
            if (!zipcode) {
                setZipcode(location.postcode)
            }
            if (appid && location) {
                getCurrent(location)
                getWeather(location)
                getForecast(location)
            }
        }
    }, [location])

    return current && weather && forecast && latLon ? (
        <main className="flex min-h-screen flex-col ">
            <Background id={current.weather[0].id} isNight={isNight}/>
            <div style={{position: "absolute", height: "100vh", width: "100vw"}}
                 className="flex flex-col justify-between grow p-16">
                <div className="flex flex-row justify-between">
                    <div
                        className="text text-7xl">{location?.city || forecast.city.name}</div>
                    <div className="flex flex-col items-end gap-4">
                        <div className="text text-3xl">{datetime.format("dddd, MMMM Do YYYY")}</div>
                        <div className="text text-5xl">{datetime.format("h:mm A")}</div>
                    </div>
                </div>
                <div style={{height: "100%"}} className="flex">
                    <div className="flex flex-row items-center gap-8 py-12">
                        <div className="flex flex-col items-center gap-8">
                            <i className={`text wi wi-owm-${isNight ? "night" : "day"}-${current.weather[0].id} text-9xl`}></i>
                            <div className="text text-4xl">{current.weather[0].main}</div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className="text text-9xl">{getTemp(tempSensor?.body?.temperature || current.main.temp, "f")}°F
                            </div>
                            <div style={{width: "100%"}}
                                 className="text flex flex-row grow items-center justify-between text-5xl gap-2">
                                <div>H {getTemp(current.main.temp_max, "f")}°</div>
                                <div>L {getTemp(current.main.temp_min, "f")}°</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-row justify-between gap-4 flex-wrap">
                    {Array.from(Array(5), (e, i) => {
                        return (
                            <div key={i} style={{borderRadius: "5px", backgroundColor: "rgba(0, 0, 0, 0.1)"}}
                                 className="flex flex-row grow justify-center items-center gap-2 py-4 px-1">
                                <i className={`text wi wi-owm-${weather.daily[i + 1].weather[0].id} text-5xl`}></i>
                                <div className="text flex flex-col">
                                    <div className="flex flex-row justify-between">
                                        <div>{moment.unix(weather.daily[i + 1].dt).format("ddd")}</div>
                                        <div>{getPrecipitationPercent(weather.daily[i + 1].pop)}</div>
                                    </div>
                                    <div className="text flex flex-row justify-center items-center gap-2">
                                        <div>H {getTemp(weather.daily[i + 1].temp.max, "f")}°</div>
                                        <div>L {getTemp(weather.daily[i + 1].temp.min, "f")}°</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </main>
    ) : null
}

