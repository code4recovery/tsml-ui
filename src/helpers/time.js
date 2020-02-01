import { strings } from '../settings';

//quick format time function
export function formatTime(time) {
  //check that string is HH:MM
  if (!time || time.length !== 5 || time.substr(2, 1) !== ':') return null;

  //get hours and minutes
  const [hours, minutes] = time.split(':');

  //check for times with special names
  if (hours == '12' && minutes == '00') {
    return strings.noon;
  } else if (
    (hours == '00' && minutes == '00') ||
    (hours == '23' && minutes == '59') ||
    (hours == '24' && minutes == '00')
  ) {
    return strings.midnight;
  }

  //create a date object
  let date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function parseTime(timeString) {
  if (!timeString.length) return null;

  const time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);

  if (time == null) return null;

  let hours = parseInt(time[1], 10);
  if (hours == 12 && !time[4]) {
    hours = 0;
  } else {
    hours += hours < 12 && time[4] ? 12 : 0;
  }

  return String(hours).padStart(2, '0') + ':' + time[3];
}
