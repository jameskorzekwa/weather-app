export const getDayNightBackground = (
    nightRgb: string,
    isNight: boolean,
    solarGradient: string
): string => {
    const strength = `var(--scene-night-strength, ${isNight ? 1 : 0})`;
    return `linear-gradient(rgba(${nightRgb},${strength}), rgba(${nightRgb},${strength})), ${solarGradient}`;
};
