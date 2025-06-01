import { useSearchParams } from 'react-router-dom';

import { getIndexByKey, formatString as i18n } from '../helpers';
import { useData, useFilter, useSettings } from '../hooks';
import { alertCss, errorCss } from '../styles';

import Button from './Button';

export default function Alert() {
  const { error, indexes } = useData();
  const { alert } = useFilter();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, strings } = useSettings();
  return error ? (
    <div css={errorCss}>{error}</div>
  ) : alert ? (
    <>
      <div css={alertCss}>{alert}</div>
      {alert === strings.no_results && searchParams.has('search') && (
        <Button
          onClick={() => {
            searchParams.delete('search');
            setSearchParams(searchParams);
          }}
          text={i18n(strings.remove, {
            filter: `‘${searchParams.get('search')}’`,
          })}
          icon="close"
        />
      )}
      {alert === strings.no_results &&
        settings.filters.map(filter =>
          `${searchParams.get(filter)}`.split('/').map(value => (
            <Button
              key={value}
              icon="close"
              onClick={() => {
                searchParams.delete(filter);
                setSearchParams(searchParams);
              }}
              text={i18n(strings.remove, {
                filter: getIndexByKey(indexes[filter], value)?.name,
              })}
            />
          ))
        )}
    </>
  ) : null;
}
