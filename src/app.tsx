import { createRoot } from 'react-dom/client';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

import { TsmlUI } from './components';

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
          mapbox={element.getAttribute('data-mapbox') || undefined}
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
    },
  ]);

  createRoot(element).render(<RouterProvider router={router} />);
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
