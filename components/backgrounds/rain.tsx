import React from 'react';
import Raining from '../raining';

interface Props {
    id: number;
    isNight: boolean;
}

export default function Rain({ id, isNight }: Props) {
    return (
        <div
            style={{
                backgroundColor: isNight ? 'black' : '#5f646c',
                height: '100vh',
                width: '100vw'
            }}
        >
            <Raining amount={100} diagonal={false} />
        </div>
    );
}
