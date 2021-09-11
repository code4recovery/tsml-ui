import React from 'react';
import ReactDOM from 'react-dom';
import TsmlUI from "./components/TsmlUI";

ReactDOM.render(<TsmlUI
  {...{
    json: "/meetings.json",
    mapbox: "pk.eyJ1IjoiY2lnemlnd29uIiwiYSI6ImNrZmg5eG5jNDAwNXoyeHM0MTl4M3ppNmIifQ.I8y80GTABIN495k-su0cMA",
    timezone: 'America/Detroit',
  }}
/>, document.querySelector('#tsml-ui'));
