import { formatUrl, useSettings } from '../helpers';
import type { State, Meeting } from '../types';
import { Link as RouterLink } from 'react-router-dom';

type LinkProps = {
  meeting: Meeting;
  setState?: (state: State) => void;
  state?: State;
};

export default function Link({ meeting, setState, state }: LinkProps) {
  const { settings, strings } = useSettings();

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

  return (
    <>
      <RouterLink
        to={formatUrl({ ...state.input, meeting: meeting.slug }, settings)}
        onClick={e => {
          // e.preventDefault();
          // e.stopPropagation();
          console.log('clicked');
          setState({
            ...state,
            input: {
              ...state.input,
              meeting: meeting.slug,
            },
          });
        }}
      >
        {meeting.name}
      </RouterLink>
      {flags && <small>{flags}</small>}
    </>
  );
}
