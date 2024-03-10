'use client';
import '/css/weather-icons.css';
import moment from 'moment';
import { useInterval } from 'usehooks-ts';
import { useState } from 'react';

export default function DateTime() {
    const [datetime, setDatetime] = useState<moment.Moment>(moment());
    useInterval(() => {
        const now = moment();
        setDatetime(now);
    }, 1000);
    return (
        <div className="flex flex-col items-end gap-4">
            <div className="text text-4xl">
                {datetime.format('dddd, MMMM Do YYYY')}
            </div>
            <div className="text text-7xl">{datetime.format('h:mm A')}</div>
        </div>
    );
}
