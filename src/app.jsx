import React from 'react';
import ReactDOM from 'react-dom';

import qs from 'query-string';
import merge from 'deepmerge';

import Alert from './components/alert';
import Controls from './components/controls';
import Map from './components/map';
import Meeting from './components/meeting';
import Table from './components/table';
import Title from './components/title';

import GetInput from './helpers/get-input';
import GoogleSheet from './helpers/google-sheet';
import LoadData from './helpers/load-data';

import { settings } from './settings';

//locate <meetings> element
let element = document.getElementsByTagName('meetings');
if (!element.length) {
  console.error('Could not find a <meetings> element in your HTML');
}
element = element[0];

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
      input: GetInput(location.search),
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
            result = GoogleSheet(result);
          }

          const [meetings, indexes, capabilities] = LoadData(
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

  //get common matches between arrays (for meeting filtering)
  getCommonElements(arrays) {
    var currentValues = {};
    var commonValues = {};
    if (!arrays.length) return [];
    for (var i = arrays[0].length - 1; i >= 0; i--) {
      //Iterating backwards for efficiency
      currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
    }
    for (var i = arrays.length - 1; i > 0; i--) {
      var currentArray = arrays[i];
      for (var j = currentArray.length - 1; j >= 0; j--) {
        if (currentArray[j] in currentValues) {
          commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
        }
      }
      currentValues = commonValues;
      commonValues = {};
    }
    return Object.keys(currentValues);
  }

  //function for components to set global state
  setAppState(key, value) {
    this.setState({ [key]: value });
  }

  //function for map component to say it's done without re-render
  setMapInitialized() {
    this.state.map_initialized = true;
  }

  render() {
    let filteredSlugs = [];

    if (!this.state.loading) {
      //run filters on meetings
      let filterFound = false;
      let query = {};
      const existingQuery = qs.parse(location.search);

      //filter by region, day, time, and type
      for (let i = 0; i < settings.filters.length; i++) {
        let filter = settings.filters[i];
        if (
          this.state.input[filter].length &&
          this.state.indexes[filter].length
        ) {
          filterFound = true;
          filteredSlugs.push(
            [].concat.apply(
              [],
              this.state.input[filter].map(x => {
                return this.state.indexes[filter].find(y => y.key == x).slugs;
              })
            )
          );
          if (filter != 'day') {
            query[filter] = this.state.input[filter].join('/');
          }
        }
      }

      //decide whether to set day in the query string (todo refactor)
      if (this.state.input.day.length && this.state.indexes.day.length) {
        if (
          !settings.defaults.today ||
          existingQuery.search ||
          existingQuery.day ||
          existingQuery.region ||
          existingQuery.district ||
          existingQuery.time ||
          existingQuery.type ||
          this.state.input.day.length > 1 ||
          this.state.input.day[0] != new Date().getDay()
        ) {
          query.day = this.state.input.day.join('/');
        }
      } else if (settings.defaults.today) {
        query.day = 'any';
      }

      //keyword search
      if (this.state.input.search.length) {
        filterFound = true;
        query['search'] = this.state.input.search;
        let needle = this.state.input.search.toLowerCase();
        let matches = this.state.meetings.filter(function(meeting) {
          return meeting.search.search(needle) !== -1;
        });
        filteredSlugs.push(
          [].concat.apply([], matches.map(meeting => meeting.slug))
        );
      }

      //set mode property
      if (this.state.input.mode != settings.defaults.mode)
        query.mode = this.state.input.mode;

      //set map property if set
      if (this.state.input.view != settings.defaults.view)
        query.view = this.state.input.view;

      //set inside page property if set
      if (this.state.input.meeting) query.meeting = this.state.input.meeting;

      //create a query string with only values in use
      query = qs.stringify(
        merge(
          merge(existingQuery, {
            day: undefined,
            mode: undefined,
            region: undefined,
            search: undefined,
            meeting: undefined,
            time: undefined,
            type: undefined,
            view: undefined,
          }),
          query
        )
      );

      //un-url-encode the separator
      query = query.split(encodeURIComponent('/')).join('/');

      //set the query string with html5
      window.history.pushState(
        '',
        '',
        query.length ? '?' + query : window.location.pathname
      );

      //do the filtering, if necessary
      filteredSlugs = filterFound
        ? this.getCommonElements(filteredSlugs) //get intersection of slug arrays
        : this.state.meetings.map(meeting => meeting.slug); //get everything

      //show alert
      this.state.alert = filteredSlugs.length ? null : 'no_results';

      //make map update
      this.state.map_initialized = false;
    }

    return (
      <div className="container-fluid py-3 d-flex flex-column">
        <Title state={this.state} />
        <Controls state={this.state} setAppState={this.setAppState} />
        <Alert state={this.state} filteredSlugs={filteredSlugs} />
        <Table
          state={this.state}
          setAppState={this.setAppState}
          filteredSlugs={filteredSlugs}
        />
        <Map
          state={this.state}
          setAppState={this.setAppState}
          filteredSlugs={filteredSlugs}
        />
        <Meeting state={this.state} setAppState={this.setAppState} />
      </div>
    );
  }
}

ReactDOM.render(<App />, element);
