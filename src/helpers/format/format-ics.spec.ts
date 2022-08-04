import moment from 'moment-timezone';
import { formatIcs } from '.';
import { Meeting } from '../../types';

//TODO: Only requiring the parts needed for this test, should
//probably integrate fixtures.
const mockMeeting = {
  name: 'Foo Meeting',
  start: moment('2022-01-01T00:00:00.000Z'),
  timezone: 'America/New_York',
} as Meeting;

describe('formatIcs', () => {
  beforeEach(() => {
    window.URL.createObjectURL = jest.fn() as jest.Mock;
  });

  it('works with minimal data', () => {
    formatIcs(mockMeeting);
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('works with end time', () => {
    formatIcs({
      ...mockMeeting,
      end: moment('2022-01-01T00:00:00.000Z'),
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('works with isInPerson', () => {
    formatIcs({
      ...mockMeeting,
      isInPerson: true,
      formatted_address: '123 Foo Street',
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('works with location NOT in person', () => {
    formatIcs({
      ...mockMeeting,
      formatted_address: '123 Foo Street',
      location: 'Foo Location',
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('works with location AND in person', () => {
    formatIcs({
      ...mockMeeting,
      isInPerson: true,
      formatted_address: '123 Foo Street',
      location: 'Foo Location',
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
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
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('works with conference provider', () => {
    formatIcs({
      ...mockMeeting,
      conference_provider: 'foo',
      conference_url: 'https://foo.com',
    });
    expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
  });
});
