'use client';
import '/css/weather-icons.css';
import moment from 'moment';

interface Props {
    datetime: moment.Moment;
}

export default function DateTime({ datetime }: Props) {
    return (
        <div className="flex flex-col items-end gap-4">
            <div className="text text-3xl">
                {datetime.format('dddd, MMMM Do YYYY')}
            </div>
            <div className="text text-5xl">{datetime.format('h:mm A')}</div>
        </div>
    );
}
