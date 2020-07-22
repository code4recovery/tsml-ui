import React from 'react';
import cx from 'classnames/bind';

import { strings } from '../helpers/settings';

export default function Alert({ state }) {
  const message = state.error
    ? strings.alerts[state.error]
    : state.alert
    ? strings.alerts[state.alert]
    : null;

  return (
    message && (
      <div
        className={cx('alert', {
          'alert-danger': state.error,
          'alert-warning': state.alert && !state.error,
        })}
      >
        {message}
      </div>
    )
  );
}
