'use client';
import '/css/weather-icons.css';
import { Current, TempSensor } from '@/app/types';
import { getTemp } from '@/app/helpers';

interface Props {
    current: Current;
    isNight: boolean;
    tempSensor: TempSensor | null;
}

export default function CurrentWeather({
    current,
    isNight,
    tempSensor
}: Props) {
    return (
        <div style={{ height: '100%' }} className="flex">
            <div className="flex flex-row items-center gap-8 py-12">
                <div className="flex flex-col items-center gap-8">
                    <i
                        className={`text wi wi-owm-${isNight ? 'night' : 'day'}-${current.weather[0].id} text-9xl`}
                    ></i>
                    <div className="text text-4xl">
                        {current.weather[0].main}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="text text-9xl">
                        {getTemp(
                            tempSensor?.body?.temperature || current.main.temp,
                            'f'
                        )}
                        °F
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex flex-row grow items-center justify-between text-5xl gap-2"
                    >
                        <div>H {getTemp(current.main.temp_max, 'f')}°</div>
                        <div>L {getTemp(current.main.temp_min, 'f')}°</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
