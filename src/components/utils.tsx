import moment from 'moment';

export const getElapsedTime = (start: string) => {
    return moment(start).fromNow();
};

export const getDuration = (start: string, end: string) => {
    if (!end || !start) {
        return 'NA';
    }

    const end_time = moment(end); //todays date
    const start_time = moment(start); // another date
    const duration = moment.duration(
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
