import React from 'react';
import Thunderstorm from '@/components/backgrounds/thunderstom';
import Drizzle from '@/components/backgrounds/drizzle';
import Rain from '@/components/backgrounds/rain';
import Clouds from '@/components/backgrounds/clouds';
import Clear from '@/components/backgrounds/clear';
import Atmosphere from '@/components/backgrounds/atmosphere';
import Snow from '@/components/backgrounds/snow';
import {
    AtmosphereId,
    CloudId,
    Current,
    DrizzleId,
    RainId,
    SnowId,
    ThunderstormId
} from '@/types';

interface Props {
    current: Current;
    isNight: boolean;
}

export default function Background({ current, isNight }: Props) {
    const id = 802; //current.weather[0].id;
    let getWeatherType = (id: number) => {
        if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232].includes(id)) {
            return <Thunderstorm id={id as ThunderstormId} isNight={isNight} />;
        } else if ([300, 301, 302, 310, 311, 312, 313, 314, 321].includes(id)) {
            return <Drizzle id={id as DrizzleId} isNight={isNight} />;
        } else if (
            [500, 501, 502, 503, 504, 511, 520, 521, 522, 531].includes(id)
        ) {
            return <Rain id={id as RainId} isNight={isNight} />;
        } else if (
            [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622].includes(id)
        ) {
            // @ts-ignore
            return <Snow id={id as SnowId} isNight={isNight} />;
        } else if (
            [701, 711, 721, 731, 741, 751, 761, 762, 771, 781].includes(id)
        ) {
            return <Atmosphere id={id as AtmosphereId} isNight={isNight} />;
        } else if (id == 800) {
            return <Clear id={id} isNight={isNight} />;
        } else if ([801, 802, 803, 804].includes(id)) {
            // @ts-ignore
            return <Clouds id={id as CloudId} isNight={isNight} />;
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
