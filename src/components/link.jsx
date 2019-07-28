import React from 'react';

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
      {props.meeting.name}
    </a>
  );
}
