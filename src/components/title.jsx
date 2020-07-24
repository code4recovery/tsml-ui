import React from 'react';

import { strings } from '../helpers/settings';

export default function Title({ state }) {
  //loading
  if (!state.indexes || !state.input) return;

  //build title from strings.title
  let title = [];

  Object.keys(strings.title).forEach(key => {
    if (key === 'meetings') {
      title.push(strings.meetings);
    } else if (key === 'search' && state.input.search) {
      title.push(
        strings.title[key].replace('%search%', `‘${state.input.search}’`)
      );
    } else if (state.indexes[key] && state.input[key].length) {
      const value = state.input[key]
        .map(x => {
          const value = state.indexes[key].find(y => y.key == x);
          return value?.name;
        })
        .join(' + ');
      title.push(strings.title[key].replace(`%${key}%`, value));
    }
  });
  title = title.join(' ');

  //set window title
  document.title = title;

  //return h1
  return <h1 className="font-weight-light pb-1">{title}</h1>;
}
