import { ParseTime } from './time';

//translates Google Sheet JSON into Meeting Guide format
export default function translateGoogleSheet(data) {
  //see Cateret County example on https://github.com/meeting-guide/spreadsheet
  //https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ5OsDCKSDEvWvqM_Z6tmXe4N-VYEnEAfvU5PX5QXZjHVbnrX-aeiyhWnZp0wpWtOmWjO4L5GJtfFu/pubhtml
  //JSON: https://spreadsheets.google.com/feeds/list/1prbiXHu9JS5eREkYgBQkxlkJELRHqrKz6-_PLGPWIWk/1/public/values?alt=json

  let meetings = [];

  for (let i = 0; i < data.feed.entry.length; i++) {
    //creates a meeting object containing a property corresponding to each column header of the Google Sheet
    let meeting = {};
    const meetingKeys = Object.keys(data.feed.entry[i]);
    for (let j = 0; j < meetingKeys.length; j++) {
      if (meetingKeys[j].substr(0, 4) == 'gsx$') {
        meeting[meetingKeys[j].substr(4)] =
          data.feed.entry[i][meetingKeys[j]]['$t'];
      }
    }

    //use Google-generated slug if none was provided
    if (!meeting.slug) {
      let slug = data.feed.entry[i].id['$t'];
      meeting.slug = slug.substring(slug.lastIndexOf('/') + 1);
    }

    //convert time to HH:MM
    meeting.time = ParseTime(meeting.time);

    //array-ify types
    meeting.types = meeting.types.split(',');

    meetings.push(meeting);
  }

  return meetings;
}
