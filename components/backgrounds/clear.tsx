import styles from '@/components/background.module.css';
import React from 'react';

interface Props {
    id: number;
    isNight: boolean;
}

export default function Clear({ id, isNight }: Props) {
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
                          <g key="cloudsLayer1" className={styles.cloudsLayer1}>
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
                          <g key="cloudsLayer2" className={styles.cloudsLayer2}>
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
                          <g key="cloudsLayer3" className={styles.cloudsLayer3}>
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
                          <g key="cloudsLayer4" className={styles.cloudsLayer4}>
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
}
