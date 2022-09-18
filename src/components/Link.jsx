import React from 'react';

import { formatUrl, settings, strings } from '../helpers';

export default function Link({ state, meeting, setState }) {
  const flags = settings.flags
    .filter(flag => meeting.types.includes(flag))
    .map(flag => strings.types[flag])
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
        href={formatUrl({ ...state.input, meeting: meeting.slug })}
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
      {flags && <small className="ms-2 text-muted">{flags}</small>}
    </>
  );
}
