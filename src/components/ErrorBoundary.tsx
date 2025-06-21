import { isRouteErrorResponse, useRouteError } from 'react-router';

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div style={errorContainerStyle}>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div style={errorContainerStyle}>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}

const errorContainerStyle = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 16,
  marginBlock: 20,
  marginInline: 'auto',
  maxWidth: 1000,
  padding: 20,
};
