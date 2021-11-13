import React from 'react';

import Button from './Button';
import { strings } from '../helpers';

export default function Alert({ alert, error }) {
  return error ? (
    <>
      <div className="alert alert-danger text-center">
        {strings.alerts[error]}
      </div>
      {error === 'bad_data' && (
        <Button onClick={() => location.reload()} text="Reload" />
      )}
    </>
  ) : alert ? (
    <div className="alert alert-warning text-center">
      {strings.alerts[alert]}
    </div>
  ) : null;
}
