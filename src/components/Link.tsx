import { formatUrl } from '../helpers';
import { useFilter, useInput, useSettings } from '../hooks';
import type { Meeting } from '../types';

import { Link as RouterLink } from 'react-router-dom';

export default function Link({ meeting }: { meeting: Meeting }) {
  const { meeting: thisMeeting } = useFilter();
  const { settings, strings } = useSettings();
  const { input } = useInput();

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
      <RouterLink
        to={formatUrl({ ...input, meeting: meeting.slug }, settings)}
        onClick={e => e.stopPropagation()}
      >
        {meeting.name}
      </RouterLink>
      {flags && <small>{flags}</small>}
    </>
  );
}
