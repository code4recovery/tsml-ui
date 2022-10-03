import { DateTime } from 'luxon';

import { formatAddress, formatConferenceProvider, formatSlug } from '../format';
import { settings, strings } from '../settings';
import { flattenAndSortIndexes } from './flatten-and-sort-indexes';

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
    'coordinates',
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

  const lookup_type_codes = Object.keys(strings.types).filter(
    type => type !== 'ONL' //duplicate of "online"
  );
  const lookup_type_values = Object.values(strings.types);
  const decode_types = {};
  lookup_type_codes.forEach(key => {
    decode_types[strings.types[key]] = key;
  });

  //check for meetings with multiple days and create an individual meeting for each
  data = flattenDays(data);

  //loop through each entry
  data.forEach(meeting => {
    //strip out extra fields not in the spec
    Object.keys(meeting)
      .filter(key => !spec_properties.includes(key))
      .forEach(key => delete meeting[key]);

    //slug is required
    if (!meeting.slug) {
      console.warn(`TSML no slug: ${meeting.edit_url}`);
      return;
    }

    //slug must be unique
    if (meeting.slug in meetings) {
      console.warn(
        `TSML UI ${meeting.slug} duplicate slug: ${meeting.edit_url}`
      );
      return;
    }

    //meeting name is required
    if (!meeting.name) {
      meeting.name = strings.unnamed_meeting;
    }

    //conference provider
    meeting.conference_provider = meeting.conference_url
      ? formatConferenceProvider(meeting.conference_url)
      : undefined;

    if (meeting.conference_url && !meeting.conference_provider) {
      console.warn(
        `TSML UI unknown conference_url ${meeting.conference_url}: ${meeting.edit_url}`
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
    if (meeting.coordinates) {
      const coords = meeting.coordinates.split(',');
      meeting.approximate = coords.length !== 2;
      meeting.latitude = meeting.approximate ? null : coords[0];
      meeting.longitude = meeting.approximate ? null : coords[1];
    } else {
      meeting.approximate = meeting.approximate
        ? meeting.approximate.toLowerCase() === 'yes'
        : !meeting.address;
    }

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

    //format day
    if (Number.isInteger(meeting.day)) {
      //convert day to string if integer
      meeting.day = meeting.day.toString();
    } else if (Array.isArray(meeting.day)) {
      //guess we don't need to do anything?
    } else if (meeting.day) {
      meeting.day = meeting.day.toLowerCase();
      if (settings.weekdays.includes(meeting.day)) {
        meeting.day = settings.weekdays.indexOf(meeting.day).toString();
      }
    }

    //handle day and time
    if (meeting.day && meeting.time) {
      //luxon uses iso day
      const weekday = meeting.day === '0' ? '7' : meeting.day;
      const [hour, minute] = meeting.time.split(':').map(num => parseInt(num));

      //timezone
      if (!meeting.timezone) {
        if (timezone) {
          meeting.timezone = timezone;
        } else {
          //either tz setting or meeting tz is required
          console.warn(
            `TSML UI ${meeting.slug} has no timezone: ${meeting.edit_url}`
          );
          return;
        }
      }

      //make start/end datetimes
      meeting.start = DateTime.fromObject(
        { weekday, hour, minute },
        { zone: meeting.timezone }
      );

      //check valid start time
      if (!meeting.start.isValid) {
        console.warn(
          `TSML UI invalid start time (${meeting.start.invalid.explanation}): ${meeting.edit_url}`
        );
        return;
      }

      if (meeting.end_time) {
        const endTimeParts = meeting.end_time
          .split(':')
          .map(num => parseInt(num));
        meeting.end = DateTime.fromObject(
          { weekday, hour: endTimeParts[0], minute: endTimeParts[1] },
          { zone: meeting.timezone }
        );
      } else {
        meeting.end = meeting.start.plus( {minutes: settings.defaults.duration})
      }

      //check valid end time
      if (!meeting.end.isValid) {
        console.warn(
          `TSML UI invalid end time (${meeting.end.invalid.explanation}): ${meeting.edit_url}`
        );
        return;
      }

      const duration = meeting.end
        .diff(meeting.start, 'minutes')
        .toObject().minutes;
      if (duration > 120) {
        console.warn(
          `TSML UI ${meeting.slug} is unusually long (${duration} mins): ${meeting.edit_url}`
        );
      }


      //normalize timezones
      if (!timezone) {
        meeting.start = meeting.start.setZone('local');
        if (meeting.end) {
          meeting.end = meeting.end.setZone('local');
        }
      }

      //day & time indexes
      if (meeting.isActive) {
        //day index
        if (!indexes.weekday.hasOwnProperty(meeting.day)) {
          indexes.weekday[meeting.day] = {
            key: meeting.day,
            name:
              strings[settings.weekdays[meeting.day]] ?? strings.appointment,
            slugs: [],
          };
        }
        indexes.weekday[meeting.day].slugs.push(meeting.slug);

        //time differences for sorting
        const minutes_midnight = meeting.start.hour * 60 + meeting.start.minute;
        meeting.minutes_week = minutes_midnight + meeting.day * 1440;

        //time index (can be multiple)
        const times = [];
        if (minutes_midnight >= 240 && minutes_midnight < 720) {
          times.push(0); //morning (4am–11:59pm)
        }
        if (minutes_midnight >= 660 && minutes_midnight < 1020) {
          times.push(1); //midday (11am–4:59pm)
        }
        if (minutes_midnight >= 960 && minutes_midnight < 1260) {
          times.push(2); //evening (4pm–8:59pm)
        }
        if (minutes_midnight >= 1200 || minutes_midnight < 300) {
          times.push(3); //night (8pm–4:59am)
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
      } else if (meeting.city) {
        meeting.regions.push(meeting.city);
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
    if (meeting.updated) {
      const updated = DateTime.fromISO(meeting.updated).setZone(timezone);
      meeting.updated = updated.isValid ? updated.toLocaleString() : undefined;
    }

    //7th tradition validation
    if (meeting.venmo) {
      if (!meeting.venmo.startsWith('@')) {
        console.warn(
          `TSML UI invalid venmo ${meeting.venmo}: ${meeting.edit_url}`
        );
        meeting.venmo = null;
      }
    }

    if (meeting.square) {
      if (!meeting.square.startsWith('$')) {
        console.warn(
          `TSML UI invalid square ${meeting.square}: ${meeting.edit_url}`
        );
        meeting.square = null;
      }
    }

    if (meeting.paypal) {
      if (
        !meeting.paypal.startsWith('https://www.paypal.me') &&
        !meeting.paypal.startsWith('https://paypal.me')
      ) {
        console.warn(
          `TSML UI invalid paypal ${meeting.paypal}: ${meeting.edit_url}`
        );
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
  capabilities.geolocation =
    navigator.geolocation &&
    capabilities.coordinates &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost');

  return [meetings, indexes, capabilities];
}

//look for data with multiple days and make them all single
export function flattenDays(data) {
  const meetings_to_add = [];
  const indexes_to_remove = [];

  data.forEach((meeting, index) => {
    if (Array.isArray(meeting.day)) {
      indexes_to_remove.push(index);
      meeting.day.forEach(day => {
        meetings_to_add.push({
          ...meeting,
          day: day,
          slug: meeting.slug + '-' + day,
        });
      });
    }
  });

  indexes_to_remove.forEach(index => {
    data.splice(index, 1);
  });

  return data.concat(meetings_to_add);
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
