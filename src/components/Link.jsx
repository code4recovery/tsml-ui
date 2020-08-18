import React from 'react';

import { settings } from '../helpers';

export default function Link({ state, meeting, setState }) {
  const flags = settings.flags
    .filter(type => meeting.types.includes(type))
    .sort()
    .join(', ');

  if (!state || !setState) {
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
          e.preventDefault();
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
      {!!flags && <small className="ml-2 text-muted">{flags}</small>}
    </>
  );
}
