import ReactDOM from 'react-dom';

import { TsmlUI } from './components';

//locate element
const element = document.getElementById('tsml-ui');

if (element) {
  ReactDOM.render(
    <TsmlUI
      {...{
        json: element.getAttribute('data-src'),
        mapbox: element.getAttribute('data-mapbox'),
        google: element.getAttribute('data-google'),
        timezone: element.getAttribute('data-timezone'),
      }}
    />,
    element
  );
} else {
  console.warn('TSML UI could not find a div#tsml-ui element');
}
