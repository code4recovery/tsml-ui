import React from 'react';

import { getIndexByKey, strings } from '../helpers';

export default function Title({ state }) {
  //loading
  if (!state.indexes || !state.input) return null;

  //build title from strings.title
  const parts = [];

  Object.keys(strings.title).forEach(key => {
    if (key === 'meetings') {
      parts.push(strings.meetings);
    } else if (
      key === 'search_with' &&
      state.input.mode === 'search' &&
      state.input.search
    ) {
      parts.push(
        strings.title.search_with.replace('%search%', `‘${state.input.search}’`)
      );
    } else if (
      key === 'search_near' &&
      state.input.mode === 'location' &&
      state.input.search
    ) {
      parts.push(
        strings.title.search_near.replace('%search%', `‘${state.input.search}’`)
      );
    } else if (state.indexes[key] && state.input[key]?.length) {
      const value = state.input[key]
        .map(value => getIndexByKey(state.indexes[key], value)?.name)
        .join(' + ');
      parts.push(strings.title[key].replace(`%${key}%`, value));
    }
  });

  const title = parts.join(' ');

  //set window title
  document.title = title;

  //return h1
  return <h1 className="fw-light mb-2">{title}</h1>;
}
