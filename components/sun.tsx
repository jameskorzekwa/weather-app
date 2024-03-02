import React from 'react';
import styled from 'styled-components';

const StyledSun = styled.g`
    will-change: transform;
    animation: spin 150s infinite linear;

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
`;
export default function Sun() {
    return (
        <StyledSun>
            <ellipse fill={'#F1C40F'} cx="0" cy="0" rx={'60'} ry={'60'} />
            {Array.from(Array(14), (_e, i) => (
                <rect
                    key={i}
                    fill={'#F1C40F'}
                    width={10}
                    height={40}
                    rx={5}
                    transform={`rotate(${(360 / 16) * i + 1}) translate(-5, -110)`}
                />
            ))}
        </StyledSun>
    );
}
