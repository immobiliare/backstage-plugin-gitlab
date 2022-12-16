import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
dayjs.extend(relativeTime);
dayjs.extend(duration);

export const getElapsedTime = (start: string) => {
    return dayjs(start).fromNow();
};

export const getDuration = (start: string, end: string) => {
    if (!end || !start) {
        return 'NA';
    }

    const end_time = dayjs(end); //todays date
    const start_time = dayjs(start); // another date
    const duration = dayjs.duration(
        end_time.diff(start_time, 'seconds'),
        'seconds'
    );

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    const output = `${days ? days + 'd ' : ''}${hours ? hours + 'h ' : ''}${
        minutes ? minutes + 'm ' : ''
    }${seconds ? seconds + 's' : ''}`;

    if (!output) return '0s';

    return output;
};
