import React from 'react';
import styled from 'styled-components';
import seedrandom from 'seedrandom';
import { seededRandomNumber } from '@/lib/utils';
import Raining from '@/components/raining';
import { SnowId } from '@/types';
import { getDayNightBackground } from '@/components/backgrounds/dayNightBackground';

interface Props {
    id: SnowId;
    isNight: boolean;
}

const SnowContainer = styled.div`
    position: absolute;
    min-width: 100vw;
    min-height: 100vh;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
    animation: fadeInAnimation ease 3s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;

    @keyframes fadeInAnimation {
        0% {
            opacity: 0;
        }
        100% {
            opacity: 1;
        }
    }
`;

const SnowFlake = styled.ellipse<{ $speed: number; $scale: boolean }>`
    transform: scale(${({ $scale }) => ($scale ? 1.5 : 1)});
    will-change: transform;
    animation: ${({ $speed }) => `snow ${$speed}ms infinite linear`};
    animation-delay: ${({ $speed }) => `${($speed - 80000) * 10}ms`};
    @keyframes snow {
        100% {
            transform: translateY(100%);
        }
    }
`;

export default function Snow({ id, isNight }: Props) {
    const settings = {
        600: { amount: 20, rain: false },
        601: { amount: 50, rain: false },
        602: { amount: 100, rain: false },
        611: { amount: 50, rain: false },
        612: { amount: 20, rain: false },
        613: { amount: 50, rain: false },
        615: { amount: 20, rain: true },
        616: { amount: 50, rain: true },
        620: { amount: 20, rain: false },
        621: { amount: 50, rain: false },
        622: { amount: 100, rain: false }
    };
    const rain = settings[id].rain;
    const amount = settings[id].amount;
    const rdm = seedrandom('seed1');
    const speeds = Array.from(Array(amount), (_e) =>
        seededRandomNumber(rdm, 20000, 40000)
    );

    const randomCoords1 = Array.from(Array(amount), (_e) => ({
        x: seededRandomNumber(rdm, 1, 900),
        y: seededRandomNumber(rdm, 1, 1500)
    }));

    const randomCoords2 = Array.from(Array(amount), (_e) => ({
        x: seededRandomNumber(rdm, 1, 900),
        y: seededRandomNumber(rdm, 1, 1500)
    }));
    return (
        <div
            style={{
                backgroundColor: '#6f7d91',
                backgroundImage: getDayNightBackground(
                    '0,0,0',
                    isNight,
                    'var(--precipitation-solar-transition-gradient, none)'
                ),
                height: '100vh',
                width: '100vw'
            }}
        >
            <SnowContainer>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1536"
                    preserveAspectRatio="xMidYMax slice"
                >
                    <g fill="#FFF" fillOpacity=".15">
                        <g>
                            {Array.from(Array(amount), (_e, i) => (
                                <SnowFlake
                                    $scale={false}
                                    $speed={speeds[i]}
                                    key={i}
                                    cx={randomCoords1[i].x}
                                    cy={-8}
                                    rx="6"
                                    ry="6"
                                />
                            ))}
                        </g>
                    </g>
                    <g fill="#FFF" fillOpacity="0.3">
                        <g>
                            {Array.from(Array(amount), (_e, i) => (
                                <SnowFlake
                                    $scale={true}
                                    $speed={speeds[i]}
                                    key={i}
                                    cx={randomCoords2[i].x}
                                    cy={-10}
                                    rx={6}
                                    ry={6}
                                />
                            ))}
                        </g>
                    </g>
                </svg>
            </SnowContainer>
            {rain && (
                <Raining amount={amount} diagonal={false} size={'large'} />
            )}
        </div>
    );
}
