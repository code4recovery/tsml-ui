import { getIndexByKey, formatString as i18n } from '../helpers';
import { useData, useError, useFilter, useInput, useSettings } from '../hooks';
import { alertCss, errorCss } from '../styles';

import Button from './Button';

export default function Alert() {
  const { indexes } = useData();
  const { error } = useError();
  const { alert } = useFilter();
  const { input, setInput } = useInput();
  const { settings, strings } = useSettings();
  return error ? (
    <div css={errorCss}>{error}</div>
  ) : alert ? (
    <>
      <div css={alertCss}>{alert}</div>
      {alert === strings.no_results && input.search && (
        <Button
          onClick={() => setInput(input => ({ ...input, search: '' }))}
          text={i18n(strings.remove, { filter: input.search })}
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
                setInput(input => ({
                  ...input,
                  [filter]: input[filter].filter(item => item !== value),
                }));
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
