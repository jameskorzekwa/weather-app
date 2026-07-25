import React from 'react';
import styled from 'styled-components';

interface Props {
    y: number;
    fill: string;
    duration: number;
    delay: number;
    fuzzy: boolean;
}

const CloudWrapper = styled.g<{ $y: number }>`
    transform: translateY(${({ $y }) => `${$y}px`});
`;

const StyledCloud = styled.g<{ $duration: number; $delay: number }>`
    width: 100%;
    will-change: transform;
    transform: translateX(-42%);
    animation: ${({ $duration }) => `clouds ${$duration}ms infinite linear`};
    animation-delay: ${({ $delay }) => `${$delay}ms`};
    @keyframes clouds {
        100% {
            transform: translateX(120%);
        }
    }
`;

const StyledPath = styled.path<{ $scale: number; $opacity: number }>`
    transform: scale(${({ $scale }) => `${$scale}`});
    animation: fadeInAnimation ease 3s;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
    opacity: calc(
        ${({ $opacity }) => `${$opacity}`} * var(--solar-cloud-opacity, 1)
    ) !important;

    @keyframes fadeInAnimation {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }
`;

export default function Cloud({ y, fill, duration, delay, fuzzy }: Props) {
    return (
        <CloudWrapper $y={y}>
            <StyledCloud $duration={duration} $delay={delay}>
                <StyledPath
                    d={`M 0 0
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z`}
                    $scale={1}
                    $opacity={fuzzy ? 0.4 : 0.7}
                    fill={fill}
                />
                {fuzzy && [
                    <StyledPath
                        key={1}
                        d={`M 7 5
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z`}
                        $scale={0.75}
                        $opacity={0.3}
                        fill={fill}
                    />,
                    <StyledPath
                        key={2}
                        d={`M 23 15
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z`}
                        $opacity={0.6}
                        $scale={0.5}
                        fill={fill}
                    />
                ]}
            </StyledCloud>
        </CloudWrapper>
    );
}
