// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Alert } from '@material-tailwind/react';
import styled from 'styled-components';

interface Props {
    alerts: { id: string; msg: string }[];
    closeAlert: (id?: string) => void;
}

const AlertsContainer = styled.div`
    position: absolute;
    bottom: 0;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px;
    max-height: 100vh;
    width: 650px;
    z-index: 10000;
`;

export default function Alerts({ alerts, closeAlert }: Props) {
    const [alrts, setAlrts] = useState<{ id: string; msg: string }[]>(alerts);
    useEffect(() => {
        setAlrts(alerts);
    }, [alerts]);
    return (
        <AlertsContainer>
            {alrts.map((alert) => {
                return (
                    <Alert
                        style={{
                            maxWidth: '500px'
                        }}
                        key={alert.id}
                        open={
                            !!alrts.find((element) => element.id === alert.id)
                        }
                        onClose={() => closeAlert(alert.id)}
                        color="red"
                    >
                        {setTimeout(() => closeAlert(alert.id), 10000) && null}
                        <div
                            style={{
                                maxHeight: '200px',
                                overflowY: 'scroll',
                                overflowX: 'hidden',
                                minHeight: '20px',
                                maxWidth: '450px'
                            }}
                        >
                            {alert.msg}
                        </div>
                    </Alert>
                );
            })}
            {alrts.length > 0 && (
                <button
                    style={{
                        position: 'absolute',
                        bottom: 5,
                        left: 525,
                        whiteSpace: 'nowrap',
                        color: 'white'
                    }}
                    onClick={() => closeAlert()}
                >
                    Clear All
                </button>
            )}
        </AlertsContainer>
    );
}
