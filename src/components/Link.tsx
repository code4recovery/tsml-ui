import { formatUrl } from '../helpers';
import { useFilter, useInput, useSettings } from '../hooks';
import type { Meeting } from '../types';

export default function Link({ meeting }: { meeting: Meeting }) {
  const { meeting: thisMeeting } = useFilter();
  const { settings, strings } = useSettings();
  const { input, setInput } = useInput();

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
      <a
        href={formatUrl({ ...input, meeting: meeting.slug }, settings)}
        onClick={e => {
          e.preventDefault();
          setInput(input => ({ ...input, meeting: meeting.slug }));
        }}
      >
        {meeting.name}
      </a>
      {flags && <small>{flags}</small>}
    </>
  );
}
