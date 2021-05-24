import React from 'react';

import { getIndexByKey, setTitle, strings } from '../helpers';

export default function Title({ state }) {
  //loading
  if (!state.indexes || !state.input) return;

  //build title from strings.title
  let title = [];

  Object.keys(strings.title).forEach(key => {
    if (key === 'meetings') {
      title.push(strings.meetings);
    } else if (
      key === 'search_with' &&
      state.input.mode === 'search' &&
      state.input.search
    ) {
      title.push(
        strings.title.search_with.replace('%search%', `‘${state.input.search}’`)
      );
    } else if (
      key === 'search_near' &&
      state.input.mode === 'location' &&
      state.input.search
    ) {
      title.push(
        strings.title.search_near.replace('%search%', `‘${state.input.search}’`)
      );
    } else if (state.indexes[key] && state.input[key].length) {
      const value = state.input[key]
        .map(x => {
          const value = getIndexByKey(state.indexes[key], x);
          return value?.name;
        })
        .join(' + ');
      title.push(strings.title[key].replace(`%${key}%`, value));
    }
  });
  title = title.join(' ');

  //set window title
  setTitle(title);

  //return h1
  return <h1 className="font-weight-light mb-2">{title}</h1>;
}
