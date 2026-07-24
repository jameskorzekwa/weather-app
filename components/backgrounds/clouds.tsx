import React from 'react';
import Cloud from '@/components/cloud';
import seedrandom from 'seedrandom';
import { seededRandomNumber } from '@/lib/utils';
import { CloudId } from '@/types';

interface Props {
    id: CloudId;
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
        '#767676',
        '#8d8d8d',
        '#b5b5b5',
        '#aaaaaa',
        '#8a8a8a',
        '#8c8c8c',
        '#c9c9c9',
        '#5c5c5c'
    ];

    const rdm = seedrandom('seed8');
    const fills = Array.from(
        Array(cloudSettings[id].count),
        (_e) => colors[seededRandomNumber(rdm, 0, 7)]
    );
    const durations = Array.from(Array(cloudSettings[id].count), (_e) =>
        seededRandomNumber(rdm, 60000, 120000)
    );
    const delays = Array.from(Array(cloudSettings[id].count), (_e) =>
        seededRandomNumber(rdm, -420000, -20000)
    );
    const y = Array.from(Array(cloudSettings[id].count), (_e) =>
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
                    backgroundImage: 'var(--solar-transition-gradient, none)',
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
                            fuzzy={false}
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
