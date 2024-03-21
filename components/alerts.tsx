import React, { useEffect, useState } from 'react';
import { Alert } from '@material-tailwind/react';

interface Props {
    alerts: { id: string; msg: string }[];
    closeAlert: (id?: string) => void;
}

export default function Alerts({ alerts, closeAlert }: Props) {
    const [alrts, setAlrts] = useState<{ id: string; msg: string }[]>(alerts);
    useEffect(() => {
        setAlrts(alerts);
    }, [alerts]);
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 0,
                overflowY: 'scroll',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '10px',
                maxHeight: '100vh',
                width: 650,
                zIndex: 10000
            }}
        >
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
        </div>
    );
}
