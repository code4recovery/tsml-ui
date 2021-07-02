import ReactDOM from 'react-dom';

import { TsmlUI } from './components';

//locate element
let element = document.getElementById('tsml-ui');

//legacy support, can discontinue once current sites are migrated (as of Jul 1 2021)
if (!element) {
  [element] = document.getElementsByTagName('meetings');
}

if (element) {
  ReactDOM.render(
    <TsmlUI
      {...{
        json: element.getAttribute('data-src') || element.getAttribute('src'),
        mapbox:
          element.getAttribute('data-mapbox') || element.getAttribute('mapbox'),
        timezone:
          element.getAttribute('data-timezone') || tsml_react_config?.timezone,
      }}
    />,
    element
  );
} else {
  console.warn('Could not find a div#tsml-ui element in your HTML');
}
