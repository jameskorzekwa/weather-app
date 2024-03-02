'use client';
import '/css/weather-icons.css';
import { Forecast } from '@/types';
import moment from 'moment-timezone';

interface Props {
    forecast: Forecast;
}

export default function WeeklyWeather({ forecast }: Props) {
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
                            className={`text wi wi-owm-${forecast.daily[i].id} text-5xl`}
                        ></i>
                        <div className="text flex flex-col">
                            <div className="flex flex-row justify-between">
                                <div>
                                    {moment
                                        .unix(forecast.daily[i].dt)
                                        .format('ddd')
                                        .toUpperCase()}
                                </div>
                                <div>{forecast.daily[i].pop}%</div>
                            </div>
                            <div className="text flex flex-row justify-center items-center gap-2">
                                <div>H {forecast.daily[i].max_temp}°</div>
                                <div>L {forecast.daily[i].min_temp}°</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
