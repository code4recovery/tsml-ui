import React from 'react';

import type { State } from '../types';
import { getIndexByKey, strings } from '../helpers';

type TitleProps = {
  state: State;
};

export default function Title({ state: { indexes, input } }: TitleProps) {
  //loading
  if (!indexes || !input) return null;

  //build title from strings.title
  const parts: string[] = [];

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
    } else if (indexes[key as keyof typeof indexes]) {
      const value = input[key as keyof typeof indexes]
        .map(
          value =>
            getIndexByKey(indexes[key as keyof typeof indexes], value)?.name
        )
        .join(' + ');
      if (value.length) {
        parts.push(
          strings.title[key as keyof typeof strings.title].replace(
            `%${key}%`,
            value
          )
        );
      }
    }
  });

  const title = parts.join(' ');

  //set window title
  document.title = title;

  //return h1
  return <h1 className="fw-light mb-n1">{title}</h1>;
}