import React from 'react';

import { strings } from '../helpers/settings';

const separator = ' + ';

export default function Title({ state }) {
  //loading
  if (!state.indexes || !state.input) return;

  //build title from strings.title
  let title = [];
  const keys = Object.keys(strings.title);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === 'meetings') {
      title.push(strings.meetings);
    } else if (keys[i] === 'search' && state.input.search) {
      const value = '‘' + state.input.search + '’';
      title.push(strings.title[keys[i]].replace('%search%', value));
    } else if (state.indexes[keys[i]] && state.input[keys[i]].length) {
      const value = state.input[keys[i]]
        .map(x => {
          const value = state.indexes[keys[i]].find(y => y.key == x);
          return value ? value.name : '';
        })
        .join(' + ');
      title.push(strings.title[keys[i]].replace('%' + keys[i] + '%', value));
    }
  }
  title = title.join(' ');

  //set window title
  document.title = title;

  //return h1
  return <h1 className="font-weight-light pb-1">{title}</h1>;
}
