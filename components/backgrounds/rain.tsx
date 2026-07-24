import React from 'react';
import Raining from '../raining';
import { RainId } from '@/types';

interface Props {
    id: RainId;
    isNight: boolean;
}

export default function Rain({ id, isNight }: Props) {
    const settings = {
        500: { amount: 20, diagonal: false },
        501: { amount: 50, diagonal: false },
        502: { amount: 100, diagonal: false },
        503: { amount: 150, diagonal: false },
        504: { amount: 200, diagonal: false },
        511: { amount: 50, diagonal: false },
        520: { amount: 20, diagonal: true },
        521: { amount: 50, diagonal: false },
        522: { amount: 100, diagonal: false },
        531: { amount: 150, diagonal: false }
    };
    const amount = settings[id].amount;
    return (
        <div
            style={{
                backgroundColor: isNight ? 'black' : '#5f646c',
                backgroundImage: 'var(--solar-transition-gradient, none)',
                height: '100vh',
                width: '100vw'
            }}
        >
            <Raining amount={amount} diagonal={false} size="large" />
        </div>
    );
}
