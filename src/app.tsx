import ReactDOM from 'react-dom';

import { TsmlUI } from './components';

//locate element
const element = document.getElementById('tsml-ui');

if (element) {
  ReactDOM.render(
    <TsmlUI
      google={element.getAttribute('data-google') || undefined}
      mapbox={element.getAttribute('data-mapbox') || undefined}
      src={element.getAttribute('data-src') || undefined}
      timezone={element.getAttribute('data-timezone') || undefined}
    />,
    element
  );
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
