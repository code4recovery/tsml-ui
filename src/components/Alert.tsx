import type { State } from '../types';
import Button from './Button';
import { formatString as i18n, getIndexByKey, useSettings } from '../helpers';
import { alertCss, errorCss } from '../styles';

type AlertProps = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
};

export default function Alert({ state, setState }: AlertProps) {
  const { settings, strings } = useSettings();
  return state.error ? (
    <div css={errorCss}>{state.error}</div>
  ) : state.alert ? (
    <>
      <div css={alertCss}>{state.alert}</div>
      {state.alert === strings.no_results && state.input.search && (
        <Button
          onClick={() => {
            state.input.search = '';
            setState({ ...state });
          }}
          text={i18n(strings.remove, { filter: `‘${state.input.search}’` })}
          icon="close"
        />
      )}
      {state.alert === strings.no_results &&
        settings.filters.map(filter =>
          state.input[filter].map(value => (
            <Button
              key={value}
              icon="close"
              onClick={() => {
                //todo fix how ugly this is
                if (filter === 'weekday') {
                  state.input[filter] = state.input[filter].filter(
                    e => e !== value
                  ) as TSMLReactConfig['weekdays'];
                } else if (filter === 'time') {
                  state.input[filter] = state.input[filter].filter(
                    e => e !== value
                  ) as TSMLReactConfig['times'];
                } else {
                  state.input[filter] = state.input[filter].filter(
                    e => e !== value
                  );
                }
                setState({ ...state });
              }}
              text={i18n(strings.remove, {
                filter: getIndexByKey(state.indexes[filter], value)?.name,
              })}
            />
          ))
        )}
    </>
  ) : null;
}
