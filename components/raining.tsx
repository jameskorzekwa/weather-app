import React from 'react';
import { seededRandomNumber } from '@/lib/utils';
import seedrandom from 'seedrandom';
import styled from 'styled-components';

interface Props {
    diagonal: boolean;
    amount: number;
    size: 'small' | 'large';
}

const RainContainer = styled.div`
    position: absolute;
    min-width: 100vw;
    min-height: 100vh;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    overflow: hidden;
`;

const RainDrop = styled.rect<{ $speed: number }>`
    will-change: transform;
    animation: ${({ $speed }) => `rain ${$speed}ms infinite linear`};
    animation-delay: ${({ $speed }) => `${($speed - 3000) * 5}ms`};
    @keyframes rain {
        100% {
            transform: translateY(100%);
        }
    }
`;

export default function Raining({ diagonal, amount, size }: Props) {
    const rainAmount = amount * 2;
    const rdm = seedrandom('seed');
    const speeds = Array.from(Array(rainAmount), (_e) =>
        seededRandomNumber(rdm, 3000, 4000)
    );

    const randomCoords1 = Array.from(Array(rainAmount), (_e) => ({
        x: seededRandomNumber(rdm, 1, 1024),
        y: seededRandomNumber(rdm, 1, 1536)
    }));

    return (
        <div
            style={{
                zIndex: '0',
                position: 'absolute',
                height: '100vh',
                width: '100vw'
            }}
        >
            <RainContainer>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 900"
                    preserveAspectRatio="xMidYMax slice"
                >
                    <g
                        fill="darkgrey"
                        fillOpacity="0.7"
                        transform={`translate(0, -120) rotate(${diagonal ? 10 : 0})`}
                    >
                        <g>
                            {Array.from(Array(rainAmount), (_e, i) => {
                                return (
                                    <RainDrop
                                        $speed={speeds[i]}
                                        x={randomCoords1[i].x * 1.5}
                                        y={0}
                                        width="5"
                                        height={size == 'small' ? 5 : 15}
                                        rx="3"
                                        key={i}
                                    />
                                );
                            })}
                        </g>
                    </g>
                </svg>
            </RainContainer>
        </div>
    );
}
