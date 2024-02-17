import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';

import {
  formatString as i18n,
  getIndexByKey,
  useSettings,
  getQueryString,
} from '../helpers';

export default function Title() {
  const { indexes, settings, strings } = useSettings();
  const [searchParams] = useSearchParams();

  const input = getQueryString(searchParams, settings);

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

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <h1 aria-live="polite">{title}</h1>
    </>
  );
}
