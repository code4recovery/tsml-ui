import React from 'react';
import { settings } from '../helpers/settings';

export default function Link({ state, meeting, setAppState }) {
  const flags = settings.flags
    .filter(type => meeting.types.includes(type))
    .sort()
    .join(', ');

  if (!state || !setAppState) {
    return !flags ? (
      meeting.name
    ) : (
      <>
        <span>{meeting.name}</span>
        <small className="ml-2 text-muted">{flags}</small>
      </>
    );
  }

  return (
    <>
      <a
        href={window.location.pathname + '?meeting=' + meeting.slug}
        onClick={e => {
          event.preventDefault();
          state.input.meeting = meeting.slug;
          setAppState('input', state.input);
        }}
      >
        {meeting.name}
      </a>
      {!!flags && <small className="ml-2 text-muted">{flags}</small>}
    </>
  );
}
