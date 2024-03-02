import React from 'react';
import styled from 'styled-components';

const StyledSun = styled.g`
    will-change: transform;
    animation: spin 100s infinite linear;
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
`;
export default function Sun() {
    const numberOfRays = 14;
    return (
        <StyledSun>
            <ellipse fill={'#F1C40F'} cx="0" cy="0" rx={'60'} ry={'60'} />
            {Array.from(Array(numberOfRays), (_e, i) => (
                <rect
                    key={i}
                    fill={'#F1C40F'}
                    width={10}
                    height={40}
                    rx={5}
                    transform={`rotate(${(360 / numberOfRays) * i}) translate(-5, -110)`}
                />
            ))}
        </StyledSun>
    );
}
