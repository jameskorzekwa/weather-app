'use client';
import '/css/weather-icons.css';
import { Current, TempSensor } from '@/types';
import { getTemp } from '@/lib/utils';
import moment from 'moment';

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
    const temp = tempSensor?.body?.temperature || current.main.temp;
    return (
        <div style={{ height: '100%' }} className="flex">
            <div className="flex flex-row items-center gap-8 py-12">
                <div className="flex flex-col items-center gap-8">
                    <i
                        className={`text wi wi-owm-${isNight ? 'night' : 'day'}-${current.weather[0].id} text-9xl`}
                    />
                    <div className="text text-4xl">
                        {current.weather[0].main}
                    </div>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="text text-9xl">
                        {getTemp(temp, 'f')}
                        °F
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex flex-row grow items-center justify-around text-5xl gap-2"
                    >
                        <div>
                            H{' '}
                            {getTemp(
                                Math.max(current.main.temp_max, temp),
                                'f'
                            )}
                            °
                        </div>
                        <div>
                            L{' '}
                            {getTemp(
                                Math.min(current.main.temp_min, temp),
                                'f'
                            )}
                            °
                        </div>
                    </div>
                    <div
                        style={{ width: '100%' }}
                        className="text flex flex-row grow items-center justify-between text-5xl gap-4"
                    >
                        <div className="flex flex-row gap-2">
                            <i className={`text wi wi-sunrise text-4xl`} />
                            <div className={`text text-3xl`}>
                                {moment.unix(current.sys.sunrise).format('LT')}
                            </div>
                        </div>
                        <div className="flex flex-row gap-2">
                            <i className={`text wi wi-sunset text-4xl`} />
                            <div className={`text text-3xl`}>
                                {moment.unix(current.sys.sunset).format('LT')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
