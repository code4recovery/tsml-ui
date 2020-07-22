import React from 'react';

import Name from './name';

export default function Link({ state, meeting, setAppState }) {
  return (
    <a
      href={window.location.pathname + '?meeting=' + meeting.slug}
      onClick={e => {
        event.preventDefault();
        state.input.meeting = meeting.slug;
        setAppState('input', state.input);
      }}
    >
      <Name meeting={meeting} />
    </a>
  );
}
