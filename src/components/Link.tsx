import { Dispatch, SetStateAction } from 'react';

import { NavLink } from 'react-router-dom';

import { formatUrl, useSettings } from '../helpers';

import type { State, Meeting } from '../types';

export default function Link({
  meeting,
  setState,
  state,
}: {
  meeting: Meeting;
  setState?: Dispatch<SetStateAction<State>>;
  state?: State;
}) {
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
      <NavLink
        to={formatUrl({ input: state.input, meeting: meeting.slug, settings })}
      >
        {meeting.name}
      </NavLink>
      {flags && <small>{flags}</small>}
    </>
  );
}
