import React from 'react';

import { settings, fixedEncodeURIComponent } from '../helpers';

export default function Link({ state, meeting, setState }) {
  const encodedMeetingName = encodeURIComponent(meeting.name);
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
        <small className="ms-2 text-muted">{flags}</small>
      </>
    );
  }

  return (
    <>
      <a
        href={
          window.location.pathname +
          '?meeting=' +
          meeting.slug +
          '&meeting_name=' +
          encodedMeetingName
        }
        onClick={e => {
          e.preventDefault();
          setState({
            ...state,
            input: {
              ...state.input,
              meeting: meeting.slug,
              meeting_name: encodedMeetingName,
            },
          });
        }}
      >
        {meeting.name}
      </a>
      {!!flags && <small className="ms-2 text-muted">{flags}</small>}
    </>
  );
}
