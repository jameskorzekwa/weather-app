'use client';
import '/css/weather-icons.css';
import moment from 'moment';
import { Weather } from '@/types';
import { getPrecipitationPercent, getTemp } from '@/lib/utils';

interface Props {
    weather: Weather;
}

export default function WeeklyWeather({ weather }: Props) {
    return (
        <div className="flex flex-row justify-between gap-4 flex-wrap">
            {Array.from(Array(5), (_e, i) => {
                return (
                    <div
                        key={i}
                        style={{
                            borderRadius: '5px',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)'
                        }}
                        className="flex flex-row grow justify-center items-center gap-2 py-4 px-1"
                    >
                        <i
                            className={`text wi wi-owm-${weather.daily[i + 1].weather[0].id} text-5xl`}
                        ></i>
                        <div className="text flex flex-col">
                            <div className="flex flex-row justify-between">
                                <div>
                                    {moment
                                        .unix(weather.daily[i + 1].dt)
                                        .format('ddd')
                                        .toUpperCase()}
                                </div>
                                <div>
                                    {getPrecipitationPercent(
                                        weather.daily[i + 1].pop
                                    )}
                                </div>
                            </div>
                            <div className="text flex flex-row justify-center items-center gap-2">
                                <div>
                                    H{' '}
                                    {getTemp(
                                        weather.daily[i + 1].temp.max,
                                        'f'
                                    )}
                                    °
                                </div>
                                <div>
                                    L{' '}
                                    {getTemp(
                                        weather.daily[i + 1].temp.min,
                                        'f'
                                    )}
                                    °
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
