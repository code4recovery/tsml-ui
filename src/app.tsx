import { createRoot } from 'react-dom/client';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { default as TsmlUI, loader as tsmlUiLoader } from './components/TsmlUI';

// locate element
const element = document.getElementById('tsml-ui');

export let routes: RouteObject[] = [];
export let router: ReturnType<typeof createBrowserRouter>;

if (element) {
  const path = element.getAttribute('data-path') || undefined;
  const tsml = (
    <TsmlUI
      google={element.getAttribute('data-google') || undefined}
      mapbox={element.getAttribute('data-mapbox') || undefined}
      path={path}
      settings={
        typeof tsml_react_config === 'undefined'
          ? undefined
          : // eslint-disable-next-line no-undef
            tsml_react_config
      }
      src={element.getAttribute('data-src') || undefined}
      timezone={element.getAttribute('data-timezone') || undefined}
    />
  );

  const router = createBrowserRouter([
    {
      path: path || '/*',
      element: tsml,
      loader: tsmlUiLoader,
      children: path
        ? [
            {
              path: `${path}/:meetingSlug`,
              element: tsml,
              loader: tsmlUiLoader,
            },
          ]
        : undefined,
    },
  ]);

  createRoot(element).render(<RouterProvider router={router} />);
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
