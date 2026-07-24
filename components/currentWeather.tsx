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
        <div className="flex sm:h-full">
            <div className="flex flex-col items-center gap-4 py-4 sm:flex-row sm:gap-8 sm:py-12">
                <div className="flex flex-col items-center gap-2 sm:gap-8">
                    <i
                        className={`text wi wi-owm-${isNight ? 'night' : 'day'}-${current.id} text-7xl sm:text-9xl`}
                    />
                    <div className="text text-2xl sm:text-4xl">
                        {current.description}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-3 sm:gap-6">
                    <div className="flex flex-row">
                        <div className="text text-6xl sm:text-9xl">
                            {temp}
                            °F
                        </div>
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex grow flex-row items-center justify-around gap-2 text-3xl sm:text-5xl"
                    >
                        <div>H {Math.max(current.max_temp, temp)}°</div>
                        <div>L {Math.min(current.min_temp, temp)}°</div>
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex grow flex-row items-center justify-between gap-3 text-3xl sm:gap-4 sm:text-5xl"
                    >
                        <div className="flex flex-row gap-2">
                            <i
                                className={`text wi wi-sunrise text-2xl sm:text-4xl`}
                            />
                            <div className={`text text-xl sm:text-3xl`}>
                                {moment
                                    .unix(haSunrise ?? current.sunrise)
                                    .format('LT')}
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <i
                                className={`text wi wi-sunset text-2xl sm:text-4xl`}
                            />
                            <div className={`text text-xl sm:text-3xl`}>
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
