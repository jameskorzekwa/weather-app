import React, { ReactNode, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import Thunderstorm from '@/components/backgrounds/thunderstom';
import Drizzle from '@/components/backgrounds/drizzle';
import Rain from '@/components/backgrounds/rain';
import Clouds from '@/components/backgrounds/clouds';
import Clear from '@/components/backgrounds/clear';
import Atmosphere from '@/components/backgrounds/atmosphere';
import Snow from '@/components/backgrounds/snow';
import {
    AtmosphereId,
    CloudId,
    Current,
    DrizzleId,
    RainId,
    SnowId,
    ThunderstormId
} from '@/types';
import {
    getSceneNightStrength,
    getSunriseTintWeights,
    getSunsetTintWeights,
    SunriseTintWeights,
    SunsetTintWeights
} from '@/lib/utils';

interface Props {
    current: Current;
    isNight: boolean;
    mono?: boolean;
    sunrise?: number;
    sunset?: number;
    fakeTime?: string;
}

const rgba = (red: number, green: number, blue: number, opacity: number) =>
    `rgba(${red}, ${green}, ${blue}, ${Math.min(1, opacity).toFixed(3)})`;

const getSunsetGradient = (
    tint?: SunsetTintWeights,
    opacityScale = 1
): string => {
    if (!tint) return 'none';

    const warm = tint.warm;
    const dusk = tint.dusk;
    return [
        `linear-gradient(180deg, ${rgba(42, 37, 79, dusk * 0.94 * opacityScale)} 0%, ${rgba(112, 63, 125, dusk * 0.92 * opacityScale)} 52%, ${rgba(207, 87, 121, dusk * 0.9 * opacityScale)} 100%)`,
        `radial-gradient(ellipse at 50% 82%, ${rgba(255, 194, 124, warm * 0.48 * opacityScale)} 0%, ${rgba(242, 110, 115, warm * 0.3 * opacityScale)} 45%, ${rgba(233, 54, 120, 0)} 72%)`,
        `linear-gradient(180deg, ${rgba(233, 54, 120, warm * 0.9 * opacityScale)} 0%, ${rgba(239, 100, 120, warm * 0.92 * opacityScale)} 52%, ${rgba(246, 161, 124, warm * 0.95 * opacityScale)} 100%)`
    ].join(', ');
};

const getSunriseGradient = (
    tint?: SunriseTintWeights,
    opacityScale = 1
): string => {
    if (!tint) return 'none';

    const predawn = tint.predawn;
    const gold = tint.gold;
    return [
        `radial-gradient(ellipse at 50% 82%, ${rgba(255, 211, 112, gold * 0.55 * opacityScale)} 0%, ${rgba(240, 128, 108, gold * 0.32 * opacityScale)} 45%, ${rgba(126, 82, 139, 0)} 72%)`,
        `linear-gradient(180deg, ${rgba(126, 82, 139, gold * 0.88 * opacityScale)} 0%, ${rgba(229, 105, 111, gold * 0.92 * opacityScale)} 55%, ${rgba(248, 190, 112, gold * 0.96 * opacityScale)} 100%)`,
        `linear-gradient(180deg, ${rgba(31, 38, 76, predawn * 0.96 * opacityScale)} 0%, ${rgba(91, 65, 116, predawn * 0.93 * opacityScale)} 55%, ${rgba(203, 91, 116, predawn * 0.88 * opacityScale)} 100%)`
    ].join(', ');
};

const getSkyTransitionGradient = (
    sunriseTint?: SunriseTintWeights,
    sunsetTint?: SunsetTintWeights,
    opacityScale = 1
): string => {
    const gradients = [
        getSunriseGradient(sunriseTint, opacityScale),
        getSunsetGradient(sunsetTint, opacityScale)
    ].filter((gradient) => gradient !== 'none');
    return gradients.length ? gradients.join(', ') : 'none';
};

interface SkyTransitionProps {
    children: ReactNode;
    isNight: boolean;
    sunrise?: number;
    sunset?: number;
    fakeTime?: string;
    mono?: boolean;
}

function SkyTransition({
    children,
    isNight,
    sunrise,
    sunset,
    fakeTime,
    mono
}: SkyTransitionProps) {
    const [, setClockTick] = useState(0);
    useInterval(
        () => setClockTick((tick) => tick + 1),
        fakeTime || mono ? null : 30000
    );
    const sunriseTint = mono
        ? undefined
        : getSunriseTintWeights(sunrise, fakeTime);
    const sunsetTint = mono
        ? undefined
        : getSunsetTintWeights(sunset, fakeTime);
    const gradient = getSkyTransitionGradient(sunriseTint, sunsetTint);
    const precipitationGradient = getSkyTransitionGradient(
        sunriseTint,
        sunsetTint,
        0.12
    );
    const sunsetTransitionStrength = Math.max(
        sunsetTint?.warm ?? 0,
        sunsetTint?.dusk ?? 0
    );
    const cloudOpacity = 1 - sunsetTransitionStrength * 0.55;
    const nightStrength = mono
        ? 1
        : getSceneNightStrength(
              sunrise,
              sunset,
              isNight,
              fakeTime
          );

    return (
        <div
            data-solar-transition-active={String(gradient !== 'none')}
            style={
                {
                    position: 'absolute',
                    height: '100vh',
                    width: '100vw',
                    '--solar-transition-gradient': gradient,
                    '--precipitation-solar-transition-gradient':
                        precipitationGradient,
                    '--solar-cloud-opacity': cloudOpacity.toFixed(3),
                    '--scene-night-strength': nightStrength.toFixed(4)
                } as React.CSSProperties
            }
        >
            {children}
        </div>
    );
}

export default function Background({
    current,
    isNight,
    mono,
    sunrise,
    sunset,
    fakeTime
}: Props) {
    const id = current.id;
    const night = isNight || !!mono;
    // Mono is ALWAYS inverted (white bg, dark elements) — eink-friendly.
    // Day/night only changes the Sun/Moon icon for clear weather, not the scheme.
    const inverted = !!mono;
    let getWeatherType = (id: number) => {
        if ([200, 201, 202, 210, 211, 212, 221, 230, 231, 232].includes(id)) {
            return <Thunderstorm id={id as ThunderstormId} isNight={night} />;
        } else if ([300, 301, 302, 310, 311, 312, 313, 314, 321].includes(id)) {
            return <Drizzle id={id as DrizzleId} isNight={night} />;
        } else if (
            [500, 501, 502, 503, 504, 511, 520, 521, 522, 531].includes(id)
        ) {
            return <Rain id={id as RainId} isNight={night} />;
        } else if (
            [600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622].includes(id)
        ) {
            // @ts-ignore
            return <Snow id={id as SnowId} isNight={night} />;
        } else if (
            [701, 711, 721, 731, 741, 751, 761, 762, 771, 781].includes(id)
        ) {
            return (
                <Atmosphere
                    id={id as AtmosphereId}
                    isNight={night}
                    inverted={inverted}
                />
            );
        } else if (id == 800) {
            return (
                <Clear
                    id={id}
                    isNight={isNight}
                    mono={!!mono}
                    inverted={inverted}
                />
            );
        } else if ([801, 802, 803, 804].includes(id)) {
            // @ts-ignore
            return <Clouds id={id as CloudId} isNight={night} />;
        }
    };

    return (
        <SkyTransition
            isNight={night}
            sunrise={sunrise}
            sunset={sunset}
            fakeTime={fakeTime}
            mono={mono}
        >
            {getWeatherType(id)}
        </SkyTransition>
    );
}
