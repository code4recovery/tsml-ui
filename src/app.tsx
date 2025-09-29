import { createRoot } from 'react-dom/client';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  useRouteError,
} from 'react-router-dom';

import { Global } from '@emotion/react';
import { TsmlUI } from './components';
import { errorCss, globalCss } from './styles';

// locate element
const element = document.getElementById('tsml-ui');

export let routes: RouteObject[] = [];
export let router: ReturnType<typeof createBrowserRouter>;

if (element) {
  const router = createBrowserRouter([
    {
      path: '/*',
      element: (
        <TsmlUI
          google={element.getAttribute('data-google') || undefined}
          settings={
            typeof tsml_react_config === 'undefined'
              ? undefined
              : // eslint-disable-next-line no-undef
                tsml_react_config
          }
          src={element.getAttribute('data-src') || undefined}
          timezone={element.getAttribute('data-timezone') || undefined}
        />
      ),
      errorElement: <ErrorBoundary />,
    },
  ]);

  createRoot(element).render(<RouterProvider router={router} />);
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}

function ErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : 'Unknown error';
  return (
    <>
      <Global styles={globalCss} />
      <div>
        <div css={errorCss}>{message}</div>
      </div>
    </>
  );
}
