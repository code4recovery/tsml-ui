import { useEffect, useState } from 'react';

import { formatGoogleUrl, formatIcs } from '../helpers';
import { useSettings } from '../hooks';
import { calendarDropdownCss, calendarMenuCss, dropdownButtonCss } from '../styles';
import type { Meeting } from '../types';

import Icon from './Icon';

export default function CalendarButton({ meeting }: { meeting: Meeting }) {
  const [open, setOpen] = useState(false);
  const { strings } = useSettings();

  const googleUrl = formatGoogleUrl(meeting);

  // close on outside click
  useEffect(() => {
    const close = () => setOpen(false);
    document.body.addEventListener('click', close);
    return () => {
      document.body.removeEventListener('click', close);
    };
  }, []);

  return (
    <div css={calendarMenuCss}>
      <button
        aria-expanded={open}
        css={dropdownButtonCss}
        onClick={e => {
          setOpen(!open);
          e.stopPropagation();
        }}
      >
        <Icon icon="calendar" />
        {strings.add_to_calendar}
      </button>
      <div css={calendarDropdownCss} data-open={open}>
        <button
          onClick={() => {
            formatIcs(meeting);
            setOpen(false);
          }}
        >
          {strings.calendar_ical}
        </button>
        {googleUrl && (
          <a href={googleUrl} target="_blank" rel="noopener noreferrer">
            {strings.calendar_google}
          </a>
        )}
      </div>
    </div>
  );
}
