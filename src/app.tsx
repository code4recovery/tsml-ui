import { createRoot } from 'react-dom/client';
import { TsmlUI } from './components';

//locate element
let element = document.getElementById('tsml-ui');

//legacy support, can remove once sites have had a chance to migrate (implemented Jul 1 2021)
if (!element) {
  [element] = document.getElementsByTagName(
    'meetings'
  ) as unknown as HTMLElement[];
}

if (element) {
  createRoot(element).render(
    <TsmlUI
      {...{
        json: element.getAttribute('data-src') || element.getAttribute('src'),
        mapbox:
          element.getAttribute('data-mapbox') || element.getAttribute('mapbox'),
        timezone:
          element.getAttribute('data-timezone') || tsml_react_config?.timezone,
      }}
    />
  );
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
