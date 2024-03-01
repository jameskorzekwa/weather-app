'use client';
import '/css/weather-icons.css';
import { Forecast } from '@/types';
import { getPrecipitationPercent, getTemp } from '@/lib/utils';

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
                                    {forecast.daily[i].dt
                                        .format('ddd')
                                        .toUpperCase()}
                                </div>
                                <div>
                                    {getPrecipitationPercent(
                                        forecast.daily[i].pop
                                    )}
                                </div>
                            </div>
                            <div className="text flex flex-row justify-center items-center gap-2">
                                <div>
                                    H {getTemp(forecast.daily[i].max_temp, 'f')}
                                    °
                                </div>
                                <div>
                                    L {getTemp(forecast.daily[i].min_temp, 'f')}
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
