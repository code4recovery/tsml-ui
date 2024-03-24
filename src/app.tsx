import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  createHashRouter,
  defer,
  LoaderFunctionArgs,
  RouterProvider,
} from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
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

  const loader = async ({ params }: LoaderFunctionArgs) => {
    console.log('loader', params, src, settings, strings, timezone);
    return defer({
      fetcher: fetchJson({ google, settings, src, strings, timezone }),
    });
  };

  const routes = [
    {
      children: [
        {
          element: <Index />,
          path: '',
          loader: () => {
            console.log('index loader');
            return null;
          },
        },
        { element: <Meeting />, loader: meetingLoader, path: `:meetingSlug` },
      ],
      element: <TsmlUI settings={settings} strings={strings} />,
      errorElement: <ErrorBoundary />,
      loader,
    },
  ];

  console.log('creating router', basename);

  const router = basename
    ? createBrowserRouter(routes, { basename })
    : createHashRouter(routes);

  console.log('creating root', basename);
  createRoot(element).render(<RouterProvider router={router} />);
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
