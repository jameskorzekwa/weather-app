import React, { useEffect, useState } from 'react';
import { Alert } from '@material-tailwind/react';

interface Props {
    alerts: { id: string; msg: string }[];
    closeAlert: (id: string) => void;
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
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: '10px',
                padding: '10px'
            }}
        >
            {alrts.map((alert) => {
                return (
                    <Alert
                        style={{ width: '35vw' }}
                        key={alert.id}
                        open={
                            !!alrts.find((element) => element.id === alert.id)
                        }
                        onClose={() => closeAlert(alert.id)}
                        color="red"
                    >
                        {alert.msg}
                    </Alert>
                );
            })}
        </div>
    );
}
