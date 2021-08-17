import moment from 'moment';

export const getElapsedTime = (start: string) => {
    return moment(start).fromNow();
  };
  