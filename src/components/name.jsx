import React from 'react';

export default function Name({ meeting }) {
  return (
    <>
      {meeting.name}
      {meeting.flags && (
        <small className="text-muted mx-2">/ {meeting.flags}</small>
      )}
    </>
  );
}
