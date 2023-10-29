import { createRoot } from 'react-dom/client';
import { StateContextProvider } from './components/StateContext';

import { TsmlUI } from './components';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

// locate element
const el = document.getElementById('tsml-ui');

export let routes: RouteObject[] = [];
export let router: ReturnType<typeof createBrowserRouter>;

if (el) {
  routes = [
    {
      path: '/*',
      element: (
        <StateContextProvider
          google={el.getAttribute('data-google') || undefined}
          mapbox={el.getAttribute('data-mapbox') || undefined}
          settings={
            typeof tsml_react_config === 'undefined'
              ? undefined
              : tsml_react_config
          }
          src={el.getAttribute('data-src') || undefined}
          timezone={el.getAttribute('data-timezone') || undefined}
        >
          <TsmlUI />
        </StateContextProvider>
      ),
    },
  ];
  router = createBrowserRouter(routes);
  createRoot(el).render(<RouterProvider router={router} />);
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
