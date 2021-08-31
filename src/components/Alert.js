import React from 'react';

import { strings } from '../helpers';

export default function Alert({ alert, error }) {
  return error ? (
    <div className="alert alert-danger text-center">
      {strings.alerts[error]}
    </div>
  ) : alert ? (
    <div className="alert alert-warning text-center">
      {strings.alerts[alert]}
    </div>
  ) : null;
}
