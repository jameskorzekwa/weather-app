import React from 'react';
import styled from 'styled-components';

interface Props {
    y: number;
    fill: string;
    duration: number;
    delay: number;
}

const StyledCloud = styled.g<{ duration: number; delay: number }>`
    width: 100%;
    will-change: transform;
    transform: translateX(-42%);
    animation: ${({ duration }) => `animate ${duration}ms infinite linear`};
    animation-delay: ${({ delay }) => `${delay}ms`};
    @keyframes animate {
        100% {
            transform: translateX(120%);
        }
    }
`;

const StyledPath = styled.path`
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

export default function Cloud({ y, fill, duration, delay }: Props) {
    return (
        <StyledCloud duration={duration} delay={delay}>
            <StyledPath
                d={`M 0 ${y}
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z`}
                fill={fill}
            />
        </StyledCloud>
    );
}
