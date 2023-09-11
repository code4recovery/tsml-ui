import type { State } from '../types';
import { formatString as i18n, getIndexByKey, useSettings } from '../helpers';
import { title as titleCss } from '../styles';

type TitleProps = {
  state: State;
};

export default function Title({ state: { indexes, input } }: TitleProps) {
  const { strings } = useSettings();

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
        i18n(strings.title.search_with, { search: `‘${input.search}’` })
      );
    } else if (
      key === 'search_near' &&
      input.mode === 'location' &&
      input.search
    ) {
      parts.push(
        i18n(strings.title.search_near, { search: `‘${input.search}’` })
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
          i18n(strings.title[key as keyof typeof strings.title], {
            [key]: value,
          })
        );
      }
    }
  });

  const title = parts.join(' ');

  //set window title
  document.title = title;

  //return h1
  return (
    <h1 aria-live="polite" css={titleCss}>
      {title}
    </h1>
  );
}
