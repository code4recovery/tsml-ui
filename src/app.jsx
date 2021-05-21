import ReactDOM from 'react-dom';

import { TSML } from './components';

//locate first <meetings> element
const [element] = document.getElementsByTagName('meetings');

//if this is empty it'll be reported in fetch()s error handler
const json = element.getAttribute('src');

//this is the default way to specify a mapbox key
const mapbox = element.getAttribute('mapbox')
  ? element.getAttribute('mapbox')
  : undefined;

if (element) {
  ReactDOM.render(<TSML json={json} mapbox={mapbox} />, element);
} else {
  console.warn('Could not find a <meetings> element in your HTML');
}
