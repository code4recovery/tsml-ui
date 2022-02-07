import moment from 'moment-timezone';
import { formatIcs } from '.';
import { Meeting } from '../../types/Meeting';

//TODO: Only requiring the parts needed for this test, should
//probably integrate fixtures.
const mockMeeting = {
  name: 'Foo Meeting',
  start: moment('2022-01-01T00:00:00.000Z'),
  timezone: 'America/New_York',
} as Meeting;

describe('formatIcs', () => {
  it('works with minimal data', () => {
    formatIcs(mockMeeting);

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T010000Z%0ADTEND;TZID=/America/New_York:20211231T180000%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  it('works with end time', () => {
    formatIcs({
      ...mockMeeting,
      end: moment('2022-01-01T00:00:00.000Z'),
    });

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T000000Z%0ADTEND;TZID=/America/New_York:20211231T170000%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  it('works with isInPerson', () => {
    formatIcs({
      ...mockMeeting,
      isInPerson: true,
      formatted_address: '123 Foo Street',
    });

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T010000Z%0ADTEND;TZID=/America/New_York:20211231T180000%0ALOCATION:123%20Foo%20Street%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  it('works with location NOT in person', () => {
    formatIcs({
      ...mockMeeting,
      formatted_address: '123 Foo Street',
      location: 'Foo Location',
    });

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T010000Z%0ADTEND;TZID=/America/New_York:20211231T180000%0ALOCATION:Foo%20Location%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  it('works with location AND in person', () => {
    formatIcs({
      ...mockMeeting,
      isInPerson: true,
      formatted_address: '123 Foo Street',
      location: 'Foo Location',
    });

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T010000Z%0ADTEND;TZID=/America/New_York:20211231T180000%0ALOCATION:123%20Foo%20Street%0ADESCRIPTION:Foo%20Location%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  it('works with lat/long', () => {
    formatIcs({
      ...mockMeeting,
      isInPerson: true,
      formatted_address: '123 Foo Street',
      location: 'Foo Location',
      latitude: 1,
      longitude: 1,
    });

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T010000Z%0ADTEND;TZID=/America/New_York:20211231T180000%0ALOCATION:123%20Foo%20Street%0AGEO:1;1%0ADESCRIPTION:Foo%20Location%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  it('works with conference provider', () => {
    formatIcs({
      ...mockMeeting,
      conference_provider: 'foo',
      conference_url: 'https://foo.com',
    });

    expect(location).toStrictEqual(
      'data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:Foo%20Meeting%0ADTSTART:20220101T000000Z%0ADTSTART;TZID=/America/New_York:20211231T170000%0ADTEND:20220101T010000Z%0ADTEND;TZID=/America/New_York:20211231T180000%0AURL:https://foo.com%0AEND:VEVENT%0AEND:VCALENDAR'
    );
  });

  //TODO: Want to be tactful with other tests dealing with user agent here
  it.todo('works in IE');
});
