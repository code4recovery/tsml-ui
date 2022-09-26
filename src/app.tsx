import ReactDOM from 'react-dom';

import { TsmlUI } from './components';

//locate element
const element = document.getElementById('tsml-ui');

if (element) {
  ReactDOM.render(
    <TsmlUI
      google={element.getAttribute('data-google')}
      mapbox={element.getAttribute('data-mapbox')}
      src={element.getAttribute('data-src')}
      timezone={element.getAttribute('data-timezone')}
    />,
    element
  );
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
