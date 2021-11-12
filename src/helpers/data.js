import moment from 'moment-timezone';

import { distance } from './distance';
import { formatAddress, formatConferenceProvider, formatSlug } from './format';
import { settings, strings } from './settings';

//all the fields in the meeting guide spec
const spec_properties = [
  'address',
  'approximate',
  'city',
  'conference_phone',
  'conference_phone_notes',
  'conference_provider',
  'conference_url',
  'conference_url_notes',
  'contact_1_email',
  'contact_1_name',
  'contact_1_phone',
  'contact_2_email',
  'contact_2_name',
  'contact_2_phone',
  'contact_3_email',
  'contact_3_name',
  'contact_3_phone',
  'country',
  'day',
  'district',
  'edit_url',
  'email',
  'end_time',
  'feedback_url',
  'formatted_address',
  'group',
  'group_notes',
  'image',
  'latitude',
  'location',
  'location_notes',
  'longitude',
  'minutes_now',
  'minutes_week',
  'name',
  'notes',
  'paypal',
  'phone',
  'postal_code',
  'region',
  'regions',
  'search',
  'slug',
  'square',
  'state',
  'sub_region',
  'time',
  'timezone',
  'types',
  'updated',
  'venmo',
  'website',
];

//calculate distances
function calculateDistances(
  latitude,
  longitude,
  filteredSlugs,
  state,
  setState
) {
  //build new index and meetings array
  const distances = {};

  //loop through and update or clear distances, and rebuild index
  filteredSlugs.forEach(slug => {
    state.meetings[slug] = {
      ...state.meetings[slug],
      distance: distance(
        { latitude: latitude, longitude: longitude },
        state.meetings[slug]
      ),
    };

    [1, 2, 5, 10, 25].forEach(distance => {
      if (state.meetings[slug].distance <= distance) {
        if (!distances.hasOwnProperty(distance)) {
          distances[distance] = {
            key: distance.toString(),
            name: `${distance} ${settings.distance_unit}`,
            slugs: [],
          };
        }
        distances[distance].slugs.push(slug);
      }
    });
  });

  //flatten index and set capability
  const distanceIndex = flattenAndSortIndexes(
    distances,
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

//confirm supplied timezone is valid
function checkTimezone(timezone, fallback) {
  return !!moment.tz.zone(timezone) ? timezone : fallback;
}

//run filters on meetings; this is run at every render
export function filterMeetingData(state, setState, mapbox) {
  const matchGroups = {};

  //filter by distance, region, time, type, and weekday
  settings.filters.forEach(filter => {
    if (state.input[filter]?.length && state.capabilities[filter]) {
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
    if (!!state.input.search) {
      const orTerms = processSearchTerms(state.input.search);
      const matches = Object.keys(state.meetings).filter(slug =>
        orTerms.some(andTerm =>
          andTerm.every(term => state.meetings[slug].search.search(term) !== -1)
        )
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
            access_token: mapbox,
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
      } else if (state.input.mode === 'me') {
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
            console.warn('getCurrentPosition() error', error);
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

  //custom sort function
  const sortMeetings = (a, b) => {
    const meetingA = state.meetings[a];
    const meetingB = state.meetings[b];

    //sort appointment meetings to the end
    if (meetingA.time && !meetingB.time) return -1;
    if (!meetingA.time && meetingB.time) return 1;

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
  };

  //sort slugs
  filteredSlugs.sort(sortMeetings);

  //find in-progress meetings
  const now = moment();
  const inProgress = filteredSlugs
    .filter(
      slug =>
        state.meetings[slug].start?.diff(now, 'minutes') <
          settings.now_offset &&
        state.meetings[slug].end?.isAfter() &&
        !state.meetings[slug].types.includes('inactive')
    )
    .sort(sortMeetings);

  return [filteredSlugs, inProgress];
}

//find an index by key
export function getIndexByKey(indexes, key) {
  for (const index of indexes) {
    if (index.key === key) return index;
    if (index.children) {
      const result = getIndexByKey(index.children, key);
      if (result) return result;
    }
  }
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
  const meetings_to_add = [];
  const indexes_to_remove = [];

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
  return arrays.shift().filter(v => arrays.every(a => a.indexOf(v) !== -1));
}

//get meetings, indexes, and capabilities from session storage, keyed by JSON URL
export function getCache(json, version) {
  if (!settings.cache) return;
  const cache = JSON.parse(
    window.sessionStorage.getItem(getCacheName(json, version))
  );
  if (!cache) return null;
  const keys = Object.keys(cache.meetings);
  keys.forEach(key => {
    if (typeof cache.meetings[key].start === 'string') {
      cache.meetings[key].start = moment(cache.meetings[key].start);
    }
    if (typeof cache.meetings[key].end === 'string') {
      cache.meetings[key].end = moment(cache.meetings[key].end);
    }
  });
  return cache;
}

//version the cache name in case computations have changed since the last version
function getCacheName(json, version) {
  return `${json}${json.includes('?') ? '&' : '?'}v=${version}`;
}

//set up meeting data; this is only run once when the app loads
export function loadMeetingData(data, capabilities, timezone) {
  //meetings is a lookup
  const meetings = {};

  //indexes start as objects, will be converted to arrays
  const indexes = {
    region: {},
    time: {},
    type: {},
    weekday: {},
  };

  //confirm timezone before normalizing, use Eastern USA time as default
  timezone = checkTimezone(timezone, 'America/New_York');

  //define lookups we'll need later
  const lookup_weekday = settings.weekdays.map(weekday => strings[weekday]);
  const lookup_type_codes = Object.keys(strings.types);
  const lookup_type_values = Object.values(strings.types);
  const decode_types = {};
  lookup_type_codes.forEach(key => {
    decode_types[strings.types[key]] = key;
  });

  //check for meetings with multiple days and create an individual meeting for each
  data = flattenDays(data);

  //loop through each entry
  data.forEach((meeting, index) => {
    //strip out extra fields not in the spec
    Object.keys(meeting)
      .filter(key => !spec_properties.includes(key))
      .forEach(key => {
        delete meeting[key];
      });

    //default edit_url
    if (!meeting.edit_url) {
      meeting.edit_url = `row ${index}`;
    }

    //slug is required
    if (!meeting.slug) {
      console.warn(meeting.edit_url, 'no slug');
      return;
    }

    //slug must be unique
    if (meeting.slug in meetings) {
      console.warn(meeting.edit_url, `${meeting.slug} is a duplicate slug`);
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
      console.warn(
        meeting.edit_url,
        `unknown conference_url: ${meeting.conference_url}`
      );
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
      }
    }

    //used in table
    if (!meeting.address) {
      meeting.address = formatAddress(meeting.formatted_address);
    }

    //check if approximate
    meeting.approximate = meeting.approximate
      ? meeting.approximate.toLowerCase() === 'yes'
      : meeting.address
      ? false
      : true;

    //if approximate is specified, it overrules formatAddress
    if (meeting.approximate) meeting.address = null;

    //check for types
    if (!meeting.types) {
      meeting.types = [];
    } else if (typeof meeting.types === 'string') {
      meeting.types = meeting.types.split(',').map(type => type.trim());
    }

    //add online and in-person metattypes
    meeting.isOnline =
      !!meeting.conference_provider || !!meeting.conference_phone;
    if (meeting.isOnline) meeting.types.push('online');

    meeting.isTempClosed =
      meeting.types.includes('TC') || meeting.types.includes(strings.types.TC);

    meeting.isInPerson = !meeting.isTempClosed && !meeting.approximate;

    meeting.isActive = meeting.isOnline || meeting.isInPerson;

    if (meeting.isInPerson) {
      meeting.types.push('in-person');
    }

    if (meeting.isActive) {
      meeting.types.push('active');
    } else {
      capabilities.inactive = true;
      meeting.types.push('inactive');
    }

    //if meeting is not in person, remove types that only apply to in-person meetings
    if (!meeting.isInPerson) {
      meeting.types = meeting.types.filter(
        type => !settings.in_person_types.includes(type)
      );
    }

    //check location/group capability
    if (
      !capabilities.location &&
      ((meeting.isOnline && meeting.group) ||
        (meeting.isInPerson && meeting.location))
    ) {
      capabilities.location = true;
    }

    //last chance to exit. now we're going to populate some indexes with the meeting slug

    //using array for regions now, but legacy region, sub_region, etc still supported
    //todo remove if/when tsml implements regions array format
    if (!meeting.regions || !Array.isArray(meeting.regions)) {
      meeting.regions = [];
      if (meeting.region) {
        meeting.regions.push(meeting.region);
        if (meeting.sub_region) {
          meeting.regions.push(meeting.sub_region);
          if (meeting.sub_sub_region) {
            meeting.regions.push(meeting.sub_sub_region);
          }
        }
      }
    }

    //build region index
    if (meeting.isActive && !!meeting.regions.length) {
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
      if (meeting.isInPerson) {
        capabilities.coordinates = true;
        meeting.latitude = parseFloat(meeting.latitude);
        meeting.longitude = parseFloat(meeting.longitude);
      } else {
        meeting.latitude = null;
        meeting.longitude = null;
      }
    }

    //handle day and time
    if (meeting.day && meeting.time) {
      if (meeting.isActive) {
        //build day index
        if (!indexes.weekday.hasOwnProperty(meeting.day)) {
          indexes.weekday[meeting.day] = {
            key: meeting.day,
            name: strings[settings.weekdays[meeting.day]],
            slugs: [],
          };
        }
        indexes.weekday[meeting.day].slugs.push(meeting.slug);
      }

      //timezone
      meeting.timezone = checkTimezone(meeting.timezone, timezone);

      //make start/end moments
      meeting.start = moment
        .tz(`${meeting.day} ${meeting.time}`, 'd hh:mm', meeting.timezone)
        .tz(timezone);

      if (meeting.end_time) {
        meeting.end = moment
          .tz(`${meeting.day} ${meeting.end_time}`, 'd hh:mm', meeting.timezone)
          .tz(timezone);
      }

      //build time index (can be multiple)
      if (meeting.isActive) {
        //time differences for sorting
        const minutes_midnight =
          meeting.start.get('hour') * 60 + meeting.start.get('minutes');
        meeting.minutes_week = minutes_midnight + meeting.day * 1440;

        const times = [];
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
    }

    //clean up and sort types
    meeting.types = Array.isArray(meeting.types)
      ? meeting.types
          .map(type =>
            typeof type === 'number'
              ? type.toString()
              : typeof type === 'string'
              ? type.trim()
              : null
          )
          .filter(
            type =>
              lookup_type_codes.includes(type) ||
              lookup_type_values.includes(type)
          )
          .map(type =>
            lookup_type_values.includes(type) ? decode_types[type] : type
          )
      : [];

    //build type index (can be multiple) -- if inactive, only index the 'inactive' type
    const typesToIndex = meeting.isActive ? meeting.types : ['inactive'];
    typesToIndex.forEach(type => {
      if (!indexes.type.hasOwnProperty(type)) {
        indexes.type[type] = {
          key: formatSlug(strings.types[type]),
          name: strings.types[type],
          slugs: [],
        };
      }
      indexes.type[type].slugs.push(meeting.slug);
    });

    //optional updated date
    meeting.updated = meeting.updated
      ? moment.tz(new Date(meeting.updated), 'UTC').tz(timezone).format('ll')
      : null;

    //7th tradition validation
    if (meeting.venmo) {
      if (!meeting.venmo.startsWith('@')) {
        console.warn(meeting.edit_url, `invalid venmo: ${meeting.venmo}`);
        meeting.venmo = null;
      }
    }

    if (meeting.square) {
      if (!meeting.square.startsWith('$')) {
        console.warn(meeting.edit_url, `invalid square: ${meeting.square}`);
        meeting.square = null;
      }
    }

    if (meeting.paypal) {
      if (
        !meeting.paypal.startsWith('https://www.paypal.me') &&
        !meeting.paypal.startsWith('https://paypal.me')
      ) {
        console.warn(meeting.edit_url, `invalid paypal: ${meeting.paypal}`);
        meeting.paypal = null;
      }
    }

    //build search string
    meeting.search = [
      meeting.district,
      meeting.formatted_address,
      meeting.group,
      meeting.group_notes,
      meeting.location,
      meeting.location_notes,
      meeting.name,
      meeting.notes,
      meeting.regions,
    ]
      .flat()
      .filter(e => e)
      .join('\t')
      .toLowerCase();

    meetings[meeting.slug] = meeting;
  });

  //convert region to array, sort by name
  indexes.region = flattenAndSortIndexes(indexes.region, (a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
  );

  //convert weekday to array and sort by ordinal
  indexes.weekday = flattenAndSortIndexes(
    indexes.weekday,
    (a, b) => parseInt(a.key) - parseInt(b.key)
  );

  //convert time to array and sort by ordinal
  indexes.time = flattenAndSortIndexes(
    indexes.time,
    (a, b) => settings.times.indexOf(a.key) - settings.times.indexOf(b.key)
  );

  //convert type to array and sort by name
  indexes.type = flattenAndSortIndexes(indexes.type, (a, b) =>
    a.name > b.name ? 1 : b.name > a.name ? -1 : 0
  );

  //determine capabilities (filter out options that apply to every meeting)
  const meetingsCount = Object.keys(meetings).length;
  ['region', 'weekday', 'time', 'type'].forEach(indexKey => {
    capabilities[indexKey] = !!indexes[indexKey].filter(
      index => index.slugs.length !== meetingsCount
    ).length;
  });

  //remove active type if no inactive meetings
  if (!capabilities.inactive) {
    //...from the indexes
    indexes.type = indexes.type.filter(type => type.key !== 'active');

    //...from each meeting
    Object.keys(meetings).forEach(slug => {
      meetings[slug] = {
        ...meetings[slug],
        types: meetings[slug].types.filter(
          type => type !== strings.types.active
        ),
      };
    });
  }

  //determine search modes
  if (capabilities.coordinates) {
    if (
      navigator.geolocation &&
      (window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost')
    ) {
      capabilities.geolocation = true;
    }
  }

  return [meetings, indexes, capabilities];
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

//converts search input string into nested arrays of search terms
//"term1 OR term2 term3" => ['term1', ['term2', 'term3']]
function processSearchTerms(input) {
  return input
    .replaceAll(' OR ', '|')
    .toLowerCase()
    .split('|')
    .map(phrase => phrase.split('"'))
    .map(phrase => [
      ...new Set(
        phrase
          .filter((_e, index) => index % 2)
          .concat(
            phrase
              .filter((_e, index) => !(index % 2))
              .join(' ')
              .split(' ')
          )
          .filter(e => e)
      ),
    ])
    .filter(e => e.length);
}

//set meetings, indexes, and capabilities to session storage, keyed by JSON URL
export function setCache(json, version, meetings, indexes, capabilities) {
  if (!settings.cache) return;
  window.sessionStorage.setItem(
    getCacheName(json, version),
    JSON.stringify({ meetings, indexes, capabilities })
  );
}

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

//translates Google Sheet JSON into Meeting Guide format (example demo.html)
export function translateGoogleSheet(data, json) {
  const sheetId = json.split('/')[5];

  const meetings = [];

  const headers = data.values
    .shift()
    .map(header => formatSlug(header).replaceAll('-', '_'))
    .map(header => (header === 'id' ? 'slug' : header));

  data.values.forEach((row, index) => {
    //skip empty rows
    if (!row.filter(e => e).length) return;

    const meeting = {};

    //fill values
    headers.forEach((header, index) => {
      meeting[header] = row[index];
    });

    //convert time to HH:MM
    if (meeting.time) {
      meeting.time = moment(meeting.time, 'h:mm a').format('HH:mm');
    }
    if (meeting.end_time) {
      meeting.end_time = moment(meeting.end_time, 'h:mm a').format('HH:mm');
    }

    //edit url link
    meeting.edit_url = `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=${
      index + 2
    }:${index + 2}+`;

    meetings.push(meeting);
  });

  return meetings;
}

//translate result from nocodeapi.com (used by airtable instances)
export function translateNoCodeAPI(data) {
  return data.records
    ? data.records.map(record => ({
        ...record.fields,
        time: moment(record.fields.time, 'h:mm a').format('HH:mm'),
        types: record.fields.types
          ? record.fields.types.split(',').map(type => type.trim())
          : [],
      }))
    : data;
}
