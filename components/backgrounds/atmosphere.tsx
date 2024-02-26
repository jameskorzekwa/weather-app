import styles from '@/components/background.module.css';
import React from 'react';

interface Props {
    id: number;
    isNight: boolean;
}

export default function Atmosphere({ id, isNight }: Props) {
    return (
        <div
            style={{
                backgroundColor: isNight ? 'rgb(23,23,23)' : 'rgb(147,114,104)',
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
}
