import { settings, strings } from '../settings';
import Slugify from './slugify';
import { formatTime, parseTime } from './time';

//run filters on meetings
export function filterMeetingData(state) {
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

  //keyword search
  if (state.input.search.length && state.input.mode === 'search') {
    filterFound = true;
    let needle = state.input.search.toLowerCase();
    let matches = state.meetings.filter(function (meeting) {
      return meeting.search.search(needle) !== -1;
    });
    filteredSlugs.push(
      [].concat.apply([], matches.map(meeting => meeting.slug))
    );
  }

  //do the filtering, if necessary
  filteredSlugs = filterFound
    ? getCommonElements(filteredSlugs) //get intersection of slug arrays
    : state.meetings.map(meeting => meeting.slug); //get everything

  return filteredSlugs;
}

//get common matches between arrays (for meeting filtering)
function getCommonElements(arrays) {
  var currentValues = {};
  var commonValues = {};
  if (!arrays.length) return [];
  for (var i = arrays[0].length - 1; i >= 0; i--) {
    //Iterating backwards for efficiency
    currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
  }
  for (var i = arrays.length - 1; i > 0; i--) {
    var currentArray = arrays[i];
    for (var j = currentArray.length - 1; j >= 0; j--) {
      if (currentArray[j] in currentValues) {
        commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
      }
    }
    currentValues = commonValues;
    commonValues = {};
  }
  return Object.keys(currentValues);
}

export function loadMeetingData(meetings, capabilities) {
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

  //define lookups we'll need later
  const lookup_day = settings.days.map(day => strings[day]);
  const lookup_type_codes = Object.keys(strings.types);
  const lookup_type_values = Object.values(strings.types);

  //check for any meetings with arrays of days and creates an individual meeting for each day in array
  let meetings_to_add = [];
  let indexes_to_remove = [];

  for (let i = 0; i < meetings.length; i++) {
    //for readability
    let meeting = meetings[i];

    if (meeting.day.constructor === Array) {
      indexes_to_remove.push(i);
      for (let i = 0; i < meeting.day.length; i++) {
        let temp_meeting = Object.assign({}, meeting);
        temp_meeting.day = meeting.day[i];
        temp_meeting.slug = meeting.slug + '-' + temp_meeting.day;
        meetings_to_add.push(temp_meeting);
      }
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
      meeting.formatted_time = formatTime(meeting.time);
      meeting.formatted_end_time = formatTime(meeting.end_time);
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
    if (meeting.latitude && meeting.longitude) {
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

    //define any missing values
    for (let i = 0; i < meeting_properties.length; i++) {
      if (!meeting.hasOwnProperty(meeting_properties[i])) {
        meeting[meeting_properties[i]] = '';
      }
    }
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

  //near me mode enabled on https or local development
  if (capabilities.coordinates) {
    settings.modes.push('location');
    if (window.location.protocol == 'https:' || window.location.hostname == 'localhost') {
      capabilities.geolocation = true;
      settings.modes.push('me');
    }
    if (settings.keys.mapbox) {
      capabilities.map = true;
    }
  }

  //sort meetings by day -> time -> location -> name
  //(todo consider extracting for dynamic sorting)
  meetings.sort((a, b) => {
    if (a.day !== b.day) {
      if (a.day === null) return -1;
      if (b.day === null) return 1;
      return a.day - b.day;
    }
    if (a.time !== b.time) {
      if (a.time === null) return -1;
      if (b.time === null) return 1;
      return a.time.localeCompare(b.time);
    }
    if (a.location !== b.location) {
      if (a.location === null) return -1;
      if (b.location === null) return 1;
      return a.location.localeCompare(b.location);
    }
    if (a.name !== b.name) {
      if (a.name === null) return -1;
      if (b.name === null) return 1;
      return a.name.localeCompare(b.location);
    }
    return 0;
  });

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

    //use Google-generated slug if none was provided
    if (!meeting.slug) {
      let slug = data.feed.entry[i].id['$t'];
      meeting.slug = slug.substring(slug.lastIndexOf('/') + 1);
    }

    //convert time to HH:MM
    meeting.time = parseTime(meeting.time);

    //array-ify types
    meeting.types = meeting.types.split(',');

    meetings.push(meeting);
  }

  return meetings;
}

// Calculate the distance as the crow flies between two geometric points
// Adapted from: https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2) {
  if ((lat1 == lat2) && (lon1 == lon2)) {
    return 0;
  } else {
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const radtheta = Math.PI * (lon1 - lon2) / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 12436.2 / Math.PI;  // 12436.2 = 180 * 60 * 1.1515

    // If using kilometers, do an additional multiplication
    if (settings.distance_unit=="km") { dist = dist * 1.609344 }

    return dist;
  }
}

// Callback function invoked when user allows latitude/longitude to be probed
export default function setUserLatLng(position) {
  let user_latitude = position.coords.latitude;
  let user_longitude = position.coords.longitude;
  let meetings = [];

  for (let index = 0; index < this.props.state.meetings.length; index++) {
    meetings[index] = this.props.state.meetings[index];
    meetings[index].distance = distance(
      user_latitude,
      user_longitude,
      this.props.state.meetings[index].latitude,
      this.props.state.meetings[index].longitude,
    ).toFixed(2).toString() + ' ' + settings.distance_unit;
  }

  // If it isn't already there, add the "distance" column
  if (!settings.defaults.columns.includes("distance")) {
    settings.defaults.columns.push("distance");
  }

  // Re-render including meeting distances
  this.props.setAppState({
    user_latitude: user_latitude,
    user_longitude: user_longitude,
    meetings: meetings,
    geolocation: true,
  });
}
