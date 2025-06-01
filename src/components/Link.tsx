import { NavLink, useSearchParams } from 'react-router-dom';

import { useData, useSettings } from '../hooks';
import type { Meeting } from '../types';

export default function Link({ meeting }: { meeting: Meeting }) {
  const { meeting: thisMeeting } = useData();
  const { settings, strings } = useSettings();
  const [searchParams] = useSearchParams();

  const flags =
    settings.flags
      ?.filter(flag => meeting.types?.includes(flag))
      .map(flag => strings.types[flag])
      .sort()
      .join(', ') ?? [];

  if (thisMeeting?.slug === meeting.slug) {
    return !flags.length ? (
      <>{meeting.name}</>
    ) : (
      <>
        <span>{meeting.name}</span>
        <small>{flags}</small>
      </>
    );
  }

  return (
    <>
      <NavLink
        to={`${new URLSearchParams(searchParams).set('meeting', meeting.slug)}`}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {meeting.name}
      </NavLink>
      {flags && <small>{flags}</small>}
    </>
  );
}
