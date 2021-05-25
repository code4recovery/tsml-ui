import React from 'react';

import { strings } from '../helpers';

export default function Alert({ alert, error }) {
  return error ? (
    <div className="alert alert-danger">{strings.alerts[error]}</div>
  ) : alert ? (
    <div className="alert alert-warning">{strings.alerts[alert]}</div>
  ) : null;
}
