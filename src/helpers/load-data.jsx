import { settings, strings } from '../settings';
import Slugify from './slugify';
import { FormatTime } from './time';

export default function LoadData(meetings, capabilities) {
  //indexes start as objects, will be converted to arrays
  let indexes = {
    day: {},
    region: {},
    time: {},
    type: {},
  };

  //filter out unused meetings properties for a leaner memory footprint
  const meeting_properties = [
    'day',
    'formatted_address',
    'formatted_end_time',
    'formatted_time',
    'latitude',
    'longitude',
    'location',
    'location_notes',
    'name',
    'notes',
    'region',
    'search',
    'slug',
    'sub_region',
    'time',
    'types',
  ];

  //need these lookups in a second
  const lookup_day = settings.days.map(day => strings[day]);
  const lookup_type_codes = Object.keys(strings.types);
  const lookup_type_values = Object.values(strings.types);

  //check for any meetings with arrays of days and creates an individual meeting for each day in array
  let meetings_to_add = [];
  let indexes_to_remove = [];
  let meeting_keys = [];

  for (let i = 0; i < meetings.length; i++) {
    //for readability
    let meeting = meetings[i];

    if (Array.isArray(meeting.day)) {
      indexes_to_remove.push(i);
      meeting.day.forEach(function(single_day) {
        let temp_meeting = Object.assign({}, meeting);
        temp_meeting.day = single_day;
        temp_meeting.slug = meeting.slug + '-' + single_day;
        meetings_to_add.push(temp_meeting);
      });
    }
  }

  for (let i = 0; i < indexes_to_remove.length; i++) {
    meetings = meetings.splice(indexes_to_remove[i], 1);
  }

  meetings = meetings.concat(meetings_to_add);

  //build index objects for dropdowns
  for (let i = 0; i < meetings.length; i++) {
    //for readability
    let meeting = meetings[i];

    //if no region then use city
    if (!meeting.region && meeting.city) {
      meeting.region = meeting.city;
    }

    //build region index
    if (meeting.region) {
      capabilities.region = true;
      if (meeting.region in indexes.region === false) {
        indexes.region[meeting.region] = {
          key: meeting.region_id || Slugify(meeting.region),
          name: meeting.region,
          slugs: [],
        };
      }
      indexes.region[meeting.region].slugs.push(meeting.slug);
    }

    //format day
    if (Number.isInteger(meeting.day)) {
      //convert day to string if integer
      meeting.day = meeting.day.toString();
    } else if (lookup_day.includes(meeting.day)) {
      meeting.day = lookup_day.indexOf(meeting.day).toString();
    }

    //build day index
    if (meeting.day) {
      capabilities.day = true;
      if (meeting.day in indexes.day === false) {
        indexes.day[meeting.day] = {
          key: meeting.day,
          name: strings[settings.days[meeting.day]],
          slugs: [],
        };
      }
      indexes.day[meeting.day].slugs.push(meeting.slug);
    }

    //build time index (can be multiple)
    if (meeting.time) {
      capabilities.time = true;
      const [hours, minutes] = meeting.time.split(':');
      const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
      let times = [];
      if (timeInMinutes >= 240 && timeInMinutes < 720) {
        //4am–12pm
        times.push(0); //morning
      }
      if (timeInMinutes >= 660 && timeInMinutes < 1020) {
        //11am–5pm
        times.push(1); //midday
      }
      if (timeInMinutes >= 960 && timeInMinutes < 1260) {
        //4–9pm
        times.push(2); //evening
      }
      if (timeInMinutes >= 1200 || timeInMinutes < 300) {
        //8pm–5am
        times.push(3); //night
      }
      for (let j = 0; j < times.length; j++) {
        if (times[j] in indexes.time === false) {
          indexes.time[times[j]] = {
            key: settings.times[times[j]],
            name: strings[settings.times[times[j]]],
            slugs: [],
          };
        }
        indexes.time[times[j]].slugs.push(meeting.slug);
      }

      //format for display
      meeting.formatted_time = FormatTime(meeting.time);
      meeting.formatted_end_time = FormatTime(meeting.end_time);
    }

    //handle types
    if (meeting.types) {
      capabilities.type = true;

      //clean up and sort types
      meeting.types = meeting.types
        .map(type => type.trim())
        .filter(type => {
          return (
            lookup_type_codes.includes(type) ||
            lookup_type_values.includes(type)
          );
        })
        .map(type => {
          return lookup_type_codes.includes(type) ? strings.types[type] : type;
        })
        .sort();

      //build type index (can be multiple)
      for (let j = 0; j < meeting.types.length; j++) {
        if (meeting.types[j] in indexes.type === false) {
          indexes.type[meeting.types[j]] = {
            key: Slugify(meeting.types[j]),
            name: meeting.types[j],
            slugs: [],
          };
        }
        indexes.type[meeting.types[j]].slugs.push(meeting.slug);
      }
    }

    //build index of map pins
    if (meeting.latitude && meeting.latitude) {
      capabilities.coordinates = true;
    }

    //creates formatted_address if necessary
    if (!meeting.formatted_address) {
      if (meeting.address && meeting.city) {
        let temp = meeting.address + ', ' + meeting.city;
        if (meeting.state) temp = temp + ', ' + meeting.state;
        if (meeting.postal_code) {
          temp = temp + ' ' + meeting.postal_code;
          //for Google Sheets or other feeds without underscore
        } else if (meeting.postalcode) {
          temp = temp + ' ' + meeting.postalcode;
        }
        if (meeting.country) temp = temp + ', ' + meeting.country;
        meeting.formatted_address = temp;
      } else {
        console.error(
          'Formatted address could not be created, at least address and city required.'
        );
      }
    }

    //build search string
    meeting.search = [
      meeting.name,
      meeting.location,
      meeting.location_notes,
      meeting.notes,
      meeting.formatted_address,
    ]
      .filter(e => e)
      .join(' ')
      .toLowerCase();

    //loop through and remove items not in whitelist
    Object.keys(meeting).map(key => {
      if (!meeting_properties.includes(key)) {
        delete meeting[key];
      }
    });
  }

  //convert region to array and sort by name
  indexes.region = Object.values(indexes.region);
  indexes.region.sort((a, b) => {
    return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  });

  //convert day to array and sort by ordinal
  indexes.day = Object.values(indexes.day);
  indexes.day.sort((a, b) => {
    return a.key - b.key;
  });

  //convert time to array and sort by ordinal
  indexes.time = Object.values(indexes.time);
  indexes.time.sort((a, b) => {
    return settings.times.indexOf(a.key) - settings.times.indexOf(b.key);
  });

  //convert type to array and sort by name
  indexes.type = Object.values(indexes.type);
  indexes.type.sort((a, b) => {
    return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  });

  //near me mode enabled on https
  if (capabilities.coordinates) {
    settings.modes.push('location');
    if (window.location.protocol == 'https:') {
      capabilities.geolocation = true;
      settings.modes.push('me');
    }
    if (settings.keys.mapbox) {
      capabilities.map = true;
    }
  }

  return [meetings, indexes, capabilities];
}
