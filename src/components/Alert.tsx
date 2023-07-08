import type { State } from '../types';
import Button from './Button';
import { formatString as i18n, getIndexByKey, useSettings } from '../helpers';

type AlertProps = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
};

export default function Alert({ state, setState }: AlertProps) {
  const { settings, strings } = useSettings();
  return state.error ? (
    <div className="alert alert-danger text-center m-0">{state.error}</div>
  ) : state.alert ? (
    <div className="d-flex flex-column gap-3">
      <div className="alert alert-warning text-center m-0">{state.alert}</div>
      {state.alert === strings.no_results && state.input.search && (
        <Button
          onClick={() => {
            state.input.search = '';
            setState({ ...state });
          }}
          className="btn-light btn-outline-secondary"
          text={i18n(strings.remove, { filter: `‘${state.input.search}’` })}
          icon="close"
        />
      )}
      {state.alert === strings.no_results &&
        settings.filters.map(filter =>
          state.input[filter].map(value => (
            <Button
              key={value}
              className="btn-light btn-outline-secondary"
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
                } else if (filter === 'type') {
                  state.input[filter] = state.input[filter].filter(
                    e => e !== value
                  ) as Array<MeetingType | MetaType>;
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
              icon="close"
            />
          ))
        )}
    </div>
  ) : null;
}
