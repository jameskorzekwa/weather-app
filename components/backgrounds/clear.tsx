import React from 'react';
import Sun from '@/components/sun';
import Moon from '@/components/moon';

interface Props {
    id: number;
    isNight: boolean;
    mono?: boolean;
    inverted?: boolean;
}

export default function Clear({ isNight, mono, inverted }: Props) {
    const useNightBg = isNight || !!mono;
    return (
        <div
            style={{
                backgroundColor: useNightBg ? 'black' : 'rgb(55,114,180)',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            <svg viewBox="0 0 470 1536">
                <g transform={'translate(470, 0)'}>
                    {isNight ? <Moon inverted={inverted} /> : <Sun inverted={inverted} />}
                </g>
            </svg>
        </div>
    );
}
