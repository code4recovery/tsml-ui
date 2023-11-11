import { createRoot } from 'react-dom/client';
import { TsmlUI } from './components';
import {
  RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';

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
              : tsml_react_config
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
