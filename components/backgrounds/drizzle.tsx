import React from 'react';
import Raining from '@/components/raining';
import { DrizzleId } from '@/types';

interface Props {
    id: DrizzleId;
    isNight: boolean;
}

export default function Drizzle({ id, isNight }: Props) {
    const settings = {
        300: { amount: 20, diagonal: false, rain: false },
        301: { amount: 50, diagonal: false, rain: false },
        302: { amount: 100, diagonal: false, rain: false },
        310: { amount: 10, diagonal: false, rain: true },
        311: { amount: 25, diagonal: false, rain: true },
        312: { amount: 50, diagonal: false, rain: true },
        313: { amount: 25, diagonal: true, rain: true },
        314: { amount: 50, diagonal: false, rain: true },
        321: { amount: 50, diagonal: false, rain: false }
    };
    const amount = settings[id].amount;
    const rain = settings[id].rain;
    return (
        <div
            style={{
                backgroundColor: isNight ? 'black' : '#5f646c',
                backgroundImage:
                    'var(--precipitation-solar-transition-gradient, none)',
                height: '100vh',
                width: '100vw'
            }}
        >
            <Raining amount={amount * 2} diagonal={false} size="small" />
            {rain && <Raining amount={amount} diagonal={false} size="large" />}
        </div>
    );
}
