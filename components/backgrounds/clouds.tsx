import React from 'react';
import Cloud from '@/components/cloud';
import seedrandom from 'seedrandom';
import { seededRandomNumber } from '@/lib/utils';

interface Props {
    id: 801 | 802 | 803 | 804;
    isNight: boolean;
}

export default function Clouds({ id, isNight }: Props) {
    const cloudSettings = {
        801: { count: 8, seed: 'seed8', color: 'rgb(55,114,180)' },
        802: { count: 12, seed: 'seed8', color: 'rgb(55,114,180)' },
        803: { count: 16, seed: 'seed8', color: 'rgba(76,82,86,0.54)' },
        804: { count: 25, seed: 'seed8', color: 'rgba(76,82,86,0.54)' }
    };

    const colors = [
        '#737779',
        '#839192',
        '#B3B6B7',
        '#A6ACAF',
        '#898b8c',
        '#868e93',
        '#bccdd3',
        '#5b5d5e'
    ];

    const rdm = seedrandom('seed8');
    const fills = Array.from(
        Array(cloudSettings[id].count),
        (_e, i) => colors[seededRandomNumber(rdm, 0, 7)]
    );
    const durations = Array.from(Array(cloudSettings[id].count), (_e, i) =>
        seededRandomNumber(rdm, 60000, 120000)
    );
    const delays = Array.from(Array(cloudSettings[id].count), (_e, i) =>
        seededRandomNumber(rdm, -20000, 20000)
    );
    const y = Array.from(Array(cloudSettings[id].count), (_e, i) =>
        seededRandomNumber(rdm, -20, 110)
    );
    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            {isNight && (
                <div
                    style={{
                        position: 'absolute',
                        height: '100vh',
                        width: '100vw',
                        overflow: 'hidden',
                        backgroundColor: 'rgba(0,0,0,0.74)'
                    }}
                />
            )}
            <div
                style={{
                    backgroundColor: isNight
                        ? 'rgba(0,0,0,0.74)'
                        : cloudSettings[id].color,
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden'
                }}
            >
                <svg viewBox="0 0 170 1536">
                    {Array.from(Array(cloudSettings[id].count), (_e, i) => (
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
        </div>
    );
}
