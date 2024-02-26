import styled from 'styled-components';
import React from 'react';

interface Props {
    y: number;
    fill: string;
    delay: number;
}

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

export default function ThunderCloud({ y, delay, fill }: Props) {
    return (
        <Clouds y={y} delay={delay} fill={fill}>
            <g
                transform="matrix(1.81 0 0 1.81 66.26 492.31)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(1.32 0 0 1.32 146.45 524.53)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(1.85 0 0 1.85 226.44 521.25)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(1.92 0 0 1.92 325.48 533.57)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(2 0 0 2 335.25 504.32)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(2 0 0 2 400.96 501.95)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(1.64 0 0 1.64 475.54 526.81)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(2.47 0 0 2.47 540 467.46)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(1.78 0 0 1.78 623.39 515.2)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(1.78 0 0 1.78 703.02 492.71)"
                id="13ed9b94-3354-4884-bfc1-071349735225"
            >
                <circle
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    cx="0"
                    cy="0"
                    r="35"
                />
            </g>
            <g
                transform="matrix(11.5 0 0 3.28 384.51 385.13)"
                id="73e5cdcd-63b5-4da1-90ee-05fc6b46ee45"
            >
                <rect
                    style={{
                        stroke: 'rgb(0,0,0)',
                        strokeWidth: '0',
                        strokeDasharray: 'none',
                        strokeLinecap: 'butt',
                        strokeDashoffset: '0',
                        strokeLinejoin: 'miter',
                        strokeMiterlimit: '4',
                        fill: 'rgb(101,101,101)',
                        fillRule: 'nonzero',
                        opacity: '1'
                    }}
                    x="-33.085"
                    y="-33.085"
                    rx="0"
                    ry="0"
                    width="66.17"
                    height="66.17"
                />
            </g>
        </Clouds>
    );
}
