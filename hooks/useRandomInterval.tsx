import React from 'react';

export const useRandomInterval = (
    callback: () => void,
    minDelay: number,
    maxDelay: number
) => {
    const random = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min)) + min;

    const timeoutId = React.useRef<undefined | number>(undefined);
    const savedCallback = React.useRef(callback);
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    React.useEffect(() => {
        const handleTick = () => {
            const nextTickAt = random(minDelay, maxDelay);
            timeoutId.current = window.setTimeout(() => {
                savedCallback.current();
                handleTick();
            }, nextTickAt);
        };
        handleTick();
        return () => window.clearTimeout(timeoutId.current);
    }, [minDelay, maxDelay]);
    return React.useCallback(function () {
        window.clearTimeout(timeoutId.current);
    }, []);
};
