import moment from 'moment';

export const getElapsedTime = (start: string) => {
    return moment(start).fromNow();
};

export const getDuration = (start: string, end: string) => {
  if(!end || !start) {
    return "NA";
  }

  let end_time = moment(end); //todays date
  let start_time = moment(start); // another date
  return end_time.diff(start_time, 'minutes') + " min(s)";
}  