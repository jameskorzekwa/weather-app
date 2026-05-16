import React from 'react';

interface Props {
    inverted?: boolean;
}

export default function Moon({ inverted }: Props = {}) {
    return (
        <g>
            <ellipse
                fill={inverted ? '#2a2a2a' : '#707070'}
                cx="0"
                cy="0"
                rx={'58'}
                ry={'58'}
            />
        </g>
    );
}
