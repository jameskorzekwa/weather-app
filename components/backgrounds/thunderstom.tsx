import React, { useEffect, useState } from 'react';

import Raining from '@/components/raining';
import { useRandomInterval } from '@/hooks/useRandomInterval';
import styled from 'styled-components';
import ThunderCloud from '@/components/thunderCloud';

interface Props {
    id: number;
    isNight: boolean;
}

const Lightning = styled.div<{ animate: boolean }>`
    position: absolute;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    background-color: white;
    filter: brightness(3);
    ${({ animate }) => (animate ? 'animation: 5s flash ease-out;' : '')}
    animation-iteration-count: 1;

    @keyframes flash {
        from {
            opacity: 0;
        }
        92% {
            opacity: 0;
        }
        93% {
            opacity: 0.6;
        }
        94% {
            opacity: 0.2;
        }
        95% {
            opacity: 1;
        }
        97% {
            opacity: 0;
        }
        to {
            opacity: 0;
        }
    }
`;

const Clouds = styled.g<{ fill: string; delay: number; y: number }>`
    will-change: transform;
    transform: translate(-800px, ${({ y }) => `${y}px`});
    animation: thunder 200s infinite linear;
    animation-delay: ${({ delay }) => `${delay}ms`};

    circle,
    rect {
        fill: ${({ fill }) => `${fill} !important`};
    }

    @keyframes thunder {
        100% {
            transform: translateX(100%);
        }
    }
`;

export default function Thunderstorm({ id, isNight }: Props) {
    const [animate, setAnimate] = useState<boolean>(true);

    useRandomInterval(
        () => {
            setAnimate(false);
        },
        60000,
        60000 * 5
    );

    useEffect(() => {
        if (!animate) {
            setAnimate(true);
        }
    }, [animate]);

    return (
        <div
            style={{
                backgroundColor: isNight ? 'black' : '#373b42',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            <Lightning animate={animate} />
            <Raining amount={100} diagonal={true} />
            <div style={{ position: 'absolute', width: '100vw' }}>
                <svg viewBox="10 500 600 500">
                    <ThunderCloud y={0} delay={0} fill="#2d2d2d" />
                    <ThunderCloud y={0} delay={-40000} fill="#2d2d2d" />
                    <ThunderCloud y={0} delay={-120000} fill="#2d2d2d" />
                    <ThunderCloud y={-100} delay={15000} fill="#7a7a7e" />
                    <ThunderCloud y={-85} delay={-45000} fill="#7a7a7e" />
                    <ThunderCloud y={-75} delay={-90000} fill="#7a7a7e" />
                </svg>
            </div>
        </div>
    );
}
