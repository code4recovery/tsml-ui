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
import { filterMeetingData, loadMeetingData, translateGoogleSheet } from './helpers/data';

import { settings } from './settings';

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
  }

  distance(lat1, lon1, lat2, lon2) {
      // Calculate the distance as the crow flies between two geometric points
      // Adapted from: https://www.geodatasource.com/developers/javascript
      if ((lat1 == lat2) && (lon1 == lon2)) {
          return 0;
      } else {
          var radlat1 = Math.PI * lat1 / 180;
          var radlat2 = Math.PI * lat2 / 180;
          var radtheta = Math.PI * (lon1 - lon2) / 180;
          var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          if (dist > 1) {
              dist = 1;
          }
          dist = Math.acos(dist);
          dist = dist * 12436.2 / Math.PI;  // 12436.2 = 180 * 60 * 1.1515

          return dist;
      }
  }

  setUserLatLng(position) {
    // Callback function invoked when user allows latitude/longitude to be probed
    this.setState({
      user_latitude: position.coords.latitude,
      user_longitude: position.coords.longitude,
      geolocation: true,
    })
    this.state.meetings[0].distance = this.distance(
      this.state.user_latitude,
      this.state.user_longitude,
      this.state.meetings[0].latitude,
      this.state.meetings[0].longitude,
    );
    console.log(this.state.meetings[0]);
    console.log(`latitude: ${ this.state.user_latitude } | longitude: ${ this.state.user_longitude }`);
  }

  componentDidMount() {
    //if this is empty it'll be reported in fetch()s error handler
    const json = element.getAttribute('src');

    //this is the default way to specify a mapbox key
    if (element.getAttribute('mapbox')) {
      settings.keys.mapbox = element.getAttribute('mapbox');
    }

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
      )
      .then(result => {
        // Find the end user's location, if given permission. Load after JSON to ensure
        // that we can update distances.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(this.setUserLatLng.bind(this));
        }
      });
  }

  //function for components to set global state
  setAppState(key, value) {
    this.setState({ [key]: value });
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
    const filteredSlugs = filterMeetingData(this.state);

    //show alert?
    this.state.alert = filteredSlugs.length ? null : 'no_results';

    //make map update
    this.state.map_initialized = false;

    return (
      <div className="container-fluid py-3 d-flex flex-column">
        {this.state.input.meeting && (
          <Meeting state={this.state} setAppState={this.setAppState} />
        )}
        {!this.state.input.meeting && (
          <>
            {settings.defaults.title && <Title state={this.state} />}
            <Controls state={this.state} setAppState={this.setAppState} />
            <Alert state={this.state} />
            {filteredSlugs.length > 0 && (
              <>
                {this.state.input.view === 'list' && (
                  <Table
                    state={this.state}
                    setAppState={this.setAppState}
                    filteredSlugs={filteredSlugs}
                  />
                )}
                {this.state.input.view === 'map' && (
                  <Map
                    state={this.state}
                    setAppState={this.setAppState}
                    filteredSlugs={filteredSlugs}
                  />
                )}
              </>
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
