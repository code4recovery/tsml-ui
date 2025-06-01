import { useSearchParams } from 'react-router-dom';
import { getIndexByKey, formatString as i18n } from '../helpers';
import { useData, useSettings } from '../hooks';

export default function Title() {
  const { indexes } = useData();
  const [searchParams] = useSearchParams();
  const { strings } = useSettings();

  // build title from strings.title
  const parts: string[] = [];

  Object.keys(strings.title).forEach(key => {
    if (key === 'meetings') {
      parts.push(strings.meetings);
    } else if (
      key === 'search_with' &&
      searchParams.get('mode') === 'search' &&
      searchParams.has('search')
    ) {
      parts.push(
        i18n(strings.title.search_with, {
          search: `‘${searchParams.get('search')}’`,
        })
      );
    } else if (
      key === 'search_near' &&
      searchParams.get('mode') === 'location' &&
      searchParams.has('search')
    ) {
      parts.push(
        i18n(strings.title.search_near, {
          search: `‘${searchParams.get('search')}’`,
        })
      );
    } else if (searchParams.has(key) && indexes[key as keyof typeof indexes]) {
      const value = searchParams
        .get(key)
        ?.split('/')
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
    }
  });

  const title = parts.join(' ');

  // set window title
  document.title = title;

  return <h1 aria-live="polite">{title}</h1>;
}
