import React, { useEffect, useState } from 'react';

import Raining from '@/components/raining';
import { useRandomInterval } from '@/hooks/useRandomInterval';
import styled from 'styled-components';
import ThunderCloud from '@/components/thunderCloud';
import { ThunderstormId } from '@/types';

interface Props {
    id: ThunderstormId;
    isNight: boolean;
}

const Lightning = styled.div<{ $animate: boolean }>`
    position: absolute;
    width: 100vw;
    height: 100vh;
    opacity: 0;
    background-color: white;
    filter: brightness(3);
    ${({ $animate }) => ($animate ? 'animation: 5s flash ease-out;' : '')}
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

export default function Thunderstorm({ id, isNight }: Props) {
    const [animate, setAnimate] = useState<boolean>(true);

    const settings: {
        [_ in ThunderstormId]: {
            amount: number;
            diagonal: boolean;
            size: 'small' | 'large';
        };
    } = {
        200: { amount: 20, diagonal: false, size: 'large' },
        201: { amount: 50, diagonal: false, size: 'large' },
        202: { amount: 100, diagonal: false, size: 'large' },
        210: { amount: 20, diagonal: false, size: 'large' },
        211: { amount: 50, diagonal: false, size: 'large' },
        212: { amount: 100, diagonal: false, size: 'large' },
        221: { amount: 100, diagonal: true, size: 'large' },
        230: { amount: 20, diagonal: false, size: 'small' },
        231: { amount: 50, diagonal: false, size: 'small' },
        232: { amount: 100, diagonal: false, size: 'small' }
    };

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
                backgroundImage:
                    'var(--precipitation-solar-transition-gradient, none)',
                height: '100vh',
                width: '100vw',
                overflow: 'hidden'
            }}
        >
            <Lightning $animate={animate} />
            <Raining
                amount={settings[id].amount}
                diagonal={settings[id].diagonal}
                size={settings[id].size}
            />
            <div style={{ position: 'absolute', width: '100vw' }}>
                <svg viewBox="10 500 600 500">
                    <ThunderCloud y={0} delay={0} fill="#2d2d2d" />
                    <ThunderCloud y={0} delay={-40000} fill="#2d2d2d" />
                    <ThunderCloud y={0} delay={-120000} fill="#2d2d2d" />
                    <ThunderCloud y={-100} delay={15000} fill="#7a7a7a" />
                    <ThunderCloud y={-85} delay={-45000} fill="#7a7a7a" />
                    <ThunderCloud y={-75} delay={-90000} fill="#7a7a7a" />
                </svg>
            </div>
        </div>
    );
}
