import React from 'react';
import ReactDOM from 'react-dom';
import TsmlUI from "./components/TsmlUI";

ReactDOM.render(<TsmlUI
  {...{
    json: "/meetings.json",
    mapbox: null,
    timezone: 'America/Detroit',
  }}
/>, document.querySelector('#tsml-ui'));
