import moment from 'moment-timezone';
import { settings } from '../settings';

//set minutes
export function setMinutesNow(meetings) {
  const now = moment();
  Object.keys(meetings).forEach(key => {
    meetings[key].minutes_now = meetings[key].start
      ? meetings[key].start.diff(now, 'minutes')
      : -9999;
    //if time is earlier than X minutes ago, increment diff by a week
    if (meetings[key].minutes_now < settings.now_offset) {
      meetings[key].minutes_now += 10080;
    }
  });
  return meetings;
}
