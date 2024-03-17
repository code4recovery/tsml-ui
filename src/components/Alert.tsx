import { useSearchParams } from 'react-router-dom';

import {
  formatString as i18n,
  getIndexByKey,
  useData,
  useSettings,
} from '../helpers';
import { alertCss, errorCss } from '../styles';

import Button from './Button';

export default function Alert({
  alert,
  error,
}: {
  alert?: string;
  error?: string;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { indexes, input } = useData();
  const { settings, strings } = useSettings();

  return error ? (
    <div css={errorCss}>{error}</div>
  ) : alert ? (
    <>
      <div css={alertCss}>{alert}</div>
      {alert === strings.no_results && input.search && (
        <Button
          onClick={() => {
            searchParams.delete('search');
            setSearchParams(searchParams);
          }}
          text={i18n(strings.remove, { filter: `‘${input.search}’` })}
          icon="close"
        />
      )}
      {alert === strings.no_results &&
        settings.filters.map(filter =>
          input[filter].map(value => (
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
