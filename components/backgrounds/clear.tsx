import React from 'react';
import Cloud from '@/components/cloud';
import seedrandom from 'seedrandom';
import { seededRandomNumber } from '@/lib/utils';

interface Props {
    id: number;
    isNight: boolean;
}

export default function Clear({ isNight }: Props) {
    const colors = [
        '#839192',
        '#B3B6B7',
        '#A6ACAF',
        '#898b8c',
        '#868e93',
        '#bccdd3'
    ];
    const rdm = seedrandom('seed14');
    const fills = Array.from(
        Array(6),
        () => colors[seededRandomNumber(rdm, 0, 5)]
    );
    const durations = Array.from(Array(6), () =>
        seededRandomNumber(rdm, 120000, 240000)
    );
    const delays = Array.from(Array(6), () =>
        seededRandomNumber(rdm, -240000, 0)
    );
    const y = Array.from(Array(6), () => seededRandomNumber(rdm, 0, 200));
    return (
        <div
            style={{
                backgroundColor: isNight ? 'black' : 'rgb(55,114,180)',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            <svg viewBox="0 0 470 1536">
                <ellipse
                    fill={isNight ? '#eedea3' : '#F1C40F'}
                    cx="0"
                    cy="0"
                    rx={isNight ? '40' : '60'}
                    ry={isNight ? '40' : '60'}
                    transform="translate(470, 0)"
                />
                {isNight
                    ? null
                    : Array.from(Array(6), (_e, i) => (
                          <Cloud
                              key={i}
                              y={y[i]}
                              fill={fills[i]}
                              duration={durations[i]}
                              delay={delays[i]}
                          />
                      ))}
            </svg>
        </div>
    );
}
