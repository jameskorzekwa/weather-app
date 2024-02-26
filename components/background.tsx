import React from 'react';
import Thunderstorm from '@/components/backgrounds/thunderstom';
import Drizzle from '@/components/backgrounds/drizzle';
import Rain from '@/components/backgrounds/rain';
import Clouds from '@/components/backgrounds/clouds';
import Clear from '@/components/backgrounds/clear';
import Atmosphere from '@/components/backgrounds/atmosphere';
import Snow from '@/components/backgrounds/snow';
import { Current } from '@/types';

interface Props {
    current: Current;
    isNight: boolean;
}

export default function Background({ current, isNight }: Props) {
    const id = current.weather[0].id;
    let getWeatherType = (id: number) => {
        if (id >= 200 && id <= 299) {
            return <Thunderstorm id={id} isNight={isNight} />;
        } else if (id >= 300 && id <= 399) {
            return <Drizzle id={id} isNight={isNight} />;
        } else if (id >= 500 && id <= 599) {
            return <Rain id={id} isNight={isNight} />;
        } else if (id >= 600 && id < 699) {
            return <Snow id={id} isNight={isNight} />;
        } else if (id >= 700 && id < 799) {
            return <Atmosphere id={id} isNight={isNight} />;
        } else if (id == 800) {
            return <Clear id={id} isNight={isNight} />;
        } else if ([801, 802, 803, 804].includes(id)) {
            // @ts-ignore
            return <Clouds id={id} isNight={isNight} />;
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                height: '100vh',
                width: '100vw'
            }}
        >
            {getWeatherType(id)}
        </div>
    );
}
