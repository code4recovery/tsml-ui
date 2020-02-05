import React from 'react';

import Name from './name';

export default function Link(props) {
  return (
    <a
      href={window.location.pathname + '?meeting=' + props.meeting.slug}
      onClick={event => {
        event.preventDefault();
        props.state.input.meeting = props.meeting.slug;
        props.setAppState('input', props.state.input);
      }}
    >
      <Name meeting={props.meeting} />
    </a>
  );
}
