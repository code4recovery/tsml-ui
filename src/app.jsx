import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import {
  Alert,
  Controls,
  Loading,
  Map,
  Meeting,
  Table,
  Title,
} from './components';
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
    meetings: [],
  });

  //enable forward & back buttons
  useEffect(() => {
    const popstateListener = () => {
      setState({ ...state, input: getQueryString(location.search) });
    };
    window.addEventListener('popstate', popstateListener);
    return () => {
      window.removeEventListener('popstate', popstateListener);
    };
  }, []);

  //load data once from json
  if (state.loading) {
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

  //apply input changes to query string
  setQueryString(state.input);

  //filter data
  const filteredSlugs = filterMeetingData(state, setState);

  //show alert?
  state.alert = filteredSlugs.length ? null : 'no_results';

  return state.loading ? (
    <Loading />
  ) : (
    <div className="container-fluid py-3 d-flex flex-column">
      {state.input.meeting ? (
        <Meeting state={state} setState={setState} />
      ) : (
        <>
          {!!settings.show.title && <Title state={state} />}
          {!!settings.show.controls && (
            <Controls state={state} setState={setState} />
          )}
          <Alert state={state} />
          {!!filteredSlugs.length && state.input.view === 'list' && (
            <Table
              state={state}
              setState={setState}
              filteredSlugs={filteredSlugs}
            />
          )}
          {!!filteredSlugs.length && state.input.view === 'map' && (
            <Map
              state={state}
              setState={setState}
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
