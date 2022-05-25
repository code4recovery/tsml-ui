import React from 'react';

import Button from './Button';
import { getIndexByKey, strings, settings } from '../helpers';

export default function Alert({ state, setState }) {
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
                state.input[filter] = state.input[filter].filter(
                  e => e !== value
                );
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
