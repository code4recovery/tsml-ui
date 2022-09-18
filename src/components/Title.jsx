import React from 'react';

import { getIndexByKey, strings } from '../helpers';

export default function Title({ state: { indexes, input } }) {
  //loading
  if (!indexes || !input) return null;

  //build title from strings.title
  const parts = [];

  Object.keys(strings.title).forEach(key => {
    if (key === 'meetings') {
      parts.push(strings.meetings);
    } else if (
      key === 'search_with' &&
      input.mode === 'search' &&
      input.search
    ) {
      parts.push(
        strings.title.search_with.replace('%search%', `‘${input.search}’`)
      );
    } else if (
      key === 'search_near' &&
      input.mode === 'location' &&
      input.search
    ) {
      parts.push(
        strings.title.search_near.replace('%search%', `‘${input.search}’`)
      );
    } else if (indexes[key] && input[key]?.length) {
      const value = input[key]
        .map(value => getIndexByKey(indexes[key], value)?.name)
        .join(' + ');
      parts.push(strings.title[key].replace(`%${key}%`, value));
    }
  });

  const title = parts.join(' ');

  //set window title
  document.title = title;

  //return h1
  return <h1 className="fw-light mb-n1">{title}</h1>;
}
