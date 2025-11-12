import { fireEvent, render } from '@testing-library/react';
import { DateTime } from 'luxon';
import { MemoryRouter, useParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Meeting from '../../src/components/Meeting';
import { SettingsProvider } from '../../src/hooks';
import { en } from '../../src/i18n';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

const mockMeeting = {
  slug: 'test',
  isInPerson: true,
  isOnline: true,
  isActive: true,
  latitude: 40.712776,
  longitude: -74.005974,
  name: 'First Meeting',
  start: DateTime.now(),
  end: DateTime.now(),
  types: ['O', 'M', 'X'],
  timezone: 'America/New_York',
  approximate: false,
  formatted_address: '123 Main St, New York, NY 12345, USA',
  email: 'test@test.com',
  venmo: '@test',
  square: '$test',
  paypal: 'https://paypal.me/test',
  homegroup_online: 'test',
  location: 'Empire State Building',
  notes: 'Testing meeting notes\n\nTesting new line',
  location_notes: 'Testing location notes\n\nTesting new line',
  group: 'Test Group',
  group_notes: 'Testing group notes\n\nTesting new line',
  website: 'https://test.com',
  phone: '+18005551212',
  regions: ['Manhattan', 'Midtown'],
  district: 'District 13',
  conference_url: 'https://zoom.us/d/123456789',
  conference_url_notes: 'Test',
  conference_phone: '+1234567890',
  conference_phone_notes: 'Test',
  conference_provider: 'Zoom',
  updated: '2/17/22',
  contact_1_name: 'Contact 1',
  contact_1_email: 'contact1@test.com',
  contact_1_phone: '+18005551212',
  contact_2_email: 'contact2@test.com',
  contact_2_phone: '+18005551212',
};

// Mock the useData hook to return a predefined meetings object
vi.mock('../../src/hooks', async () => {
  const originalModule = await vi.importActual('../../src/hooks');
  return {
    ...originalModule,
    useFilter: () => ({
      meeting: mockMeeting,
      waitingForFilter: false,
    }),
  };
});

describe('<Meeting />', () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn();
  });

  it('renders with clickable buttons', () => {
    vi.mocked(useParams).mockReturnValue({ slug: 'test' });

    const { getByText } = render(
      <MemoryRouter>
        <SettingsProvider>
          <Meeting />
        </SettingsProvider>
      </MemoryRouter>
    );

    // click formatIcs
    const calendar_link = getByText(en.add_to_calendar);
    expect(calendar_link).toBeVisible();
    fireEvent.click(calendar_link);

    // click back
    const back_link = getByText(en.back_to_meetings);
    expect(back_link).toBeVisible();
    fireEvent.click(back_link);
  });

  it('renders with group info', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <SettingsProvider>
          <Meeting />
        </SettingsProvider>
      </MemoryRouter>
    );

    const groups = getAllByText(mockMeeting.group!);
    expect(groups[0]).toBeVisible();

    const group_notes = getAllByText(mockMeeting.group_notes!.split('\n')[0]);
    expect(group_notes[0]).toBeVisible();
  });

  it('renders with contact 1', () => {
    const { getAllByText } = render(
      <MemoryRouter>
        <SettingsProvider>
          <Meeting />
        </SettingsProvider>
      </MemoryRouter>
    );
    const contact1texts = getAllByText(`Text ${mockMeeting.contact_1_name}`);
    expect(contact1texts[0]).toHaveAttribute(
      'href',
      `sms:${mockMeeting.contact_1_phone}`
    );
    const contact1emails = getAllByText(`Email ${mockMeeting.contact_1_name}`);
    expect(contact1emails[0]).toHaveAttribute(
      'href',
      `mailto:${mockMeeting.contact_1_email}`
    );
  });
});
