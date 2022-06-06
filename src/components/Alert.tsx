import React from 'react';

import type { MeetingType, State } from '../types';
import Button from './Button';
import { getIndexByKey, strings, settings } from '../helpers';

type AlertProps = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
};

export default function Alert({ state, setState }: AlertProps) {
  return state.error ? (
    <div className="d-flex flex-column gap-3">
      <div className="alert alert-danger text-center m-0">
        {strings.alerts[state.error]}
      </div>
      {state.error === 'bad_data' && (
        <Button onClick={() => location.reload()} text="Reload" />
      )}
    </div>
  ) : state.alert ? (
    <div className="d-flex flex-column gap-3">
      <div className="alert alert-warning text-center m-0">
        {strings.alerts[state.alert]}
      </div>
      {state.alert === 'no_results' && state.input.search && (
        <Button
          onClick={() => {
            state.input.search = '';
            setState({ ...state });
          }}
          className="btn-light btn-outline-secondary"
          text={strings.remove.replace('%filter%', `‘${state.input.search}’`)}
          icon="close"
        />
      )}
      {state.alert === 'no_results' &&
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
                  ) as MeetingType[];
                } else {
                  state.input[filter] = state.input[filter].filter(
                    e => e !== value
                  );
                }
                setState({ ...state });
              }}
              text={strings.remove.replace(
                '%filter%',
                getIndexByKey(state.indexes[filter], value)?.name
              )}
              icon="close"
            />
          ))
        )}
    </div>
  ) : null;
}
