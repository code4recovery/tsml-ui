import React from 'react';
import { createRoot } from 'react-dom/client';
import { TsmlUI } from './components';

//locate element
const element = document.getElementById('tsml-ui');

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
