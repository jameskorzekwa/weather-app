'use client';
import '@/css/weather-icons.css';
import moment from 'moment';
import { useInterval } from 'usehooks-ts';
import { useState } from 'react';
import { applyFakeTime } from '@/lib/utils';

interface Props {
    fakeTime?: string;
}

export default function DateTime({ fakeTime }: Props) {
    const [datetime, setDatetime] = useState<moment.Moment>(moment());
    useInterval(() => {
        const now = moment();
        setDatetime(now);
    }, 1000);
    const displayDatetime = applyFakeTime(datetime, fakeTime);
    return (
        <div className="flex flex-col items-start gap-1 sm:items-end sm:gap-4">
            <div className="text text-xl sm:text-4xl">
                {displayDatetime.format('dddd, MMMM Do YYYY')}
            </div>
            <div className="text text-4xl sm:text-7xl">
                {displayDatetime.format('h:mm A')}
            </div>
        </div>
    );
}
