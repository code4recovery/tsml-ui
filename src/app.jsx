import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import Alert from './components/alert';
import Controls from './components/controls';
import Loading from './components/loading';
import Map from './components/map';
import Meeting from './components/meeting';
import Table from './components/table';
import Title from './components/title';
import {
  filterMeetingData,
  getQueryString,
  loadMeetingData,
  translateGoogleSheet,
  setQueryString,
  settings,
} from './helpers';

//locate first <meetings> element
const [element] = document.getElementsByTagName('meetings');

function App() {
  const [state, setState] = useState({
    alert: null,
    capabilities: {
      coordinates: false,
      distance: false,
      geolocation: false,
      map: false,
      region: false,
      time: false,
      type: false,
      weekday: false,
    },
    error: null,
    input: getQueryString(location.search),
    indexes: {
      distance: [],
      region: [],
      time: [],
      type: [],
      weekday: [],
    },
    loading: true,
    map_initialized: false,
    meetings: [],
  });

  if (state.loading) {
    console.log('loading');
    //if this is empty it'll be reported in fetch()s error handler
    const json = element.getAttribute('src');

    //this is the default way to specify a mapbox key
    if (element.getAttribute('mapbox')) {
      settings.map.key = element.getAttribute('mapbox');
    }

    //fetch json data file and build indexes
    fetch(json)
      .then(result => result.json())
      .then(
        result => {
          //checks if src is google sheet and translates it if so
          if (json.includes('spreadsheets.google.com')) {
            result = translateGoogleSheet(result);
          }

          const [meetings, indexes, capabilities] = loadMeetingData(
            result,
            state.capabilities
          );

          setState({
            ...state,
            capabilities: capabilities,
            indexes: indexes,
            meetings: meetings,
            loading: false,
          });
        },
        error => {
          console.error('JSON fetch error: ' + error);
          setState({
            ...state,
            error: json ? 'bad_data' : 'no_data',
            loading: false,
          });
        }
      );
  }

  //enable forward & back buttons
  const listenToPopstate = () => {
    console.log('listenToPopstate');
    setState({ ...state, input: getQueryString(window.location.search) });
  };
  useState(() => {
    window.addEventListener('popstate', listenToPopstate);
    return () => {
      window.removeEventListener('popstate', listenToPopstate);
    };
  }, []);

  //function for components to set global state
  const setAppState = (key, value) => {
    if (key && typeof key === 'object') {
      setState(key);
    } else {
      setState({ ...state, [key]: value });
    }
  };

  //function for map component to say it's ready without re-rendering
  const setMapInitialized = () => {
    state.map_initialized = true;
  };

  //apply filters to query string
  setQueryString(state);

  //filter data
  const filteredSlugs = filterMeetingData(state, setAppState);

  //show alert?
  state.alert = filteredSlugs.length ? null : 'no_results';

  return state.loading ? (
    <Loading />
  ) : (
    <div className="container-fluid py-3 d-flex flex-column">
      {state.input.meeting ? (
        <Meeting state={state} setAppState={setAppState} />
      ) : (
        <>
          {settings.show.title && <Title state={state} />}
          {settings.show.controls && (
            <Controls state={state} setAppState={setAppState} />
          )}
          <Alert state={state} />
          {filteredSlugs.length > 0 && state.input.view === 'list' && (
            <Table
              state={state}
              setAppState={setAppState}
              filteredSlugs={filteredSlugs}
            />
          )}
          {filteredSlugs.length > 0 && state.input.view === 'map' && (
            <Map
              state={state}
              setAppState={setAppState}
              setMapInitialized={setMapInitialized}
              filteredSlugs={filteredSlugs}
            />
          )}
        </>
      )}
    </div>
  );
}

if (element) {
  ReactDOM.render(<App />, element);
} else {
  console.warn('Could not find a <meetings> element in your HTML');
}
