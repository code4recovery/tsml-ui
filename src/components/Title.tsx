import { getIndexByKey, formatString as i18n } from '../helpers';
import { useData, useInput, useSettings } from '../hooks';

export default function Title() {
  const { indexes } = useData();
  const { input, latitude, longitude } = useInput();
  const { strings } = useSettings();

  // build title from strings.title
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
        i18n(strings.title.search_with, {
          search: input.search,
        })
      );
    } else if (
      key === 'search_near' &&
      input.mode === 'location' &&
      input.search
    ) {
      parts.push(
        i18n(strings.title.search_near, {
          search: input.search,
        })
      );
    } else if (
      input[key as keyof typeof input] &&
      indexes[key as keyof typeof indexes] &&
      key !== 'distance'
    ) {
      const value = (input[key as keyof typeof input] as string[])
        .map(
          value =>
            getIndexByKey(indexes[key as keyof typeof indexes], value)?.name
        )
        .join(' + ');
      if (value?.length) {
        parts.push(
          i18n(strings.title[key as keyof typeof strings.title], {
            [key]: value,
          })
        );
      }
    } else if (key === 'distance' && latitude && longitude) {
      // todo
      parts.push(
        i18n(strings.title.distance, {
          distance: `${input.distance}`,
        })
      );
    }
  });

  const title = parts.join(' ');

  // set window title
  document.title = title;

  return <h1 aria-live="polite">{title}</h1>;
}
