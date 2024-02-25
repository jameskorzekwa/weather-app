import React from 'react';
import styles from './background.module.css';

interface Props {
    id: number;
    isNight: boolean;
}

export default function Background({ id, isNight }: Props) {
    // Utility helper for random number generation
    const random = (min: number, max: number) =>
        Math.floor(Math.random() * (max - min)) + min;
    const useRandomInterval = (
        callback: () => void,
        minDelay: number,
        maxDelay: number
    ) => {
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

    useRandomInterval(
        () => {
            let element = document.getElementById('lightning');
            if (element) {
                element.classList.remove(styles.flashit);
                element.classList.remove(styles.lightning);
                void element.offsetWidth;
                element.classList.add(styles.flashit);
                element.classList.add(styles.lightning);
            }
        },
        1000,
        5000
    );

    const randomCoords1 = [
        { y: 47, x: 772 },
        { y: 1346, x: 385 },
        { y: 1218, x: 942 },
        {
            y: 37,
            x: 989
        },
        { y: 198, x: 474 },
        { y: 379, x: 522 },
        { y: 661, x: 545 },
        { y: 944, x: 251 },
        {
            y: 470,
            x: 692
        },
        { y: 423, x: 293 },
        { y: 1091, x: 46 },
        { y: 341, x: 236 },
        { y: 499, x: 204 },
        {
            y: 284,
            x: 328
        },
        { y: 1062, x: 881 },
        { y: 1029, x: 675 },
        { y: 917, x: 561 },
        { y: 649, x: 290 },
        {
            y: 764,
            x: 641
        },
        { y: 871, x: 981 },
        { y: 550, x: 401 },
        { y: 794, x: 508 },
        { y: 1251, x: 448 },
        {
            y: 1110,
            x: 642
        },
        { y: 1104, x: 476 },
        { y: 861, x: 730 },
        { y: 195, x: 373 },
        { y: 1453, x: 503 },
        {
            y: 645,
            x: 455
        },
        { y: 1095, x: 707 },
        { y: 1129, x: 439 },
        { y: 788, x: 121 },
        { y: 236, x: 181 },
        {
            y: 647,
            x: 378
        },
        { y: 1195, x: 19 },
        { y: 1497, x: 887 },
        { y: 1293, x: 402 },
        { y: 913, x: 1009 },
        {
            y: 1531,
            x: 945
        },
        { y: 1015, x: 708 },
        { y: 1219, x: 783 },
        { y: 517, x: 995 },
        { y: 677, x: 197 },
        {
            y: 338,
            x: 15
        },
        { y: 752, x: 134 },
        { y: 1214, x: 43 },
        { y: 1408, x: 864 },
        { y: 1044, x: 895 },
        {
            y: 198,
            x: 660
        },
        { y: 328, x: 288 },
        { y: 1517, x: 724 },
        { y: 185, x: 676 },
        { y: 1399, x: 482 },
        {
            y: 513,
            x: 718
        },
        { y: 1172, x: 489 },
        { y: 436, x: 242 },
        { y: 990, x: 1002 },
        { y: 54, x: 908 },
        {
            y: 1154,
            x: 1002
        },
        { y: 214, x: 337 },
        { y: 370, x: 107 },
        { y: 288, x: 506 },
        { y: 1171, x: 648 },
        {
            y: 425,
            x: 134
        },
        { y: 1136, x: 745 },
        { y: 627, x: 182 },
        { y: 1182, x: 185 },
        { y: 1355, x: 399 },
        {
            y: 1405,
            x: 793
        },
        { y: 1320, x: 771 },
        { y: 720, x: 225 },
        { y: 1197, x: 620 },
        { y: 641, x: 798 },
        {
            y: 1519,
            x: 276
        },
        { y: 344, x: 774 },
        { y: 202, x: 195 },
        { y: 1423, x: 250 },
        { y: 859, x: 460 },
        {
            y: 738,
            x: 205
        },
        { y: 572, x: 167 },
        { y: 816, x: 322 },
        { y: 2, x: 297 },
        { y: 1100, x: 281 },
        {
            y: 860,
            x: 51
        },
        { y: 1363, x: 584 },
        { y: 325, x: 914 },
        { y: 586, x: 378 },
        { y: 265, x: 939 },
        {
            y: 409,
            x: 809
        },
        { y: 1255, x: 423 },
        { y: 1355, x: 353 },
        { y: 1272, x: 106 },
        { y: 257, x: 846 },
        {
            y: 343,
            x: 246
        },
        { y: 743, x: 965 },
        { y: 258, x: 412 },
        { y: 390, x: 849 },
        { y: 1138, x: 565 },
        {
            y: 415,
            x: 512
        },
        { y: 672, x: 403 }
    ];
    const randomCoords2 = [
        { y: 1389, x: 134 },
        { y: 518, x: 713 },
        { y: 775, x: 741 },
        {
            y: 304,
            x: 957
        },
        { y: 1534, x: 490 },
        { y: 1448, x: 440 },
        { y: 1466, x: 904 },
        { y: 1250, x: 895 },
        {
            y: 1102,
            x: 697
        },
        { y: 1168, x: 757 },
        { y: 1023, x: 798 },
        { y: 498, x: 538 },
        { y: 675, x: 702 },
        {
            y: 289,
            x: 127
        },
        { y: 60, x: 368 },
        { y: 1140, x: 213 },
        { y: 47, x: 910 },
        { y: 1245, x: 317 },
        {
            y: 1037,
            x: 736
        },
        { y: 1105, x: 494 },
        { y: 859, x: 917 },
        { y: 654, x: 841 },
        { y: 754, x: 780 },
        {
            y: 585,
            x: 850
        },
        { y: 61, x: 387 },
        { y: 369, x: 720 },
        { y: 1447, x: 936 },
        { y: 1521, x: 182 },
        {
            y: 1258,
            x: 732
        },
        { y: 1145, x: 288 },
        { y: 6, x: 458 },
        { y: 1313, x: 709 },
        { y: 1130, x: 365 },
        {
            y: 184,
            x: 688
        },
        { y: 421, x: 780 },
        { y: 601, x: 550 },
        { y: 224, x: 84 },
        { y: 611, x: 606 },
        {
            y: 997,
            x: 420
        },
        { y: 1296, x: 572 },
        { y: 935, x: 615 },
        { y: 1371, x: 672 },
        { y: 1094, x: 516 },
        {
            y: 413,
            x: 835
        },
        { y: 1330, x: 836 },
        { y: 994, x: 798 },
        { y: 153, x: 389 },
        { y: 544, x: 31 },
        {
            y: 1187,
            x: 721
        },
        { y: 528, x: 818 },
        { y: 46, x: 383 },
        { y: 846, x: 880 },
        { y: 1265, x: 800 },
        {
            y: 562,
            x: 722
        },
        { y: 2, x: 574 },
        { y: 331, x: 199 },
        { y: 1199, x: 877 },
        { y: 1468, x: 203 },
        {
            y: 1524,
            x: 359
        },
        { y: 695, x: 224 },
        { y: 280, x: 835 },
        { y: 685, x: 248 },
        { y: 788, x: 362 },
        {
            y: 643,
            x: 42
        },
        { y: 619, x: 839 },
        { y: 1284, x: 29 },
        { y: 1147, x: 868 },
        { y: 671, x: 730 },
        {
            y: 1490,
            x: 1
        },
        { y: 101, x: 866 },
        { y: 1296, x: 1010 },
        { y: 667, x: 288 },
        { y: 1480, x: 77 },
        {
            y: 1014,
            x: 949
        },
        { y: 663, x: 207 },
        { y: 1034, x: 128 },
        { y: 226, x: 386 },
        { y: 1241, x: 932 },
        {
            y: 1102,
            x: 916
        },
        { y: 652, x: 1016 },
        { y: 1285, x: 249 },
        { y: 1092, x: 383 },
        { y: 638, x: 257 },
        {
            y: 212,
            x: 163
        },
        { y: 1216, x: 228 },
        { y: 284, x: 557 },
        { y: 443, x: 957 },
        { y: 829, x: 250 },
        {
            y: 22,
            x: 320
        },
        { y: 865, x: 724 },
        { y: 1011, x: 552 },
        { y: 649, x: 803 },
        { y: 34, x: 950 },
        {
            y: 1157,
            x: 560
        },
        { y: 1488, x: 102 },
        { y: 386, x: 801 },
        { y: 225, x: 498 },
        { y: 106, x: 416 },
        {
            y: 57,
            x: 396
        },
        { y: 1095, x: 111 }
    ];

    const speeds = [
        4856, 4048, 3727, 4679, 4718, 4109, 4683, 4894, 4576, 4313, 3345, 4696,
        3293, 4758, 3728, 4486, 3632, 3702, 3294, 4200, 3227, 3027, 4833, 4757,
        4591, 4143, 3964, 4534, 4847, 3841, 4014, 3998, 4044, 4053, 4033, 3448,
        4275, 4431, 4820, 4944, 3432, 3127, 3846, 4658, 4247, 3835, 3719, 3156,
        3576, 3094, 4051, 4635, 3219, 3595, 3295, 4679, 3287, 4774, 4789, 3842,
        4689, 3944, 4879, 4049, 3186, 4965, 3505, 4916, 3048, 4832, 4601, 4806,
        4192, 3670, 4305, 4652, 4902, 4328, 4160, 3738, 3418, 4219, 3667, 3743,
        3521, 4367, 4670, 3136, 3711, 4922, 3191, 3626, 3530, 4913, 4901, 4308,
        3880, 3609, 4560, 4465
    ];

    let raining = (amount: number, diagonal: boolean) => {
        return (
            <div
                style={{
                    zIndex: '0',
                    position: 'absolute',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <div className={styles.snow} style={{ overflow: 'hidden' }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 900"
                        preserveAspectRatio="xMidYMax slice"
                    >
                        <g
                            fill="darkgrey"
                            fillOpacity="0.7"
                            transform={`translate(0, -120) rotate(${diagonal ? 10 : 0})`}
                        >
                            <g>
                                {Array.from(Array(amount), (_e, i) => {
                                    return (
                                        <rect
                                            className={styles.rainTopLayer}
                                            style={{
                                                animationDuration:
                                                    speeds[speeds.length - i] +
                                                    'ms',
                                                animationDelay:
                                                    (speeds[speeds.length - i] -
                                                        3000) *
                                                        2 +
                                                    'ms'
                                            }}
                                            x={randomCoords1[i].x * 1.5}
                                            y={0}
                                            width="5"
                                            height="15"
                                            rx="3"
                                            key={i}
                                        />
                                    );
                                })}
                            </g>
                        </g>
                        <g
                            fill="darkgrey"
                            fillOpacity="0.7"
                            transform={`translate(0, -120) rotate(${diagonal ? 10 : 0})`}
                        >
                            <g>
                                {Array.from(Array(amount), (_e, i) => {
                                    return (
                                        <rect
                                            className={styles.rainBottomLayer}
                                            style={{
                                                animationDuration:
                                                    speeds[i] + 'ms',
                                                animationDelay:
                                                    (speeds[i] - 3000) * 2 +
                                                    'ms'
                                            }}
                                            x={randomCoords2[i].x * 1.5}
                                            y={0}
                                            width="5"
                                            height="15"
                                            rx="3"
                                            key={i}
                                        />
                                    );
                                })}
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        );
    };
    let thunderstorm = () => {
        return (
            <div
                style={{
                    backgroundColor: isNight ? 'black' : '#373b42',
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden'
                }}
            >
                <div
                    id="lightning"
                    className={`${styles.lightning} ${styles.flashit}`}
                ></div>
                {raining(100, true)}
                <div style={{ position: 'absolute', width: '100vw' }}>
                    <svg viewBox="10 500 600 500">
                        <g
                            className={`${styles.thunderclouds3} ${styles.clouds2}`}
                        >
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
                        </g>
                        <g
                            className={`${styles.thunderclouds4} ${styles.clouds2}`}
                        >
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
                        </g>
                        <g
                            className={`${styles.thunderclouds1} ${styles.clouds}`}
                        >
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
                        </g>
                        <g
                            className={`${styles.thunderclouds2} ${styles.clouds}`}
                        >
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
                        </g>
                    </svg>
                </div>
            </div>
        );
    };
    let rain = (amount: number) => {
        return (
            <div
                style={{
                    backgroundColor: isNight ? 'black' : '#5f646c',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                {raining(amount, false)}
            </div>
        );
    };
    let snow = () => {
        return (
            <div
                style={{
                    backgroundColor: isNight ? 'black' : '#6f7d91',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <div className={styles.snow} style={{ overflow: 'hidden' }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1024 1536"
                        preserveAspectRatio="xMidYMax slice"
                    >
                        <g
                            fill="#FFF"
                            fillOpacity=".15"
                            transform="translate(55 42)"
                        >
                            <g className={styles.snowBottomLayer}>
                                <ellipse cx="6" cy="1009.5" rx="6" ry="5.5" />
                                <ellipse cx="138" cy="1110.5" rx="6" ry="5.5" />
                                <ellipse cx="398" cy="1055.5" rx="6" ry="5.5" />
                                <ellipse cx="719" cy="1284.5" rx="6" ry="5.5" />
                                <ellipse cx="760" cy="1155.5" rx="6" ry="5.5" />
                                <ellipse cx="635" cy="1459.5" rx="6" ry="5.5" />
                                <ellipse cx="478" cy="1335.5" rx="6" ry="5.5" />
                                <ellipse cx="322" cy="1414.5" rx="6" ry="5.5" />
                                <ellipse cx="247" cy="1234.5" rx="6" ry="5.5" />
                                <ellipse cx="154" cy="1425.5" rx="6" ry="5.5" />
                                <ellipse cx="731" cy="773.5" rx="6" ry="5.5" />
                                <ellipse cx="599" cy="874.5" rx="6" ry="5.5" />
                                <ellipse cx="339" cy="819.5" rx="6" ry="5.5" />
                                <ellipse cx="239" cy="1004.5" rx="6" ry="5.5" />
                                <ellipse cx="113" cy="863.5" rx="6" ry="5.5" />
                                <ellipse cx="102" cy="1223.5" rx="6" ry="5.5" />
                                <ellipse cx="395" cy="1155.5" rx="6" ry="5.5" />
                                <ellipse cx="826" cy="943.5" rx="6" ry="5.5" />
                                <ellipse cx="626" cy="1054.5" rx="6" ry="5.5" />
                                <ellipse cx="887" cy="1366.5" rx="6" ry="5.5" />
                                <ellipse cx="6" cy="241.5" rx="6" ry="5.5" />
                                <ellipse cx="138" cy="342.5" rx="6" ry="5.5" />
                                <ellipse cx="398" cy="287.5" rx="6" ry="5.5" />
                                <ellipse cx="719" cy="516.5" rx="6" ry="5.5" />
                                <ellipse cx="760" cy="387.5" rx="6" ry="5.5" />
                                <ellipse cx="635" cy="691.5" rx="6" ry="5.5" />
                                <ellipse cx="478" cy="567.5" rx="6" ry="5.5" />
                                <ellipse cx="322" cy="646.5" rx="6" ry="5.5" />
                                <ellipse cx="247" cy="466.5" rx="6" ry="5.5" />
                                <ellipse cx="154" cy="657.5" rx="6" ry="5.5" />
                                <ellipse cx="731" cy="5.5" rx="6" ry="5.5" />
                                <ellipse cx="599" cy="106.5" rx="6" ry="5.5" />
                                <ellipse cx="339" cy="51.5" rx="6" ry="5.5" />
                                <ellipse cx="239" cy="236.5" rx="6" ry="5.5" />
                                <ellipse cx="113" cy="95.5" rx="6" ry="5.5" />
                                <ellipse cx="102" cy="455.5" rx="6" ry="5.5" />
                                <ellipse cx="395" cy="387.5" rx="6" ry="5.5" />
                                <ellipse cx="826" cy="175.5" rx="6" ry="5.5" />
                                <ellipse cx="626" cy="286.5" rx="6" ry="5.5" />
                                <ellipse cx="887" cy="598.5" rx="6" ry="5.5" />
                            </g>
                        </g>
                        <g
                            fill="#FFF"
                            fillOpacity=".3"
                            transform="translate(65 63)"
                        >
                            <g className={styles.snowTopLayer}>
                                <circle cx="8" cy="776" r="8" />
                                <circle cx="189" cy="925" r="8" />
                                <circle cx="548" cy="844" r="8" />
                                <circle cx="685" cy="1115" r="8" />
                                <circle cx="858" cy="909" r="8" />
                                <circle
                                    cx="874"
                                    cy="1438"
                                    r="8"
                                    transform="rotate(180 874 1438)"
                                />
                                <circle
                                    cx="657"
                                    cy="1256"
                                    r="8"
                                    transform="rotate(180 657 1256)"
                                />
                                <circle
                                    cx="443"
                                    cy="1372"
                                    r="8"
                                    transform="rotate(180 443 1372)"
                                />
                                <circle
                                    cx="339"
                                    cy="1107"
                                    r="8"
                                    transform="rotate(180 339 1107)"
                                />
                                <circle
                                    cx="24"
                                    cy="1305"
                                    r="8"
                                    transform="rotate(180 24 1305)"
                                />
                                <circle cx="8" cy="8" r="8" />
                                <circle cx="189" cy="157" r="8" />
                                <circle cx="548" cy="76" r="8" />
                                <circle cx="685" cy="347" r="8" />
                                <circle cx="858" cy="141" r="8" />
                                <circle
                                    cx="874"
                                    cy="670"
                                    r="8"
                                    transform="rotate(180 874 670)"
                                />
                                <circle
                                    cx="657"
                                    cy="488"
                                    r="8"
                                    transform="rotate(180 657 488)"
                                />
                                <circle
                                    cx="443"
                                    cy="604"
                                    r="8"
                                    transform="rotate(180 443 604)"
                                />
                                <circle
                                    cx="339"
                                    cy="339"
                                    r="8"
                                    transform="rotate(180 339 339)"
                                />
                                <circle
                                    cx="24"
                                    cy="537"
                                    r="8"
                                    transform="rotate(180 24 537)"
                                />
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        );
    };
    let atmosphere = () => {
        return (
            <div
                style={{
                    backgroundColor: isNight
                        ? 'rgb(23,23,23)'
                        : 'rgb(147,114,104)',
                    height: '100vh',
                    width: '100vw'
                }}
            >
                <div style={{ color: 'rgba(179,182,183,0.53)' }}></div>
                <svg viewBox="0 0 470 1536">
                    {isNight
                        ? null
                        : [
                              <ellipse
                                  key={1}
                                  fill={'rgba(241,196,15,0.1)'}
                                  cx="0"
                                  cy="0"
                                  rx="120"
                                  ry="120"
                                  transform="translate(470, 0)"
                              />,
                              <ellipse
                                  key={2}
                                  fill={'rgba(241,196,15,0.3)'}
                                  cx="0"
                                  cy="0"
                                  rx="100"
                                  ry="100"
                                  transform="translate(470, 0)"
                              />
                          ]}
                    <ellipse
                        fill={
                            isNight
                                ? 'rgba(238,222,163,0.2)'
                                : 'rgba(241,196,15,0.5)'
                        }
                        cx="0"
                        cy="0"
                        rx={isNight ? '45' : '80'}
                        ry={isNight ? '45' : '80'}
                        transform="translate(470, 0)"
                    />
                    <ellipse
                        fill={isNight ? '#eedea3' : '#F1C40F'}
                        cx="0"
                        cy="0"
                        rx={isNight ? '30' : '60'}
                        ry={isNight ? '30' : '60'}
                        transform="translate(470, 0)"
                    />
                    {isNight
                        ? null
                        : [
                              <g key={1} className={styles.cloudsLayer1}>
                                  <path
                                      fill="rgba(131,145,146,0.25)"
                                      d="m 0,75
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.75)"
                                      fill="rgba(131,145,146,0.5)"
                                      d="m 7, 105
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.5)"
                                      fill="#839192"
                                      d="m 25, 165
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                              </g>,
                              <g key={2} className={styles.cloudsLayer2}>
                                  <path
                                      fill="rgba(166,172,175,0.25)"
                                      d="M 0, 20
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.75)"
                                      fill="rgba(166,172,175,0.5)"
                                      d="M 7, 30
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.5)"
                                      fill="#A6ACAF"
                                      d="M 25, 50
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                              </g>,
                              <g key={3} className={styles.cloudsLayer3}>
                                  <path
                                      fill="rgba(127,140,141,0.25)"
                                      d="M 0,160
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.75)"
                                      fill="rgba(127,140,141,0.5)"
                                      d="M 7, 216
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.5)"
                                      fill="#7F8C8D"
                                      d="M 25, 330
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                              </g>,
                              <g key={4} className={styles.cloudsLayer4}>
                                  <path
                                      fill="rgba(179,182,183,0.25)"
                                      d="M 0,230
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.75)"
                                      fill="rgba(179,182,183,0.5)"
                                      d="M 7, 310
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                                  <path
                                      transform="scale(.5)"
                                      fill="#B3B6B7"
                                      d="M 25, 470
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                              </g>
                          ]}
                </svg>
            </div>
        );
    };
    let clear = () => {
        return (
            <div
                style={{
                    backgroundColor: isNight ? 'black' : 'rgb(55,114,180)',
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden'
                }}
            >
                <svg viewBox="0 0 470 1536">
                    <ellipse
                        fill={isNight ? '#eedea3' : '#F1C40F'}
                        cx="0"
                        cy="0"
                        rx={isNight ? '40' : '60'}
                        ry={isNight ? '40' : '60'}
                        transform="translate(470, 0)"
                    />
                    {isNight
                        ? null
                        : [
                              <g
                                  key="cloudsLayer1"
                                  className={styles.cloudsLayer1}
                              >
                                  <path
                                      fill="#839192"
                                      d="M 10,230
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                              </g>,
                              <g
                                  key="cloudsLayer2"
                                  className={styles.cloudsLayer2}
                              >
                                  <path
                                      fill="#A6ACAF"
                                      d="M 0,30
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                                  />
                              </g>,
                              <g
                                  key="cloudsLayer3"
                                  className={styles.cloudsLayer3}
                              >
                                  <path
                                      fill="#7F8C8D"
                                      d="M -50,800
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                                  />
                              </g>,
                              <g
                                  key="cloudsLayer4"
                                  className={styles.cloudsLayer4}
                              >
                                  <path
                                      fill="#B3B6B7"
                                      d="M -40,150
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                                  />
                              </g>
                          ]}
                </svg>
            </div>
        );
    };
    let clouds = () => {
        return (
            <div
                style={{
                    height: '100vh',
                    width: '100vw',
                    overflow: 'hidden'
                }}
            >
                {isNight && (
                    <div
                        style={{
                            position: 'absolute',
                            height: '100vh',
                            width: '100vw',
                            overflow: 'hidden',
                            backgroundColor: 'rgba(0,0,0,0.74)'
                        }}
                    />
                )}
                <div
                    style={{
                        backgroundColor: isNight
                            ? 'rgba(0,0,0,0.74)'
                            : 'rgba(76,82,86,0.54)',
                        height: '100vh',
                        width: '100vw',
                        overflow: 'hidden'
                    }}
                >
                    <svg viewBox="0 0 170 1536">
                        <g className={styles.cloudsLayer2}>
                            {/*<g>*/}
                            <path
                                fill="#B3B6B7"
                                d="M 35,50
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                            <path
                                fill="#7F8C8D"
                                d="M 75,30
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                            <path
                                fill="#A6ACAF"
                                d="M150,70
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                            <path
                                fill="#839192"
                                d="M 0,10
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                        </g>
                        <g className={styles.cloudsLayer3}>
                            <path
                                fill="#7F8C8D"
                                d="M 0 20
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                            <path
                                fill="#839192"
                                d="M 200,40
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                            <path
                                fill="#B3B6B7"
                                d="M 100 2
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                            <path
                                fill="#A6ACAF"
                                d="M -20,80
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                        </g>
                        <g className={styles.cloudsLayer4}>
                            {/*<g>*/}
                            <path
                                fill="#A6ACAF"
                                d="M 10,50
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                            <path
                                fill="#B3B6B7"
                                d="M -30,30
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                            <path
                                fill="#839192"
                                d="M 0,70
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                            <path
                                fill="#7F8C8D"
                                d="M -40,10
                   a 20,20 1 0,0 0,40
                   h 50
                   a 20,20 1 0,0 0,-40
                   a 10,10 1 0,0 -15,-10
                   a 15,15 1 0,0 -35,10
                   z"
                            />
                        </g>
                        <g className={styles.cloudsLayer1}>
                            <path
                                fill="#839192"
                                d="M 80 20
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                            <path
                                fill="#A6ACAF"
                                d="M 0,40
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                            <path
                                fill="#7F8C8D"
                                d="M 150 2
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                            <path
                                fill="#B3B6B7"
                                d="M 100,80
                    a 20,20 1 0,0 0,40
                    h 50
                    a 20,20 1 0,0 0,-40
                    a 10,10 1 0,0 -15,-10
                    a 15,15 1 0,0 -35,10
                    z"
                            />
                        </g>
                    </svg>
                </div>
            </div>
        );
    };

    let getWeatherType = (id: number) => {
        if (id >= 200 && id <= 299) {
            return thunderstorm();
        } else if (id >= 300 && id <= 399) {
            return rain(10);
        } else if (id >= 500 && id <= 599) {
            return rain(100);
        } else if (id >= 600 && id < 699) {
            return snow();
        } else if (id >= 700 && id < 799) {
            return atmosphere();
        } else if (id == 800) {
            return clear();
        } else if (id >= 801 && id < 899) {
            return clouds();
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                height: '100vh',
                width: '100vw'
            }}
        >
            {getWeatherType(id)}
        </div>
    );
}
