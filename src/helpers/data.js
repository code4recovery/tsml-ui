import moment from 'moment-timezone';

import { distance } from './distance';
import { formatConferenceProvider, formatSlug } from './format';
import { settings, strings } from './settings';

//calculate distances
function calculateDistances(
  latitude,
  longitude,
  filteredSlugs,
  state,
  setState
) {
  //build new index and meetings array
  let distanceIndex = {};

  //loop through and update or clear distances, and rebuild index
  filteredSlugs.forEach(slug => {
    state.meetings[slug] = {
      ...state.meetings[slug],
      distance: distance(
        { latitude: latitude, longitude: longitude },
        state.meetings[slug]
      ),
    };

    settings.distance_options.forEach(distance => {
      if (state.meetings[slug].distance <= distance) {
        if (!distanceIndex.hasOwnProperty(distance)) {
          distanceIndex[distance] = {
            key: distance.toString(),
            name: `${distance} ${settings.distance_unit}`,
            slugs: [],
          };
        }
        distanceIndex[distance].slugs.push(slug);
      }
    });
  });

  //flatten index and set capability
  distanceIndex = flattenAndSortIndexes(
    distanceIndex,
    (a, b) => parseInt(a.key) - parseInt(b.key)
  );
  state.capabilities.distance = !!distanceIndex.length;

  //this will cause a re-render with latitude and longitude now set
  setState({
    ...state,
    capabilities: state.capabilities,
    indexes: {
      ...state.indexes,
      distance: distanceIndex,
    },
    input: {
      ...state.input,
      latitude: parseFloat(latitude.toFixed(5)),
      longitude: parseFloat(longitude.toFixed(5)),
    },
  });
}

//run filters on meetings; this is run at every render
export function filterMeetingData(state, setState) {
  const matchGroups = {};

  //filter by distance, region, time, type, and weekday
  settings.filters.forEach(filter => {
    if (state.input[filter].length && state.capabilities[filter]) {
      matchGroups[filter] = [].concat.apply(
        [],
        state.input[filter].map(key => {
          const match = getIndexByKey(state.indexes[filter], key);
          return match ? match.slugs : [];
        })
      );
    }
  });

  //handle keyword search or geolocation
  if (state.input.mode === 'search') {
    if (state.input.search.length) {
      //todo: improve searching to be OR search instead of AND
      const needle = processSearch(state.input.search);
      const matches = Object.keys(state.meetings).filter(
        slug => state.meetings[slug].search.search(needle) !== -1
      );
      matchGroups.search = [].concat.apply([], matches);
    }
  } else if (['me', 'location'].includes(state.input.mode)) {
    //only show meetings with physical locations
    const meetingsWithCoordinates = Object.keys(state.meetings).filter(
      slug => state.meetings[slug].latitude && state.meetings[slug].latitude
    );
    matchGroups.coordinates = meetingsWithCoordinates;

    if (!state.input.latitude || !state.input.longitude) {
      if (state.input.search && state.input.mode === 'location') {
        //make mapbox API request https://docs.mapbox.com/api/search/
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${
            state.input.search
          }.json?${new URLSearchParams({
            access_token: settings.map.key,
            autocomplete: false,
            language: settings.language,
          })}`
        )
          .then(result => result.json())
          .then(result => {
            if (result.features && result.features.length) {
              //re-render page with new params
              calculateDistances(
                result.features[0].center[1],
                result.features[0].center[0],
                filteredSlugs,
                state,
                setState
              );
            } else {
              //show error
            }
          });
      } else if (state.input.mode == 'me') {
        navigator.geolocation.getCurrentPosition(
          position => {
            calculateDistances(
              position.coords.latitude,
              position.coords.longitude,
              filteredSlugs,
              state,
              setState
            );
          },
          error => {
            console.warn(`getCurrentPosition() error: ${error.message}`);
          },
          { timeout: 5000 }
        );
      }
    }
  }

  //do the filtering, if necessary
  const filteredSlugs = Object.keys(matchGroups).length
    ? getCommonElements(Object.values(matchGroups)) //get intersection of slug arrays
    : Object.keys(state.meetings); //get everything

  //sort slugs
  filteredSlugs.sort((a, b) => {
    const meetingA = state.meetings[a];
    const meetingB = state.meetings[b];

    //sort appointment meetings to the end
    if (meetingA.minutes_week && !meetingB.minutes_week) return -1;
    if (!meetingA.minutes_week && meetingB.minutes_week) return 1;

    if (!state.input.weekday.length) {
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
      if (!meetingA.location) return -1;
      if (!meetingB.location) return 1;
      return meetingA.location.localeCompare(meetingB.location);
    }

    //then by meeting name
    if (meetingA.name !== meetingB.name) {
      if (!meetingA.name) return -1;
      if (!meetingB.name) return 1;
      return meetingA.name.localeCompare(meetingB.location);
    }

    return 0;
  });

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
  return indexes?.reduce(getFilterByKey(key), null);
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
  //meetings is a lookup
  const meetings = {};

  //indexes start as objects, will be converted to arrays
  const indexes = {
    region: {},
    time: {},
    type: {},
    weekday: {},
  };

  //filter out unused meetings properties for a leaner memory footprint
  const meeting_properties = [
    'conference_phone',
    'conference_phone_notes',
    'conference_provider',
    'conference_url',
    'conference_url_notes',
    'district',
    'end',
    'feedback_url',
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
    'updated',
    'venmo',
  ];

  //define lookups we'll need later
  const lookup_weekday = settings.weekdays.map(weekday => strings[weekday]);
  const lookup_type_codes = Object.keys(strings.types);
  const lookup_type_values = Object.values(strings.types);

  //for diff
  const now = moment();

  //check for meetings with multiple days and create an individual meeting for each
  data = flattenDays(data);

  //loop through each entry
  data.forEach((meeting, index) => {
    //slug is required
    if (!meeting.slug) {
      warn(index, 'no slug');
      return;
    }

    //meeting name is required
    if (!meeting.name) {
      meeting.name = strings.unnamed_meeting;
    }

    //conference provider
    meeting.conference_provider = meeting.conference_url
      ? formatConferenceProvider(meeting.conference_url)
      : null;

    if (meeting.conference_url && !meeting.conference_provider) {
      warn(index, `invalid conference_url ${meeting.conference_url}`);
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
        warn(index, `no formatted_address or city`);
      }
    }

    //check for types
    if (!meeting.types) meeting.types = [];

    //add online and in-person metattypes
    const isOnline = meeting.conference_url || meeting.conference_phone;
    if (isOnline) meeting.types.push('online');

    const isInPerson =
      !meeting.types.includes('TC') &&
      !meeting.types.includes(strings.types.TC) &&
      (meeting.formatted_address.match(/,/g) || []).length > 2;
    if (isInPerson) meeting.types.push('in-person');

    //if neither online nor in person, skip it
    if (!isOnline && !isInPerson) {
      warn(index, `${meeting.name} is neither online or in person, skipping`);
      return;
    }

    //last chance to exit. now we're going to populate some indexes with the meeting slug

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
      } else if (settings.show.cityAsRegionFallback && meeting.city) {
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
    } else if (lookup_weekday.includes(meeting.day)) {
      meeting.day = lookup_weekday.indexOf(meeting.day).toString();
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
      if (!indexes.weekday.hasOwnProperty(meeting.day)) {
        indexes.weekday[meeting.day] = {
          key: meeting.day,
          name: strings[settings.weekdays[meeting.day]],
          slugs: [],
        };
      }
      indexes.weekday[meeting.day].slugs.push(meeting.slug);

      //make start/end moments
      meeting.start = moment
        .tz(
          `${meeting.day} ${meeting.time}`,
          'd hh:mm',
          meeting.timezone || settings.timezone
        )
        .tz(settings.timezone);

      if (meeting.end_time) {
        meeting.end = moment
          .tz(
            `${meeting.day} ${meeting.end_time}`,
            'd hh:mm',
            meeting.timezone || settings.timezone
          )
          .tz(settings.timezone);
      }

      //time differences for sorting
      meeting.minutes_now = meeting.start.diff(now, 'minutes');
      const minutes_midnight =
        meeting.start.get('hour') * 60 + meeting.start.get('minutes');
      meeting.minutes_week = minutes_midnight + meeting.day * 1440;

      //if time is earlier than X minutes ago, increment diff by a week
      if (meeting.minutes_now < settings.now_offset) {
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

    //clean up and sort types
    meeting.types = Array.isArray(meeting.types)
      ? meeting.types
          .map(type => type.trim())
          .filter(
            type =>
              lookup_type_codes.includes(type) ||
              lookup_type_values.includes(type)
          )
          .map(type =>
            lookup_type_codes.includes(type) ? strings.types[type] : type
          )
      : [];

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

    //console.log(meeting.types);

    //7th tradition validation
    if (meeting.venmo) {
      if (!meeting.venmo.startsWith('@')) {
        warn(index, `${meeting.venmo} is not a valid venmo`);
        meeting.venmo = null;
      }
    }

    if (meeting.square) {
      if (!meeting.square.startsWith('$')) {
        warn(index, `${meeting.square} is not a valid square`);
        meeting.square = null;
      }
    }

    if (meeting.paypal) {
      if (
        !meeting.paypal.startsWith('https://www.paypal.me') &&
        !meeting.paypal.startsWith('https://paypal.me')
      ) {
        warn(index, `${meeting.paypal} is not a valid paypal.me URL`);
        meeting.paypal = null;
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

  //convert weekday to array and sort by ordinal
  indexes.weekday = flattenAndSortIndexes(indexes.weekday, (a, b) => {
    return parseInt(a.key) - parseInt(b.key);
  });
  capabilities.weekday = !!indexes.weekday.length;

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
  if (capabilities.coordinates && !settings.modes.includes('location')) {
    //todo implement geocoding
    settings.modes.push('location');
    if (
      navigator.geolocation &&
      (window.location.protocol == 'https:' ||
        window.location.hostname == 'localhost')
    ) {
      capabilities.geolocation = true;
      settings.modes.push('me');
    }
    if (settings.map.key) {
      capabilities.map = true;
    }
  }

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
  if (settings.search == 'quoted') {
    // Search type quoted ("Google Style"): parse out any quoted strings
    search_string = search_string.toLowerCase();
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
  } else if (settings.search == 'or') {
    // Search type "or": replace capitalized OR with a pipe.
    return search_string.replaceAll(' OR ', '|').toLowerCase();
  } else {
    // Search type "default": just return the string as-is
    return search_string.toLowerCase();
  }
}

//translates Google Sheet JSON into Meeting Guide format
export function translateGoogleSheet(data) {
  //see Cateret County example on https://github.com/meeting-guide/spreadsheet
  //https://docs.google.com/spreadsheets/d/e/2PACX-1vQJ5OsDCKSDEvWvqM_Z6tmXe4N-VYEnEAfvU5PX5QXZjHVbnrX-aeiyhWnZp0wpWtOmWjO4L5GJtfFu/pubhtml
  //JSON: https://spreadsheets.google.com/feeds/list/1prbiXHu9JS5eREkYgBQkxlkJELRHqrKz6-_PLGPWIWk/1/public/values?alt=json

  const meetings = [];

  for (let i = 0; i < data.feed.entry.length; i++) {
    //creates a meeting object containing a property corresponding to each column header of the Google Sheet
    const meeting = {};
    const meetingKeys = Object.keys(data.feed.entry[i]);
    for (let j = 0; j < meetingKeys.length; j++) {
      if (meetingKeys[j].startsWith('gsx$')) {
        meeting[meetingKeys[j].substr(4)] =
          data.feed.entry[i][meetingKeys[j]]['$t'];
      }
    }

    // Google Spreadsheets do not allow underscores
    const terms_to_transform = [
      'conference_phone',
      'conference_phone_notes',
      'conference_provider',
      'conference_url',
      'conference_url_notes',
      'feedback_url',
      'formatted_address',
      'group_notes',
      'location_notes',
      'minutes_now',
      'minutes_week',
    ];
    let underscore_term = '';

    for (underscore_term of terms_to_transform) {
      let google_term = underscore_term.replace('_', '');
      if (meeting.hasOwnProperty(google_term)) {
        meeting[underscore_term] = meeting[google_term];
        delete meeting[google_term];
      }
    }

    //use Google-generated slug if none was provided
    if (!meeting.slug) {
      let slug = data.feed.entry[i].id['$t'];
      meeting.slug = slug.substring(slug.lastIndexOf('/') + 1);
    }

    //convert time to HH:MM
    meeting.time = parseTime(meeting.time);

    //array-ify types
    meeting.types = meeting.types
      ? meeting.types.split(',').map(type => type.trim())
      : [];

    meetings.push(meeting);
  }

  return meetings;
}

//translate result from nocodeapi.com (used by airtable instances)
export function translateNoCodeAPI(data) {
  if (!data.records) return data;
  const meetings = [];
  data.records.forEach(record => {
    //fix time format
    record.fields.time = parseTime(record.fields.time);

    //array-ify types
    record.fields.types = record.fields.types
      ? record.fields.types.split(',').map(type => type.trim())
      : [];

    meetings.push(record.fields);
  });
  return meetings;
}

function warn(index, content) {
  if (!settings.show.warnings) return;
  console.warn(`#${index + 1}: ${content}`);
}

// Set the document title; originally was going ot set OpenGraph tags but
// they will have no effect since they are rendered after the main page.
export function setTitle(title) {
  document.title = title;
}
