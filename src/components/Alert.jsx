import React from 'react';

import Button from './Button';
import { strings, settings } from '../helpers';

export default function Alert({ state, setState }) {
  const removeFilterValue = (filter, value) => {
    state.input[filter] = state.input[filter].filter(e => e !== value);
    setState({ ...state });
  };

  const getFilterName = (filter, value) => {
    return state.indexes[filter].find(index => index.key === value)?.name;
  };

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
      {state.alert === 'no_results' &&
        settings.filters.map(filter =>
          state.input[filter].map(value => (
            <Button
              key={value}
              onClick={() => removeFilterValue(filter, value)}
              text={`Remove ${getFilterName(filter, value)}`}
              icon="close"
            />
          ))
        )}
    </div>
  ) : null;
}
