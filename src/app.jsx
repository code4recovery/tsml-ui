import React from 'react';
import ReactDOM from 'react-dom';

import Alert from './components/alert';
import Controls from './components/controls';
import Loading from './components/loading';
import Map from './components/map';
import Meeting from './components/meeting';
import Table from './components/table';
import Title from './components/title';
import { getQueryString, setQueryString } from './helpers/query-string';
import {
  filterMeetingData,
  loadMeetingData,
  translateGoogleSheet,
} from './helpers/data';
import { settings } from './helpers/settings';

//locate first <meetings> element
const [element] = document.getElementsByTagName('meetings');

class App extends React.Component {
  constructor() {
    super();

    //initialize state
    this.state = {
      alert: null,
      capabilities: {
        coordinates: false,
        day: false,
        distance: false,
        geolocation: false,
        map: false,
        region: false,
        time: false,
        type: false,
      },
      error: null,
      input: getQueryString(location.search),
      indexes: {
        day: [],
        distance: [],
        region: [],
        time: [],
        type: [],
      },
      loading: true,
      map_initialized: false,
      meetings: [],
    };

    //need to bind this for the function to access `this`
    this.setAppState = this.setAppState.bind(this);
    this.setMapInitialized = this.setMapInitialized.bind(this);
  }

  componentDidMount() {
    //if this is empty it'll be reported in fetch()s error handler
    const json = element.getAttribute('src');

    //this is the default way to specify a mapbox key
    if (element.getAttribute('mapbox')) {
      settings.keys.mapbox = element.getAttribute('mapbox');
    }

    //enabling forward / back buttons
    window.addEventListener('popstate', () => {
      this.setState({ input: getQueryString(location.search) });
    });

    //fetch json data file and build indexes
    fetch(json)
      .then(result => {
        return result.json();
      })
      .then(
        result => {
          //checks if src is google sheet and translates it if so
          if (json.includes('spreadsheets.google.com')) {
            result = translateGoogleSheet(result);
          }

          const [meetings, indexes, capabilities] = loadMeetingData(
            result,
            this.state.capabilities
          );

          this.setState({
            capabilities: capabilities,
            indexes: indexes,
            meetings: meetings,
            loading: false,
          });
        },
        error => {
          console.error('JSON fetch error: ' + error);
          this.setState({
            error: json ? 'bad_data' : 'no_data',
            loading: false,
          });
        }
      );
  }

  //function for components to set global state
  setAppState(key, value) {
    if (key && typeof key === 'object') {
      //used when setting both input and indexes when geocoding
      this.setState(key);
    } else {
      this.setState({ [key]: value });
    }
  }

  //function for map component to say it's ready without re-rendering
  setMapInitialized() {
    this.state.map_initialized = true;
  }

  render() {
    //show loading spinner?
    if (this.state.loading) return <Loading />;

    //apply filters to query string
    setQueryString(this.state);

    //filter data
    const filteredSlugs = filterMeetingData(this.state, this.setAppState);

    //show alert?
    this.state.alert = filteredSlugs.length ? null : 'no_results';

    //make map update
    this.state.map_initialized = false;

    return (
      <div className="container-fluid py-3 d-flex flex-column">
        {this.state.input.meeting ? (
          <Meeting state={this.state} setAppState={this.setAppState} />
        ) : (
          <>
            {settings.title && <Title state={this.state} />}
            <Controls state={this.state} setAppState={this.setAppState} />
            <Alert state={this.state} />
            {filteredSlugs.length > 0 && this.state.input.view === 'list' && (
              <Table
                state={this.state}
                setAppState={this.setAppState}
                filteredSlugs={filteredSlugs}
              />
            )}
            {filteredSlugs.length > 0 && this.state.input.view === 'map' && (
              <Map
                state={this.state}
                setAppState={this.setAppState}
                setMapInitialized={this.setMapInitialized}
                filteredSlugs={filteredSlugs}
              />
            )}
          </>
        )}
      </div>
    );
  }
}

if (element) {
  ReactDOM.render(<App />, element);
} else {
  console.warn('Could not find a <meetings> element in your HTML');
}
