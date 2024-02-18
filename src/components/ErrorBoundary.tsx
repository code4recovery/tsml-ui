import { Global } from '@emotion/react';
import { useRouteError } from 'react-router-dom';

import { globalCss } from '../styles';

import Alert from './Alert';

export default function ErrorBoundary() {
  const error = useRouteError();

  const message =
    error instanceof Error ? error.message : 'An unknown error occurred';

  return (
    <>
      <Global styles={globalCss} />
      <Alert error={message} />
    </>
  );
}
