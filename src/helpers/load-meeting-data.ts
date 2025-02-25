import { DateTime, WeekdayNumbers } from 'luxon';

import { flattenAndSortIndexes } from './flatten-and-sort-indexes';
import { formatAddress } from './format-address';
import { formatConferenceProvider } from './format-conference-provider';
import { formatFeedbackEmail } from './format-feedback-email';
import { formatSlug } from './format-slug';

import type { JSONData, JSONDataFlat, State, Meeting, Index } from '../types';

// set up meeting data; this is only run once when the app loads
export function loadMeetingData(
  data: JSONData[],
  capabilities: State['capabilities'],
  settings: TSMLReactConfig,
  strings: Translation,
  timezone?: string
): [State['meetings'], State['indexes'], State['capabilities']] {
  // meetings is a lookup
  const meetings: { [index: string]: Meeting } = {};

  // indexes start as objects, will be converted to arrays
  const indexes: State['indexes'] = {
    region: [],
    time: [],
    type: [],
    weekday: [],
    distance: [],
  };

  // loop through each entry
  flattenDays(data).forEach(meeting => {
    const {
      contact_1_email,
      contact_1_name,
      contact_1_phone,
      contact_2_email,
      contact_2_name,
      contact_2_phone,
      contact_3_email,
      contact_3_name,
      contact_3_phone,
      district,
      edit_url,
      email,
      entity,
      entity_location,
      entity_phone,
      entity_url,
      group,
      group_notes,
      location,
      location_notes,
      name,
      notes,
      phone,
      slug,
      website,
    } = meeting;

    // slug is required and must be unique
    if (!slug) {
      return warn('no slug', meeting);
    } else if (slug in meetings) {
      return warn('duplicate slug', meeting);
    }

    // conference url
    const conference_provider = meeting.conference_url
      ? formatConferenceProvider(meeting.conference_url, settings)
      : undefined;

    let {
      address,
      conference_url,
      conference_phone,
      conference_phone_notes,
      conference_url_notes,
      feedback_url,
      formatted_address,
      regions,
    } = meeting;

    if (meeting.conference_url) {
      if (conference_provider) {
        conference_url = meeting.conference_url;
      } else {
        warn('unknown conference_url', meeting);
      }
    }

    if (!conference_url && conference_url_notes) {
      conference_url_notes = undefined;
    }

    conference_phone = validateConferencePhone(meeting);
    if (!conference_phone && conference_phone_notes) {
      conference_phone_notes = undefined;
    }

    // creates formatted_address if necessary
    if (!formatted_address) {
      formatted_address = [
        meeting.address,
        meeting.city,
        [meeting.state, meeting.postal_code].join(' ').trim(),
        meeting.country,
      ]
        .map(e => e?.trim())
        .filter(e => e)
        .join(', ');
      if (!formatted_address) {
        return warn('no address information', meeting);
      }
    }

    // used in table
    if (!address) {
      address = formatAddress(formatted_address);
    }

    // check if approximate
    let approximate, coordinates;
    if (
      meeting.coordinates &&
      [1, 3].includes((meeting.coordinates.match(/,/g) || []).length)
    ) {
      coordinates = meeting.coordinates.split(',');
      approximate = coordinates.length !== 2;
      meeting.latitude = meeting.approximate ? undefined : coordinates[0];
      meeting.longitude = meeting.approximate ? undefined : coordinates[1];
    } else if (typeof meeting.approximate === 'string') {
      approximate = meeting.approximate.toLowerCase() === 'yes';
    } else if (typeof meeting.approximate === 'boolean') {
      approximate = meeting.approximate;
    } else {
      approximate = formatted_address.split(',').length < 4;
    }

    // if approximate is specified, it overrules formatAddress
    if (approximate) address = undefined;

    //types
    let types = Array.isArray(meeting.types)
      ? meeting.types
          .map(type =>
            typeof type === 'number' ? type.toString() : type.trim()
          )
          .filter(type => type in strings.types && type !== 'ONL')
      : [];

    // add online metattype
    const isOnline = !!conference_provider || !!conference_phone;
    if (isOnline) types.push('online');

    // add in-person metatype
    const isTempClosed = types.includes('TC');
    const isInPerson = !isTempClosed && !approximate;
    if (isInPerson) {
      types.push('in-person');
    }

    // add active / inactive metatypes
    const isActive = isOnline || isInPerson;
    if (isActive) {
      types.push('active');
    } else {
      capabilities.inactive = true;
      types.push('inactive');
    }

    // if meeting is not in person, remove types that only apply to in-person meetings
    if (!isInPerson) {
      types = types.filter(type => !settings.in_person_types.includes(type));
    }

    // if meeting is both speaker and discussion, combine
    if (types.includes('SP') && types.includes('D')) {
      types.splice(types.indexOf('SP'), 1);
      types.splice(types.indexOf('D'), 1);
      types.push('SPD');
    }

    // check location/group capability
    if (
      !capabilities.location &&
      ((isOnline && group) || (isInPerson && location))
    ) {
      capabilities.location = true;
    }

    // format latitude + longitude
    let latitude, longitude;
    if (meeting.latitude && meeting.longitude) {
      if (isInPerson) {
        capabilities.coordinates = true;
        latitude =
          typeof meeting.latitude === 'string'
            ? parseFloat(meeting.latitude)
            : meeting.latitude;
        longitude =
          typeof meeting.longitude === 'string'
            ? parseFloat(meeting.longitude)
            : meeting.longitude;
      }
    }

    let start: DateTime | undefined;
    let end: DateTime | undefined;
    let minutes_week: number | undefined;

    // handle day and time
    if (typeof meeting.day !== 'undefined' && meeting.time) {
      //luxon uses iso day
      const weekday = meeting.day === 0 ? 7 : (meeting.day as WeekdayNumbers);
      const [hour, minute] = meeting.time.split(':').map(num => parseInt(num));

      // timezone
      if (!meeting.timezone) {
        if (timezone) {
          meeting.timezone = timezone;
        } else {
          // either tz setting or meeting tz is required
          return warn(`${meeting.slug} has no timezone`, meeting);
        }
      }

      // make start/end datetimes
      start = DateTime.fromObject(
        { weekday, hour, minute },
        { zone: meeting.timezone }
      );

      // check valid start time
      if (!start.isValid) {
        return warn(`invalid start (${start.invalidExplanation})`, meeting);
      }

      if (meeting.end_time) {
        const endTimeParts = meeting.end_time
          .split(':')
          .map(num => parseInt(num));
        end = DateTime.fromObject(
          { weekday, hour: endTimeParts[0], minute: endTimeParts[1] },
          { zone: meeting.timezone }
        );
      } else {
        end = start.plus({
          minutes: settings.duration,
        });
      }

      // check valid end time
      if (!end.isValid) {
        return warn(`invalid end (${end.invalidExplanation})`, meeting);
      }

      const duration = end.diff(start, 'minutes').toObject().minutes ?? 0;
      if (duration > 120) {
        warn(`unusually long (${duration} mins)`, meeting);
      }

      // normalize timezones
      start = start.setZone(timezone ? timezone : 'local');
      if (end) {
        end = end.setZone(timezone ? timezone : 'local');
      }

      // day & time indexes
      if (isActive) {
        const weekday = settings.weekdays[
          start?.weekday === 7
            ? 0
            : (start?.weekday as keyof typeof settings.weekdays)
        ] as keyof typeof strings.days;

        // day index
        const dayIndex = indexes.weekday.findIndex(
          ({ key }) => key === weekday
        );
        if (dayIndex === -1) {
          indexes.weekday.push({
            key: weekday,
            name: strings.days[weekday],
            slugs: [slug],
          });
        } else {
          indexes.weekday[dayIndex].slugs.push(slug);
        }

        // time differences for sorting
        const minutes_midnight = start.hour * 60 + start.minute;
        minutes_week = minutes_midnight + meeting.day * 1440;

        // time index (can be multiple)
        const times = [];
        if (minutes_midnight >= 240 && minutes_midnight < 720) {
          times.push(0); // morning (4am–11:59pm)
        }
        if (minutes_midnight >= 660 && minutes_midnight < 1020) {
          times.push(1); // midday (11am–4:59pm)
        }
        if (minutes_midnight >= 960 && minutes_midnight < 1260) {
          times.push(2); // evening (4pm–8:59pm)
        }
        if (minutes_midnight >= 1200 || minutes_midnight < 300) {
          times.push(3); // night (8pm–4:59am)
        }
        times.forEach(time => {
          const timeIndex = indexes.time.findIndex(
            ({ key }) => key === settings.times[time]
          );
          if (timeIndex === -1) {
            indexes.time.push({
              key: settings.times[time],
              name: strings[settings.times[time]],
              slugs: [slug],
            });
          } else {
            indexes.time[timeIndex].slugs.push(slug);
          }
        });
      }
    }

    // parse regions
    if (!regions || !Array.isArray(regions)) {
      regions = [];
      if (meeting.region) {
        regions.push(meeting.region);
        if (meeting.sub_region) {
          regions.push(meeting.sub_region);
          if (meeting.sub_sub_region) {
            regions.push(meeting.sub_sub_region);
          }
        }
      } else if (meeting.city) {
        regions.push(meeting.city);
      }
    } else {
      // defend against weird values, remove empty regions
      regions = regions
        .filter(e => typeof e === 'string')
        .map(e => e.trim())
        .filter(e => e.length);
    }

    // build region index
    if (isActive && !!regions.length) {
      indexes.region = populateRegionsIndex(regions, 0, indexes.region, slug);
    }

    // build type index (can be multiple) -- if inactive, only index the 'inactive' type
    const typesToIndex: string[] = isActive ? types : ['inactive'];
    typesToIndex.forEach(type => {
      const typeSlug = formatSlug(
        strings.types[type as keyof typeof strings.types]
      );
      const typeIndex = indexes.type.findIndex(({ key }) => key === typeSlug);
      if (typeIndex === -1) {
        indexes.type.push({
          key: typeSlug,
          name: strings.types[type as keyof typeof strings.types],
          slugs: [slug],
        });
      } else {
        indexes.type[typeIndex].slugs.push(slug);
      }
    });

    // optional updated date
    let updated;
    if (meeting.updated) {
      updated = DateTime.fromSQL(meeting.updated).setZone(timezone);
      if (!updated.isValid) {
        warn(`invalid updated (${updated.invalidExplanation})`, meeting);
        updated = undefined;
      } else {
        updated = updated.toLocaleString();
      }
    }

    // optional url
    const url =
      meeting.url?.startsWith('http://') || meeting.url?.startsWith('https://')
        ? meeting.url
        : undefined;

    // build search string
    const search = [
      district,
      formatted_address,
      group,
      group_notes,
      location,
      location_notes,
      name,
      notes,
      regions,
    ]
      .flat()
      .filter(e => e)
      .join('\t')
      .toLowerCase();

    let feedback_emails = settings.feedback_emails;
    if (Array.isArray(meeting.feedback_emails)) {
      feedback_emails = meeting.feedback_emails;
    }
    if ('string' === typeof meeting.feedback_emails) {
      feedback_emails = meeting.feedback_emails
        .split(',')
        .map(e => e.trim())
        .filter(e => e);
    }

    if (!feedback_url && feedback_emails.length) {
      feedback_url = formatFeedbackEmail({
        feedback_emails,
        name,
        edit_url,
        settings,
        strings,
      });
    }

    meetings[slug] = {
      address,
      approximate,
      conference_phone,
      conference_phone_notes,
      conference_provider,
      conference_url,
      conference_url_notes,
      contact_1_email,
      contact_1_name,
      contact_1_phone,
      contact_2_email,
      contact_2_name,
      contact_2_phone,
      contact_3_email,
      contact_3_name,
      contact_3_phone,
      district,
      edit_url,
      email,
      entity,
      entity_location,
      entity_phone,
      entity_url,
      end,
      feedback_url,
      formatted_address,
      group,
      group_notes,
      isActive,
      isInPerson,
      isOnline,
      isTempClosed,
      latitude,
      location,
      location_notes,
      longitude,
      minutes_week,
      name: name ?? strings.unnamed_meeting,
      notes,
      paypal: validatePayPal(meeting),
      phone,
      regions,
      search,
      slug,
      square: validateSquare(meeting),
      start,
      timezone: meeting.timezone,
      types,
      updated,
      url,
      venmo: validateVenmo(meeting),
      website,
    };

    // clean up undefined
    Object.keys(meetings[slug]).forEach(
      key =>
        meetings[slug][key as keyof Meeting] === undefined &&
        delete meetings[slug][key as keyof Meeting]
    );
  });

  // convert region to array, sort by name
  indexes.region = flattenAndSortIndexes(indexes.region, (a, b) =>
    a.name?.localeCompare(b.name)
  );

  // convert weekday to array and sort by ordinal
  indexes.weekday = flattenAndSortIndexes(
    indexes.weekday,
    (a, b) =>
      settings.weekdays.indexOf(a.key) - settings.weekdays.indexOf(b.key)
  );

  // convert time to array and sort by ordinal
  indexes.time = flattenAndSortIndexes(
    indexes.time,
    // @ts-expect-error TODO
    (a, b) => settings.times.indexOf(a.key) - settings.times.indexOf(b.key)
  );

  // convert type to array and sort by name
  indexes.type = flattenAndSortIndexes(indexes.type, (a, b) =>
    a.name?.localeCompare(b.name)
  );

  // determine capabilities (filter out options that apply to every meeting)
  const meetingsCount = Object.keys(meetings).length;
  ['region', 'weekday', 'time', 'type'].forEach(indexKey => {
    capabilities[indexKey as keyof typeof capabilities] = !!indexes[
      indexKey as keyof typeof indexes
    ].filter((index: Index) => index.slugs.length !== meetingsCount).length;
  });

  // remove active type if no inactive meetings
  if (!capabilities.inactive) {
    // ...from the indexes
    indexes.type = indexes.type.filter(type => type.key !== 'active');

    // ...from each meeting
    Object.keys(meetings).forEach(slug => {
      meetings[slug] = {
        ...meetings[slug],
        types: meetings[slug].types?.filter(
          type => type !== strings.types.active
        ),
      };
    });
  }

  // determine search modes
  capabilities.geolocation =
    navigator.geolocation &&
    capabilities.coordinates &&
    (window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost');

  // determine sharing
  capabilities.sharing = typeof navigator.canShare === 'function';

  return [meetings, indexes, capabilities];
}

// look for data with multiple days and make them all single
export function flattenDays(data: JSONData[]): JSONDataFlat[] {
  const addMeetings: JSONDataFlat[] = [];
  const removeIndexes: number[] = [];

  data.forEach((meeting, index) => {
    if (Array.isArray(meeting.day)) {
      removeIndexes.push(index);
      meeting.day.forEach(day => {
        addMeetings.push({
          ...meeting,
          day: typeof day === 'string' ? parseInt(day) : day,
          slug: `${meeting.slug}-${day}`,
        });
      });
    }
  });

  removeIndexes.forEach(index => data.splice(index, 1));

  return data
    .map(({ day, ...rest }) => {
      return {
        ...rest,
        day: typeof day === 'string' ? parseInt(day) : day,
      } as JSONDataFlat;
    })
    .concat(addMeetings);
}

// recursive function to build an index of regions from a flat array
function populateRegionsIndex(
  regions: string[],
  position: number,
  index: Index[],
  slug: string
) {
  const region = regions[position];
  const regionSlug = formatSlug(regions.slice(0, position + 1).join(' '));
  let regionIndex = index.findIndex(({ key }) => key === regionSlug);
  if (regionIndex === -1) {
    index.push({
      key: regionSlug,
      name: region,
      slugs: [slug],
      children: [],
    });
    regionIndex = index.length - 1;
  } else {
    index[regionIndex].slugs.push(slug);
  }

  if (regions.length > position + 1) {
    index[regionIndex].children = populateRegionsIndex(
      regions,
      position + 1,
      index[regionIndex].children ?? [],
      slug
    );
  }

  return index;
}

function validateConferencePhone(meeting: JSONDataFlat) {
  const { conference_phone } = meeting;
  if (conference_phone) {
    const conference_phone_clean = conference_phone.replace(/[^\d,+#]/g, '');
    if (conference_phone_clean.length >= 10) {
      return conference_phone_clean;
    }
    warn(`invalid conference_phone ${conference_phone}`, meeting);
  }
  return undefined;
}

function validatePayPal(meeting: JSONDataFlat) {
  const { paypal } = meeting;
  if (paypal) {
    if (/^[a-zA-Z0-9]+$/.test(paypal) && paypal.length < 21) {
      return paypal;
    }
    warn(`invalid paypal ${paypal}`, meeting);
  }
  return undefined;
}

function validateSquare(meeting: JSONDataFlat) {
  const { square } = meeting;
  if (square) {
    if (square.startsWith('$')) {
      return square;
    }
    warn(`invalid square ${square}`, meeting);
  }
  return undefined;
}

function validateVenmo(meeting: JSONDataFlat) {
  const { venmo } = meeting;
  if (venmo) {
    if (venmo.startsWith('@')) {
      return venmo;
    }
    warn(`invalid venmo ${venmo}`, meeting);
  }
  return undefined;
}

// warn about bad data
function warn(issue: string, meeting: JSONDataFlat) {
  const { slug, edit_url } = meeting;
  console.warn(
    `TSML UI ${issue}${edit_url ? `: ${edit_url}` : slug ? `: ${slug}` : ''}`
  );
}
