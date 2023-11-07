import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../helpers';
import type { State, Meeting } from '../types';

type LinkProps = {
  meeting: Meeting;
  setState?: (state: State) => void;
  state?: State;
};

export default function Link({ meeting, setState, state }: LinkProps) {
  const { settings, strings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const flags =
    settings.flags
      ?.filter(flag => meeting.types?.includes(flag))
      .map(flag => strings.types[flag])
      .sort()
      .join(', ') ?? [];

  if (!state || !setState) {
    return !flags.length ? (
      <>{meeting.name}</>
    ) : (
      <>
        <span>{meeting.name}</span>
        <small>{flags}</small>
      </>
    );
  }

  const navigate = () => {
    searchParams.set('meeting', meeting.slug);
    setSearchParams(searchParams);
  };

  return (
    <>
      <a
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          navigate();
        }}
      >
        {meeting.name}
      </a>
      {flags && <small>{flags}</small>}
    </>
  );
}
