import React from 'react';

export default function Name(props) {
  return (
    <>
      {props.meeting.name}
      {props.meeting.flags && (
        <small className="text-muted mx-2">/ {props.meeting.flags}</small>
      )}
    </>
  );
}