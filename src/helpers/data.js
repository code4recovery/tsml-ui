import { settings, strings } from './settings';
import { formatConferenceProvider, formatSlug } from './format';
import distance from './distance';
import moment from 'moment-timezone';

const debug = false;

//run filters on meetings; this is run at every render
export function filterMeetingData(state, setAppState) {
  const execStart = new Date();

  const matchGroups = [];

  //filter by region, day, time, and type
  settings.filters.forEach(filter => {
    if (filter == 'distance') {
      //
    } else if (state.input[filter].length && state.indexes[filter].length) {
      matchGroups.push(
        [].concat.apply(
          [],
          state.input[filter].map(key => {
            const match = getIndexByKey(state.indexes[filter], key);
            return match ? match.slugs : [];
          })
        )
      );
    }
  });

  //handle keyword search or geolocation
  if (state.input.mode === 'search') {
    if (state.input.search.length) {
      //todo: improve searching to be OR search instead of AND
      const needle = processSearch(state.input.search.toLowerCase());
      const matches = Object.keys(state.meetings).filter(slug => {
        return state.meetings[slug].search.search(needle) !== -1;
      });
      matchGroups.push([].concat.apply([], matches));
    }
  } else if (state.input.mode === 'me') {
    if (!state.input.latitude || !state.input.longitude) {
      navigator.geolocation.getCurrentPosition(
        position => {
          //this will cause a re-render with latitude and longitude now set
          setAppState('input', {
            latitude: parseFloat(position.coords.latitude.toFixed(5)),
            longitude: parseFloat(position.coords.longitude.toFixed(5)),
            ...state.input,
          });
        },
        error => {
          console.warn(`getCurrentPosition() error: ${error.message}`);
        },
        { timeout: 5000 }
      );
    } else {
      //todo: filter meetings now based on distance
    }
  }

  //do the filtering, if necessary
  const filteredSlugs = matchGroups.length
    ? getCommonElements(matchGroups) //get intersection of slug arrays
    : Object.keys(state.meetings); //get everything

  //loop through and update or clear distances
  filteredSlugs.forEach(slug => {
    if (state.input.latitude && state.input.longitude) {
      state.meetings[slug] = {
        distance: distance(state.input, state.meetings[slug]),
        ...state.meetings[slug],
      };
    }
  });

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
      if (meetingA.minutes_week !== meetingB.minutes_week) {
        return meetingA.minutes_week - meetingB.minutes_week;
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

//find an index by key (todo refactor)
export function getIndexByKey(indexes, key) {
  const getFilterByKey = key => {
    const searchFunc = (found, item) => {
      const children = item.children || [];
      return (
        found || (item.key === key ? item : children.reduce(searchFunc, null))
      );
    };
    return searchFunc;
  };
  return indexes.reduce(getFilterByKey(key), null);
}

//recursive function to make sorted array from object index
function flattenAndSortIndexes(index, sortFn) {
  return Object.values(index)
    .map(entry => {
      if (entry.children)
        entry.children = flattenAndSortIndexes(entry.children, sortFn);
      return entry;
    })
    .sort(sortFn);
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
    'formatted_address',
    'group',
    'group_notes',
    'latitude',
    'location',
    'location_notes',
    'longitude',
    'minutes_now',
    'minutes_week',
    'name',
    'notes',
    'paypal',
    'regions',
    'search',
    'slug',
    'square',
    'start',
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
    //using array for regions now, but legacy region, sub_region, etc still supported
    //todo remove if/when tsml implements regions array format
    if (!meeting.regions) {
      if (meeting.region) {
        meeting.regions = [meeting.region];
        if (meeting.sub_region) {
          meeting.regions.push(meeting.sub_region);
          if (meeting.sub_sub_region) {
            meeting.regions.push(meeting.sub_sub_region);
          }
        }
      } else if (meeting.city) {
        meeting.regions = [meeting.city];
      }
    }

    //build region index
    if (meeting.regions) {
      indexes.region = populateRegionsIndex(
        meeting.regions,
        0,
        indexes.region,
        meeting.slug
      );
    }

    //format day
    if (Number.isInteger(meeting.day)) {
      //convert day to string if integer
      meeting.day = meeting.day.toString();
    } else if (lookup_day.includes(meeting.day)) {
      meeting.day = lookup_day.indexOf(meeting.day).toString();
    }

    //format latitude + longitude
    if (meeting.latitude && meeting.longitude) {
      capabilities.coordinates = true;
      meeting.latitude = parseFloat(meeting.latitude);
      meeting.longitude = parseFloat(meeting.longitude);
    }

    //handle day and time
    if (meeting.day && meeting.time) {
      //build day index
      if (!indexes.day.hasOwnProperty(meeting.day)) {
        indexes.day[meeting.day] = {
          key: meeting.day,
          name: strings[settings.days[meeting.day]],
          slugs: [],
        };
      }
      indexes.day[meeting.day].slugs.push(meeting.slug);

      //make start/end moments
      if (debug) console.log(meeting.timezone ?? settings.timezone);
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
      const minutes_midnight =
        meeting.start.get('hour') * 60 + meeting.start.get('minutes');
      meeting.minutes_week = minutes_midnight + meeting.day * 1440;

      //if time is earlier than 10 minutes ago, increment diff by a week
      if (meeting.minutes_now < -10) {
        meeting.minutes_now += 10080;
      }

      //build time index (can be multiple)
      let times = [];
      if (minutes_midnight >= 240 && minutes_midnight < 720) {
        //4am–12pm
        times.push(0); //morning
      }
      if (minutes_midnight >= 660 && minutes_midnight < 1020) {
        //11am–5pm
        times.push(1); //midday
      }
      if (minutes_midnight >= 960 && minutes_midnight < 1260) {
        //4–9pm
        times.push(2); //evening
      }
      if (minutes_midnight >= 1200 || minutes_midnight < 300) {
        //8pm–5am
        times.push(3); //night
      }
      times.forEach(time => {
        if (!indexes.time.hasOwnProperty(time)) {
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
      //clean up and sort types
      meeting.types = meeting.types
        .map(type => type.trim())
        .filter(
          type =>
            lookup_type_codes.includes(type) ||
            lookup_type_values.includes(type)
        )
        .map(type =>
          lookup_type_codes.includes(type) ? strings.types[type] : type
        );

      //build type index (can be multiple)
      meeting.types.forEach(type => {
        if (!indexes.type.hasOwnProperty(type)) {
          indexes.type[type] = {
            key: formatSlug(type),
            name: type,
            slugs: [],
          };
        }
        indexes.type[type].slugs.push(meeting.slug);
      });
    }

    //conference provider
    meeting.conference_provider = meeting.conference_url
      ? formatConferenceProvider(meeting.conference_url)
      : null;

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
      meeting.formatted_address,
      meeting.group,
      meeting.group_notes,
      meeting.location,
      meeting.location_notes,
      meeting.name,
      meeting.notes,
    ];
    if (meeting.regions) {
      search_array = search_array.concat(meeting.regions);
    }
    meeting.search = search_array
      .filter(e => e)
      .join(' ')
      .toLowerCase();

    //clean up keys not in allowed meeting properties
    Object.keys(meeting).map(key => {
      if (!meeting_properties.includes(key)) {
        delete meeting[key];
      }
    });

    meetings[meeting.slug] = meeting;
  });

  //convert region to array, sort by name
  indexes.region = flattenAndSortIndexes(indexes.region, (a, b) => {
    return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  });
  capabilities.region = !!indexes.region.length;

  //convert day to array and sort by ordinal
  indexes.day = flattenAndSortIndexes(indexes.day, (a, b) => {
    return a.key - b.key;
  });
  capabilities.day = !!indexes.day.length;

  //convert time to array and sort by ordinal
  indexes.time = flattenAndSortIndexes(indexes.time, (a, b) => {
    return settings.times.indexOf(a.key) - settings.times.indexOf(b.key);
  });
  capabilities.time = !!indexes.time.length;

  //convert type to array and sort by name
  indexes.type = flattenAndSortIndexes(indexes.type, (a, b) => {
    return a.name > b.name ? 1 : b.name > a.name ? -1 : 0;
  });
  capabilities.type = !!indexes.type.length;

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

//recursive function to build an index of regions from a flat array
function populateRegionsIndex(regions, position, index, slug) {
  const region = regions[position];
  if (!index.hasOwnProperty(region)) {
    index[region] = {
      key: formatSlug(regions.slice(0, position + 1).join(' ')),
      name: region,
      slugs: [],
      children: {},
    };
  }
  index[region].slugs.push(slug);
  if (regions.length > position + 1) {
    index[region].children = populateRegionsIndex(
      regions,
      position + 1,
      index[region].children,
      slug
    );
  }
  return index;
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
    meeting.types = meeting.types.split(',').map(type => type.trim());

    meetings.push(meeting);
  }

  return meetings;
}
