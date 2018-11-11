import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames/bind';
import * as qs from 'query-string';
import merge from 'deepmerge';

import Alert from './components/alert';
import Controls from './components/controls';
import Map from './components/map';
import Table from './components/table';
import Title from './components/title';
import settings from './settings';

//locate <meetings> element
let element = document.getElementsByTagName('meetings');
if (!element.length) console.error('Could not find a <meetings> element in your HTML');
element = element[0];

class App extends Component {
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
			input: {
				center: null,
				day: [],
				district: [],
				mode: settings.defaults.mode,
				query: null,
				radius: null,
				region: [],
				search: '',
				time: [],
				type: [],
				view: settings.defaults.view,
			},
			indexes: {
				day: [],
				region: [],
				time: [],
				type: [],
			},
			loading: true,
			meetings: [],
		};

		//load input from query string
		let querystring = qs.parse(location.search);
		for (let i = 0; i < settings.filters.length; i++) {
			if (querystring[settings.filters[i]]) {
				this.state.input[settings.filters[i]] = querystring[settings.filters[i]].split('/');
			}
		}
		for (let i = 0; i < settings.params.length; i++) {
			if (querystring[settings.params[i]]) {
				this.state.input[settings.params[i]] = querystring[settings.params[i]];
			}
		}

		//need to bind this for the function to access `this`
		this.setAppState = this.setAppState.bind(this);
	}

	componentDidMount() {

		//if this is empty it'll be reported in fetch()s error handler
		const json = element.getAttribute('src');

		//fetch json data file and build indexes
		fetch(json)
			.then(result => {
				//todo google docs support
				return result.json();
			}).then(result => {
				//indexes start as objects, will be converted to arrays
				let indexes = {
					day: {},
					region: {},
					time: {},
					type: {},
				}

				//get a copy of the array
				let capabilities = this.state.capabilities;

				//build index objects for dropdowns
				for (let i = 0; i < result.length; i++) {

					//for readability
					let meeting = result[i];

					//build region index
					if (meeting.region) {
						capabilities.region = true;
						if (meeting.region in indexes.region === false) {
							indexes.region[meeting.region] = {
								key: meeting.region_id,
								name: meeting.region,
								slugs: [],
							};
						}
						indexes.region[meeting.region].slugs.push(meeting.slug);
					}

					//build day index
					if (meeting.day) {
						capabilities.day = true;
						if (meeting.day in indexes.day === false) {
							indexes.day[meeting.day] = {
								key: meeting.day,
								name: settings.strings[settings.days[meeting.day]],
								slugs: [],
							}
						}
						indexes.day[meeting.day].slugs.push(meeting.slug);
					}

					//build time index (can be multiple)
					if (meeting.time) {
						capabilities.time = true;
						let timeParts = meeting.time.split(':');
						meeting.minutes = (parseInt(timeParts[0]) * 60) + parseInt(timeParts[1]);
						meeting.times = [];
						if (meeting.minutes >= 240 && meeting.minutes < 720) { //4am–12pm
							meeting.times.push(0);
						}
						if (meeting.minutes >= 660 && meeting.minutes < 1020) { //11am–5pm
							meeting.times.push(1);
						}
						if (meeting.minutes >= 960 && meeting.minutes < 1260) { //4–9pm
							meeting.times.push(2);
						}
						if (meeting.minutes >= 1200 || meeting.minutes < 300) { //8pm–5am
							meeting.times.push(3);
						}
						for (let j = 0; j < meeting.times.length; j++) {
							if (meeting.times[j] in indexes.time === false) {
								indexes.time[meeting.times[j]] = {
									key: settings.times[meeting.times[j]],
									name: settings.strings[settings.times[meeting.times[j]]],
									slugs: [],
								}
							}
							indexes.time[meeting.times[j]].slugs.push(meeting.slug);
						}
					}

					//build type index (can be multiple)
					if (meeting.types) {
						capabilities.type = true;
						for (let j = 0; j < meeting.types.length; j++) {
							if (meeting.types[j] in indexes.type === false) {
								indexes.type[meeting.types[j]] = {
									key: meeting.types[j],
									name: settings.strings.types[meeting.types[j]],
									slugs: [],
								}
							}
							indexes.type[meeting.types[j]].slugs.push(meeting.slug);
						}
					}

					//build index of map pins
					if (meeting.latitude && meeting.latitude) {
						capabilities.coordinates = true;
					}

					//build search string
					result[i].search = [meeting.name, meeting.location, meeting.location_notes, meeting.notes, meeting.formatted_address].join(' ').toLowerCase();
				}

				//convert region to array and sort by name
				indexes.region = Object.values(indexes.region);
				indexes.region.sort((a, b) => { 
					return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
				});

				//convert day to array and sort by ordinal
				indexes.day = Object.values(indexes.day);
				indexes.day.sort((a, b) => {
					return a.key - b.key;
				});

				//convert time to array and sort by ordinal
				indexes.time = Object.values(indexes.time);
				indexes.time.sort((a, b) => { 
					return settings.times.indexOf(a.key) - settings.times.indexOf(b.key);
				});

				//convert type to array and sort by name
				indexes.type = Object.values(indexes.type);
				indexes.type.sort((a, b) => { 
					return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
				});

				//near me mode enabled on https
				if (capabilities.coordinates) {
					settings.modes.push('location');
					if (window.location.protocol == 'https:') {
						capabilities.geolocation = true;
						settings.modes.push('me');
					}
					if (settings.keys.mapbox) {
						capabilities.map = true;
					}
				}

				//todo filter out unused meetings properties to have a leaner memory footprint

				this.setState({
					capabilities: capabilities,
					indexes: indexes,
					meetings: result,
					loading: false,
				});
			}, error => {
				console.error('JSON fetch error: ' + error);
				this.setState({
					error: json ? 'bad_data' : 'no_data',
					loading: false,
				});
			});
	}

	//function for components to set global state
	setAppState(key, value) {
		this.setState({ [key]: value });		
	}

	//get common matches between arrays (for meeting filtering)
	getCommonElements(arrays) {
		var currentValues = {};
		var commonValues = {};
		if (!arrays.length) return [];
		for (var i = arrays[0].length - 1; i >=0; i--){//Iterating backwards for efficiency
			currentValues[arrays[0][i]] = 1; //Doesn't really matter what we set it to
		}
		for (var i = arrays.length-1; i>0; i--){
			var currentArray = arrays[i];
			for (var j = currentArray.length-1; j >=0; j--){
				if (currentArray[j] in currentValues){
					commonValues[currentArray[j]] = 1; //Once again, the `1` doesn't matter
				}
			}
			currentValues = commonValues;
			commonValues = {};
		}
		return Object.keys(currentValues);
	}

	render() {

		//run filteres on meetings
		let filteredSlugs = [];
		let filterFound = false;
		let query = {};

		//filter by region, day, time, and type
		for (let i = 0; i < settings.filters.length; i++) {
			let filter = settings.filters[i];
			if (this.state.input[filter].length && this.state.indexes[filter].length) {
				filterFound = true;
				query[filter] = this.state.input[filter].join('/');
				filteredSlugs.push([].concat.apply([], this.state.input[filter].map(x => {
					return this.state.indexes[filter].find(y => y.key == x).slugs;
				})));
			}
		}

		//keyword search
		if (this.state.input.search.length) {
			filterFound = true;
			query['search'] = this.state.input.search;
			let needle = this.state.input.search.toLowerCase();
			let matches = this.state.meetings.filter(function(meeting){
				return meeting.search.search(needle) !== -1;
			});
			filteredSlugs.push([].concat.apply([], matches.map(meeting => meeting.slug)));
		}

		//set mode property
		if (this.state.input.mode != settings.defaults.mode) query.mode = this.state.input.mode;

		//set map property if set
		if (this.state.input.view != settings.defaults.view) query.view = this.state.input.view;
		
		//create a query string with only values in use
		query = qs.stringify(merge(merge(qs.parse(location.search), { 
			day: undefined,
			mode: undefined,
			region: undefined,
			search: undefined,
			time: undefined,
			type: undefined,
			view: undefined,
		}), query));

		//un-url-encode the separator
		query = query.split(encodeURIComponent('/')).join('/');

		//set the query string with html5
		window.history.pushState('', '', query.length ? '?' + query : window.location.pathname);

		//do the filtering, if necessary
		filteredSlugs = filterFound 
			? this.getCommonElements(filteredSlugs) //get intersection of slug arrays
			: this.state.meetings.map(meeting => meeting.slug); //get everything

		//show alert
		this.state.alert = filteredSlugs.length ? null : 'no_results';
		
		return(
			<div className="container-fluid py-3 d-flex flex-column">
				<Title state={this.state}/>
				<Controls state={this.state} setAppState={this.setAppState}/>
				<Alert state={this.state} filteredSlugs={filteredSlugs}/>
				<Table state={this.state} filteredSlugs={filteredSlugs}/>
				<Map state={this.state} filteredSlugs={filteredSlugs}/>
			</div>
		);
	}
}

ReactDOM.render(<App/>, element);