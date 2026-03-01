import { useEffect, useRef, useState } from 'react';

import { formatGoogleUrl, formatIcs } from '../helpers';
import { useSettings } from '../hooks';
import { buttonCss, calendarMenuCss } from '../styles';
import type { Meeting } from '../types';

import Icon from './Icon';

export default function CalendarButton({ meeting }: { meeting: Meeting }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { strings } = useSettings();

  const googleUrl = formatGoogleUrl(meeting);

  // close on outside click or escape
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} css={calendarMenuCss}>
      <button
        aria-expanded={open}
        css={buttonCss}
        onClick={() => setOpen(!open)}
      >
        <Icon icon="calendar" />
        {strings.add_to_calendar}
      </button>
      <div className="tsml-calendar-menu" data-open={open}>
        <button
          onClick={() => {
            formatIcs(meeting);
            setOpen(false);
          }}
        >
          <Icon icon="calendar" />
          {strings.calendar_download}
        </button>
        {googleUrl && (
          <a href={googleUrl} target="_blank" rel="noopener noreferrer">
            <Icon icon="link" />
            {strings.calendar_google}
          </a>
        )}
      </div>
    </div>
  );
}
