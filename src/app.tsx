import { createRoot } from 'react-dom/client';

import { TsmlUI } from './components';

// locate element
const element = document.getElementById('tsml-ui');

if (element) {
  createRoot(element).render(
    <TsmlUI
      google={element.getAttribute('data-google') || undefined}
      mapbox={element.getAttribute('data-mapbox') || undefined}
      settings={
        typeof tsml_react_config === 'undefined' ? undefined : tsml_react_config
      }
      src={element.getAttribute('data-src') || undefined}
      timezone={element.getAttribute('data-timezone') || undefined}
    />
  );
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
