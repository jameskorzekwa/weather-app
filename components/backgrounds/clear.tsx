import React from 'react';
import Sun from '@/components/sun';
import Moon from '@/components/moon';
import { getDayNightBackground } from '@/components/backgrounds/dayNightBackground';

interface Props {
    id: number;
    isNight: boolean;
    mono?: boolean;
    inverted?: boolean;
}

export default function Clear({
    isNight,
    mono,
    inverted
}: Props) {
    const useNightBackground = isNight || !!mono;
    return (
        <div
            style={{
                backgroundColor: 'rgb(55,114,180)',
                backgroundImage: getDayNightBackground(
                    '0,0,0',
                    useNightBackground,
                    'var(--solar-transition-gradient, none)'
                ),
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            <svg viewBox="0 0 470 1536">
                <g transform={'translate(470, 0)'}>
                    {isNight ? (
                        <Moon inverted={inverted} />
                    ) : (
                        <Sun inverted={inverted} />
                    )}
                </g>
            </svg>
        </div>
    );
}
