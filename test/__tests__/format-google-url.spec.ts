import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';

import { formatGoogleUrl } from '../../src/helpers/format-google-url';
import { Meeting } from '../../src/types';

const mockMeeting = {
  name: 'Foo Meeting',
  start: DateTime.fromISO('2099-01-01T00:00:00.000Z'),
  end: DateTime.fromISO('2099-01-01T01:00:00.000Z'),
  timezone: 'America/New_York',
  formatted_address: '',
} as Meeting;

describe('formatGoogleUrl', () => {
  it('returns undefined without start', () => {
    expect(formatGoogleUrl({ ...mockMeeting, start: undefined })).toBeUndefined();
  });

  it('returns undefined without end', () => {
    expect(formatGoogleUrl({ ...mockMeeting, end: undefined })).toBeUndefined();
  });

  it('returns a URL with minimal data', () => {
    const url = formatGoogleUrl(mockMeeting);
    expect(url).toContain('https://calendar.google.com/calendar/render');
    expect(url).toContain('action=TEMPLATE');
    expect(url).toContain('text=Foo+Meeting');
  });

  it('includes timezone', () => {
    const url = formatGoogleUrl(mockMeeting)!;
    expect(url).toContain('ctz=America%2FNew_York');
  });

  it('includes in-person location', () => {
    const url = formatGoogleUrl({
      ...mockMeeting,
      isInPerson: true,
      location: 'Community Center',
      formatted_address: '123 Main St',
    })!;
    expect(url).toContain('location=Community+Center');
    expect(url).toContain('123+Main+St');
  });

  it('includes conference URL as location for online meetings', () => {
    const url = formatGoogleUrl({
      ...mockMeeting,
      isOnline: true,
      conference_url: 'https://zoom.us/j/123',
    })!;
    expect(url).toContain('location=https');
    expect(url).toContain('zoom.us');
  });

  it('includes notes and conference info in details', () => {
    const url = formatGoogleUrl({
      ...mockMeeting,
      isOnline: true,
      notes: 'Bring your book',
      conference_url: 'https://zoom.us/j/123',
      conference_phone: '+1-555-1234',
      website: 'https://example.com',
    })!;
    expect(url).toContain('details=');
    expect(url).toContain('Bring+your+book');
    expect(url).toContain('zoom.us');
    expect(url).toContain('555-1234');
    expect(url).toContain('example.com');
  });

  it('contains properly formatted date range', () => {
    const url = formatGoogleUrl(mockMeeting)!;
    // dates param should have start/end separated by /
    expect(url).toMatch(/dates=\d{8}T\d{6}Z%2F\d{8}T\d{6}Z/);
  });
});
