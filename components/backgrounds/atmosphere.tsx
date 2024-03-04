import React from 'react';
import { AtmosphereId } from '@/types';
import Cloud from '@/components/cloud';
import seedrandom from 'seedrandom';
import { seededRandomNumber } from '@/lib/utils';

interface Props {
    id: AtmosphereId;
    isNight: boolean;
}

export default function Atmosphere({ id, isNight }: Props) {
    const colors = [
        '#839192',
        '#B3B6B7',
        '#A6ACAF',
        '#898b8c',
        '#868e93',
        '#bccdd3'
    ];
    const rdm = seedrandom('seed2');
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
    const y = Array.from(Array(6), () => seededRandomNumber(rdm, 0, 300));

    return (
        <div
            style={{
                backgroundColor: isNight ? 'rgb(23,23,23)' : 'rgb(115,129,129)',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            <div style={{ color: 'rgba(179,182,183,0.53)' }}></div>
            <svg viewBox="0 0 470 1536">
                {isNight
                    ? null
                    : [
                          <ellipse
                              key={1}
                              fill={'rgba(241,196,15,0.1)'}
                              cx="0"
                              cy="0"
                              rx="120"
                              ry="120"
                              transform="translate(470, 0)"
                          />,
                          <ellipse
                              key={2}
                              fill={'rgba(241,196,15,0.3)'}
                              cx="0"
                              cy="0"
                              rx="100"
                              ry="100"
                              transform="translate(470, 0)"
                          />
                      ]}
                <ellipse
                    fill={
                        isNight
                            ? 'rgba(238,222,163,0.2)'
                            : 'rgba(241,196,15,0.5)'
                    }
                    cx="0"
                    cy="0"
                    rx={isNight ? '45' : '80'}
                    ry={isNight ? '45' : '80'}
                    transform="translate(470, 0)"
                />
                <ellipse
                    fill={isNight ? '#eedea3' : 'rgba(241,196,15,0.67)'}
                    cx="0"
                    cy="0"
                    rx={isNight ? '30' : '60'}
                    ry={isNight ? '30' : '60'}
                    transform="translate(470, 0)"
                />
                {Array.from(Array(6), (_e, i) => (
                    <Cloud
                        key={i}
                        y={y[i]}
                        fill={fills[i]}
                        duration={durations[i]}
                        delay={delays[i]}
                        fuzzy={true}
                    />
                ))}
            </svg>
        </div>
    );
}
