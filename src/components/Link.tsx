import { NavLink, useSearchParams } from 'react-router-dom';

import { useSettings } from '../helpers';

import type { Meeting } from '../types';

export default function Link({
  meeting,
  link = true,
}: {
  meeting: Meeting;
  link?: boolean;
}) {
  const { settings, strings } = useSettings();
  const [searchParams] = useSearchParams();

  const flags =
    settings.flags
      ?.filter(flag => meeting.types?.includes(flag))
      .map(flag => strings.types[flag])
      .sort()
      .join(', ') ?? [];

  if (!link) {
    return !flags.length ? (
      <>{meeting.name}</>
    ) : (
      <>
        <span>{meeting.name}</span>
        <small>{flags}</small>
      </>
    );
  }

  const url = `/${meeting.slug}${searchParams ? `?${searchParams}` : ''}`;

  return (
    <>
      <NavLink to={url}>{meeting.name}</NavLink>
      {flags && <small>{flags}</small>}
    </>
  );
}
