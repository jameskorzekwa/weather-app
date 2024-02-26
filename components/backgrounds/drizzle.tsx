import React from 'react';
import Raining from '@/components/raining';

interface Props {
    id: number;
    isNight: boolean;
}

export default function Drizzle({ id, isNight }: Props) {
    return (
        <div
            style={{
                backgroundColor: isNight ? 'black' : '#5f646c',
                height: '100vh',
                width: '100vw'
            }}
        >
            <Raining amount={10} diagonal={false} />
        </div>
    );
}
