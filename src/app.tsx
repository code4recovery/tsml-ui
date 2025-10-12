import { createRoot } from 'react-dom/client';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  useRouteError,
} from 'react-router-dom';

import { Global } from '@emotion/react';
import { Index, Meeting, TsmlUI } from './components';
import { errorCss, globalCss } from './styles';

// locate element
const element = document.getElementById('tsml-ui');

export let routes: RouteObject[] = [];
export let router: ReturnType<typeof createBrowserRouter>;

if (element) {
  const routes = [
    {
      path: '/*',
      element: (
        <TsmlUI
          google={element.getAttribute('data-google') || undefined}
          hashRouting={!!element.getAttribute('data-path')}
          // eslint-disable-next-line no-undef
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
      children: [
        {
          index: true,
          element: <Index />,
        },
        {
          path: ':slug',
          element: <Meeting />,
        },
      ],
    },
  ];

  const basename = element.getAttribute('data-path');

  // if landing on the page with the meeting param, redirect to that meeting
  const params = new URLSearchParams(window.location.search);
  const meeting = params.get('meeting');
  if (meeting) {
    params.delete('meeting');
    const query = params.toString();

    const path = basename
      ? `/${basename.replace(/^\//, '').replace(/\/$/, '')}/${meeting}${
          query ? `?${query}` : ''
        }`
      : `${window.location.pathname}#/${meeting}${query ? `?${query}` : ''}`;

    window.history.replaceState({}, '', path);
  }

  const router = basename
    ? createBrowserRouter(routes, { basename })
    : createHashRouter(routes);

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
