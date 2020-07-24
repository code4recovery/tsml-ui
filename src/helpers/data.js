import { settings, strings } from './settings';
import Slugify from './slugify';
import { formatConferenceProvider } from './conference';
import distance from './distance';
import moment from 'moment-timezone';

const debug = false;

//run filters on meetings; this is run at every render
export function filterMeetingData(state, setAppState) {
  const execStart = new Date();

  let filterFound = false;
  let filteredSlugs = [];

  //filter by region, day, time, and type
  for (let i = 0; i < settings.filters.length; i++) {
    let filter = settings.filters[i];
    if (state.input[filter].length && state.indexes[filter].length) {
      filterFound = true;
      filteredSlugs.push(
        [].concat.apply(
          [],
          state.input[filter].map(x => {
            const value = state.indexes[filter].find(y => y.key == x);
            return value ? value.slugs : [];
          })
        )
      );
    }
  }

  //handle keyword search or geolocation
  if (state.input.mode === 'search') {
    //clear center
    state.input.center = null;

    if (state.input.search.length) {
      //todo: improve searching to be OR search instead of AND
      filterFound = true;
      const needle = processSearch(state.input.search.toLowerCase());
      const matches = Object.keys(state.meetings).filter(slug => {
        return state.meetings[slug].search.search(needle) !== -1;
      });
      filteredSlugs.push([].concat.apply([], matches));
    }
  } else if (state.input.mode === 'me') {
    if (!state.input.center) {
      navigator.geolocation.getCurrentPosition(
        position => {
          //this will cause a re-render with state.input.center now set
          state.input.center = position.coords;
          setAppState('input', state.input);
        },
        error => {
          console.warn('getCurrentPosition error', error);
        },
        { timeout: 5000 }
      );
    } else {
      //todo: filter meetings now based on distance
    }
  }

  //loop through and update or clear distances
  Object.keys(state.meetings).map(slug => {
    return {
      distance: distance(state.input.center, state.meetings[slug]),
      ...state.meetings[slug],
    };
  });

  //do the filtering, if necessary
  filteredSlugs = filterFound
    ? getCommonElements(filteredSlugs) //get intersection of slug arrays
    : Object.keys(state.meetings); //get everything

  //sort slugs
  filteredSlugs.sort((a, b) => {
    const meetingA = state.meetings[a];
    const meetingB = state.meetings[b];

    if (!state.input.day.length) {
      //if upcoming, sort by time_diff
      if (meetingA.minutes_now !== meetingB.minutes_now) {
        return meetingA.minutes_now - meetingB.minutes_now;
      }
    } else {
      if (meetingA.minutes_midnight !== meetingB.minutes_midnight) {
        return meetingA.minutes_midnight - meetingB.minutes_midnight;
      }
    }

    //then by distance
    if (meetingA.distance !== meetingB.distance) {
      if (meetingA.distance === null) return -1;
      if (meetingB.distance === null) return 1;
      return meetingA.distance - meetingB.distance;
    }

    //then by location name
    if (meetingA.location !== meetingB.location) {
      if (meetingA.location === null) return -1;
      if (meetingB.location === null) return 1;
      return meetingA.location.localeCompare(meetingB.location);
    }

    //then by meeting name
    if (meetingA.name !== meetingB.name) {
      if (meetingA.name === null) return -1;
      if (meetingB.name === null) return 1;
      return meetingA.name.localeCompare(meetingB.location);
    }

    return 0;
  });

  if (debug)
    console.log(`filterMeetingData took ${(new Date() - execStart) / 1000}`);

  return filteredSlugs;
}

//look for data with multiple days and make them all single
function flattenDays(data) {
  let meetings_to_add = [];
  let indexes_to_remove = [];

  data.forEach((meeting, index) => {
    if (Array.isArray(meeting.day)) {
      indexes_to_remove.push(index);
      meeting.day.forEach(day => {
        meetings_to_add.push({
          day: day,
          slug: meeting.slug + '-' + day,
          ...meeting,
        });
      });
    }
  });

  indexes_to_remove.forEach(index => {
    data = data.splice(index, 1);
  });

  return data.concat(meetings_to_add);
}

//get common matches between arrays (for meeting filtering)
function getCommonElements(arrays) {
  let currentValues = {};
  let commonValues = {};
  if (!arrays.length) return [];
  for (let i = arrays[0].length - 1; i >= 0; i--) {
    //Iterating backwards for efficiency
    currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
  }
  for (let i = arrays.length - 1; i > 0; i--) {
    const currentArray = arrays[i];
    for (let j = currentArray.length - 1; j >= 0; j--) {
      if (currentArray[j] in currentValues) {
        commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
      }
    }
    currentValues = commonValues;
    commonValues = {};
  }
  return Object.keys(currentValues);
}

//set up meeting data; this is only run once when the app loads
export function loadMeetingData(data, capabilities) {
  const execStart = new Date();

  //meetings is a lookup
  let meetings = {};

  //indexes start as objects, will be converted to arrays
  let indexes = {
    day: {},
    region: {},
    time: {},
    type: {},
  };

  //filter out unused meetings properties for a leaner memory footprint
  const meeting_properties = [
    'conference_phone',
    'conference_provider',
    'conference_url',
    'end',
    'flags',
    'formatted_address',
    'latitude',
    'location',
    'location_notes',
    'longitude',
    'minutes_midnight',
    'minutes_now',
    'name',
    'notes',
    'paypal',
    'region',
    'search',
    'slug',
    'square',
    'start',
    'sub_region',
    'types',
    'venmo',
  ];

  //define lookups we'll need later
  const lookup_day = settings.days.map(day => strings[day]);
  const lookup_type_codes = Object.keys(strings.types);
  const lookup_type_values = Object.values(strings.types);

  //for diff
  const now = moment();

  //check for meetings with multiple days and create an individual meeting for each
  data = flattenDays(data);

  //loop through each entry
  data.forEach(meeting => {
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

    //format latitude + longitude
    if (meeting.latitude) meeting.latitude = parseFloat(meeting.latitude);
    if (meeting.longitude) meeting.longitude = parseFloat(meeting.longitude);

    //handle day and time
    if (meeting.day && meeting.time) {
      //build day index
      if (!indexes.day.hasOwnProperty(meeting.day)) {
        capabilities.day = true;
        indexes.day[meeting.day] = {
          key: meeting.day,
          name: strings[settings.days[meeting.day]],
          slugs: [],
        };
      }
      indexes.day[meeting.day].slugs.push(meeting.slug);

      //make moments out of start and end
      meeting.start = moment.tz(
        `${meeting.day} ${meeting.time}`,
        'd hh:mm',
        meeting.timezone ?? settings.timezone
      );

      if (meeting.end_time) {
        meeting.end = moment.tz(
          `${meeting.day} ${meeting.end_time}`,
          'd hh:mm',
          meeting.timezone ?? settings.timezone
        );
      }

      //time differences for sorting
      meeting.minutes_now = meeting.start.diff(now, 'minutes');
      meeting.minutes_midnight =
        meeting.start.get('hour') * 60 + meeting.start.get('minutes');

      //if time is earlier than 10 minutes ago, increment diff by a week
      if (meeting.minutes_now < -10) {
        meeting.minutes_now += 10080;
      }

      //build time index (can be multiple)
      let times = [];
      if (meeting.minutes_midnight >= 240 && meeting.minutes_midnight < 720) {
        //4am–12pm
        times.push(0); //morning
      }
      if (meeting.minutes_midnight >= 660 && meeting.minutes_midnight < 1020) {
        //11am–5pm
        times.push(1); //midday
      }
      if (meeting.minutes_midnight >= 960 && meeting.minutes_midnight < 1260) {
        //4–9pm
        times.push(2); //evening
      }
      if (meeting.minutes_midnight >= 1200 || meeting.minutes_midnight < 300) {
        //8pm–5am
        times.push(3); //night
      }
      times.forEach(time => {
        if (!indexes.time.hasOwnProperty(time)) {
          capabilities.time = true;
          indexes.time[time] = {
            key: settings.times[time],
            name: strings[settings.times[time]],
            slugs: [],
          };
        }
        indexes.time[time].slugs.push(meeting.slug);
      });
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

      //flags
      meeting.flags = settings.flags
        .filter(
          type =>
            lookup_type_values.includes(type) && meeting.types.includes(type)
        )
        .sort()
        .join(', ');

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

    //conference provider
    meeting.conference_provider = meeting.conference_url
      ? formatConferenceProvider(meeting.conference_url)
      : null;

    //build index of map pins
    if (meeting.latitude && meeting.longitude) {
      capabilities.coordinates = true;
    }

    //creates formatted_address if necessary
    if (!meeting.formatted_address) {
      if (meeting.city) {
        meeting.formatted_address = meeting.city;
        if (meeting.address) {
          meeting.formatted_address =
            meeting.address + ', ' + meeting.formatted_address;
        }
        if (meeting.state) {
          meeting.formatted_address =
            meeting.formatted_address + ', ' + meeting.state;
        }
        if (meeting.postal_code) {
          meeting.formatted_address =
            meeting.formatted_address + ' ' + meeting.postal_code;
        }
        if (meeting.country) {
          meeting.formatted_address =
            meeting.formatted_address + ', ' + meeting.country;
        }
      } else {
        console.error(
          'Formatted address could not be created, at least city is required.'
        );
      }
    }

    //build search string
    let search_array = [
      meeting.name,
      meeting.location,
      meeting.location_notes,
      meeting.notes,
      meeting.formatted_address,
    ];
    if (meeting.region) {
      search_array.push(meeting.region);
    }
    if (meeting.regions) {
      search_array = search_array.concat(meeting.regions);
    }
    meeting.search = search_array
      .filter(e => e)
      .join(' ')
      .toLowerCase();

    //loop through and remove items not in whitelist
    Object.keys(meeting).map(key => {
      if (!meeting_properties.includes(key)) {
        delete meeting[key];
      }
    });

    meetings[meeting.slug] = meeting;
  });

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

  //near me mode enabled on https or local development
  if (capabilities.coordinates) {
    //todo implement geocoding
    //settings.modes.push('location');
    if (
      navigator.geolocation &&
      (window.location.protocol == 'https:' ||
        window.location.hostname == 'localhost')
    ) {
      capabilities.geolocation = true;
      settings.modes.push('me');
    }
    if (settings.keys.mapbox) {
      capabilities.map = true;
    }
  }

  if (debug)
    console.log(`loadMeetingData took ${(new Date() - execStart) / 1000}`);

  return [meetings, indexes, capabilities];
}

//translates Google Sheet JSON into Meeting Guide format
export function translateGoogleSheet(data) {
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

    //Google Sheets don't support underscore
    if (meeting.postalcode) {
      meeting.postal_code = meeting.postalcode;
      delete meeting['postalcode'];
    }

    //use Google-generated slug if none was provided
    if (!meeting.slug) {
      let slug = data.feed.entry[i].id['$t'];
      meeting.slug = slug.substring(slug.lastIndexOf('/') + 1);
    }

    //convert time to HH:MM
    meeting.time = parseTime(meeting.time);

    //array-ify types
    meeting.types = meeting.types.split(',').map(trim);

    meetings.push(meeting);
  }

  return meetings;
}

//parse weird google sheet times - todo use moment
function parseTime(timeString) {
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

// converts a search string into pipe delimited format. Example:
// input: "west chester" malvern devon "center city west"
// output: west chester|malvern|devon|center city west
function processSearch(search_string) {
  let terms = [];
  // Parse out any quoted strings
  if (search_string.includes('"')) {
    const exp = /"(.*?)"/g;
    // Grab any quoted strings, add them to terms, and delete from source string
    for (
      let match = exp.exec(search_string);
      match != null;
      match = exp.exec(search_string)
    ) {
      search_string = search_string.replace(match[0], '');
      terms.push(match[0].replace(/"/g, ''));
    }
  }

  // Add any non-quoted strings remaining to the terms
  if (search_string.length) {
    terms = terms.concat(search_string.match(/[^ ]+/g));
  }

  // Return the the pipe delimited search string
  return terms.join('|');
}
