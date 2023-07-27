import { formatUrl, useSettings } from '../helpers';
import type { State, Meeting } from '../types';

type LinkProps = {
  meeting: Meeting;
  setState?: (state: State) => void;
  state?: State;
};

export default function Link({ meeting, setState, state }: LinkProps) {
  const { settings, strings } = useSettings();

  const name =
    !state || !setState ? (
      <>{meeting.name}</>
    ) : (
      <a
        href={formatUrl({ ...state.input, meeting: meeting.slug }, settings)}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
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
      </a>
    );

  const flags = settings.flags
    ?.filter(flag => meeting.types?.includes(flag))
    .map(flag => (
      <small
        key={flag}
        className={`flag-${flag.toLowerCase()} ms-2 text-muted`}
      >
        {strings.types[flag]}
      </small>
    ));

  return (
    <>
      {name}
      {!!flags && flags}
    </>
  );
}
