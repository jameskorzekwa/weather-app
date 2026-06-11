'use client';
import '@/css/weather-icons.css';
import { Current, Location, TempSensor } from '@/types';
import moment from 'moment-timezone';

interface Props {
    location: Location;
    current: Current;
    isNight: boolean;
    tempSensor?: TempSensor;
    haSunrise?: number;
    haSunset?: number;
}

export default function CurrentWeather({
    location,
    current,
    isNight,
    tempSensor,
    haSunrise,
    haSunset
}: Props) {
    let temp = current.temp;
    if (
        tempSensor?.lat.toFixed(3) === location.lat.toFixed(3) &&
        tempSensor?.lon.toFixed(3) === location.lon.toFixed(3)
    ) {
        temp = tempSensor?.temperature || current.temp;
    }
    return (
        <div style={{ height: '100%' }} className="flex">
            <div className="flex flex-row items-center gap-8 py-12">
                <div className="flex flex-col items-center gap-8">
                    <i
                        className={`text wi wi-owm-${isNight ? 'night' : 'day'}-${current.id} text-9xl`}
                    />
                    <div className="text text-4xl">{current.description}</div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-row">
                        <div className="text text-9xl">
                            {temp}
                            °F
                        </div>
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex flex-row grow items-center justify-around text-5xl gap-2"
                    >
                        <div>H {Math.max(current.max_temp, temp)}°</div>
                        <div>L {Math.min(current.min_temp, temp)}°</div>
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex flex-row grow items-center justify-between text-5xl gap-4"
                    >
                        <div className="flex flex-row gap-2">
                            <i className={`text wi wi-sunrise text-4xl`} />
                            <div className={`text text-3xl`}>
                                {moment
                                    .unix(haSunrise ?? current.sunrise)
                                    .format('LT')}
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <i className={`text wi wi-sunset text-4xl`} />
                            <div className={`text text-3xl`}>
                                {moment
                                    .unix(haSunset ?? current.sunset)
                                    .format('LT')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
