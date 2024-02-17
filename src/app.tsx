import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createHashRouter,
  defer,
  isRouteErrorResponse,
  RouterProvider,
  useRouteError,
} from 'react-router-dom';

import Index from './components/Index';
import Meeting, { loader as meetingLoader } from './components/Meeting';
import TsmlUI from './components/TsmlUI';
import { fetchJson, mergeSettings } from './helpers';

// locate element
const element = document.getElementById('tsml-ui');

if (element) {
  // get settings
  const basename = element.getAttribute('data-path') || undefined;
  const google = element.getAttribute('data-google') || undefined;
  const mapbox = element.getAttribute('data-mapbox') || undefined;
  const src = element.getAttribute('data-src') || undefined;
  const userSettings =
    // eslint-disable-next-line no-undef
    typeof tsml_react_config === 'object' ? tsml_react_config : {};
  const timezone = element.getAttribute('data-timezone') || undefined;

  // get full settings and strings
  const { settings, strings } = mergeSettings({
    ...userSettings,
    mapbox,
    timezone,
  });

  // loader function is here instead of in the TSML UI component so these vars can be available
  const loader = () =>
    defer({
      data: fetchJson({ google, settings, src, strings, timezone }),
    });

  const routes = [
    {
      children: [
        { path: '', element: <Index /> },
        { path: `:meetingSlug`, element: <Meeting />, loader: meetingLoader },
      ],
      element: <TsmlUI settings={settings} strings={strings} />,
      errorElement: <ErrorBoundary />,
      loader,
    },
  ];

  const router = basename
    ? createBrowserRouter(routes, { basename })
    : createHashRouter(routes);

  createRoot(element).render(<RouterProvider router={router} />);
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}

function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <div>This page doesnt exist!</div>;
    }

    if (error.status === 401) {
      return <div>You arent authorized to see this</div>;
    }

    if (error.status === 503) {
      return <div>Looks like our API is down</div>;
    }

    if (error.status === 418) {
      return <div>🫖</div>;
    }
  }

  return <div>{JSON.stringify(error)}</div>;
}
