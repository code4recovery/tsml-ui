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
if (!element.length) alert('Could not find a <meetings> element in your HTML');
element = element[0];

class App extends Component {
	constructor() {
		super();

		//initialize state
		this.state = {
			error: null,
			input: {
				center: null,
				day: [],
				district: [],
				query: null,
				radius: null,
				region: [],
				search: '',
				time: [],
				type: [],
			},
			indexes: {
				day: [],
				region: [],
				time: [],
				type: [],
			},
			meetings: [],
			mode: settings.defaults.mode,
			view: settings.defaults.view
		};

		//check query string
		let querystring = qs.parse(location.search);
		if (querystring.day) {
			this.state.input.day = querystring.day.split(settings.query_separator);
		} else if (settings.defaults.today) {
			this.state.input.day.push(new Date().getDay().toString());
		}
		if (querystring.type) {
			this.state.input.type = querystring.type.split(settings.query_separator);
		}		
		if (querystring.time) {
			this.state.input.time = querystring.time.split(settings.query_separator);
		}		
		if (querystring.region) {
			this.state.input.region = querystring.region.split(settings.query_separator);
		}		
		if (querystring.search) {
			this.state.input.search = querystring.search;
		}
		if (querystring.mode) {
			this.state.mode = querystring.mode;
		}
		if (querystring.view) {
			this.state.view = querystring.view;
		}

		//near me mode enabled on https
		if (window.location.protocol == 'https:') {
			settings.modes.push('me');
		}

		//need to bind this for the function to access
		this.setAppState = this.setAppState.bind(this);
	}

	componentDidMount() {

		//if this is empty it'll be reported in fetch()s error handler
		const json = element.getAttribute('src');

		//fetch json data file and build indexes
		fetch(json)
			.then(res => res.json())
			.then(result => {

				//indexes start as objects, will be converted to arrays
				let indexes = {
					day: {},
					region: {},
					time: {},
					type: {},
				}

				//build index objects for dropdowns
				for (let i = 0; i < result.length; i++) {

					//for readability
					let meeting = result[i];

					//build region index
					if (meeting.region in indexes.region === false) {
						indexes.region[meeting.region] = {
							key: meeting.region_id,
							name: meeting.region,
							slugs: [],
						};
					}
					indexes.region[meeting.region].slugs.push(meeting.slug);

					//build day index
					if (meeting.day in indexes.day === false) {
						indexes.day[meeting.day] = {
							key: meeting.day,
							name: settings.strings[settings.days[meeting.day]],
							slugs: [],
						}
					}
					indexes.day[meeting.day].slugs.push(meeting.slug);

					//build time index (can be multiple)
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

					//build type index (can be multiple)
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

				//todo filter out unused meetings properties to have a leaner memory footprint

				this.setState({
					indexes: indexes,
					meetings: result,
				});
			}, error => {
				if (!json) {
					alert('no json');
				} else {
					alert('bad json');
				}
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
				query[filter] = this.state.input[filter].join(settings.query_separator);
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
		if (this.state.mode != 'search') query.mode = this.state.mode;

		//set map property if set
		if (this.state.view == 'map') query.view = 'map';
		

		//create a query string with only values in use
		query = qs.stringify(merge(merge(qs.parse(location.search), { 
			day: undefined,
			mode: undefined,
			region: undefined,
			search: undefined,
			time: undefined,
			view: undefined,
		}), query));

		//un-url-encode the separator
		query = query.split(encodeURIComponent(settings.query_separator)).join(settings.query_separator);

		//set the query string with html5
		window.history.pushState('', '', query.length ? '?' + query : query);

		//do the filtering, if necessary
		filteredSlugs = filterFound 
			? this.getCommonElements(filteredSlugs) //get intersection of slug arrays
			: this.state.meetings.map(meeting => meeting.slug); //get everything
		
		return(
			<div className="container-fluid">
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