import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';

import Alert from './components/alert';
import Controls from './components/controls';
import Table from './components/table';
import Title from './components/title';
import settings from './settings';

class App extends Component {
	constructor() {
		super();
		this.state = { 
			filters: {
				center: null,
				days: settings.defaults.today ? [new Date().getDay().toString()] : [],
				districts: [],
				query: null,
				radius: null,
				regions: [],
				times: [],
				types: [],
			},
			indexes: {
				days: [],
				regions: [],
				times: [],
				types: [],
			},
			meetings: [],
			mode: settings.defaults.mode,
			view: settings.defaults.view
		};

		//check query string

		//near me mode enabled on https
		if (window.location.protocol == 'https:') {
			settings.modes.push('near_me');
		}

		this.setFilters = this.setFilters.bind(this);
		this.setAppState = this.setAppState.bind(this);
	}

	componentDidMount() {
		//fetch json data file and build indexes
		fetch(settings.json)
			.then(res => res.json())
			.then(result => {

				//indexes start as objects, will be converted to arrays
				let indexes = {
					days: {},
					regions: {},
					times: {},
					types: {},
				}

				//build index objects for dropdowns
				for (let i = 0; i < result.length; i++) {

					//for readability
					let meeting = result[i];

					//build region index
					if (meeting.region in indexes.regions === false) {
						indexes.regions[meeting.region] = {
							key: meeting.region_id,
							name: meeting.region,
							slugs: [],
						};
					}
					indexes.regions[meeting.region].slugs.push(meeting.slug);

					//build day index
					if (meeting.day in indexes.days === false) {
						indexes.days[meeting.day] = {
							key: meeting.day,
							name: settings.strings[settings.days[meeting.day]],
							slugs: [],
						}
					}
					indexes.days[meeting.day].slugs.push(meeting.slug);

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
						if (meeting.times[j] in indexes.times === false) {
							indexes.times[meeting.times[j]] = {
								key: settings.times[meeting.times[j]],
								name: settings.strings[settings.times[meeting.times[j]]],
								slugs: [],
							}
						}
						indexes.times[meeting.times[j]].slugs.push(meeting.slug);
					}

					//build type index (can be multiple)
					for (let j = 0; j < meeting.types.length; j++) {
						if (meeting.types[j] in indexes.types === false) {
							indexes.types[meeting.types[j]] = {
								key: meeting.types[j],
								name: settings.strings.types[meeting.types[j]],
								slugs: [],
							}
						}
						indexes.types[meeting.types[j]].slugs.push(meeting.slug);
					}
				}

				//convert regions to array and sort by name
				indexes.regions = Object.values(indexes.regions);
				indexes.regions.sort((a, b) => { 
					return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
				});

				//convert days to array and sort by ordinal
				indexes.days = Object.values(indexes.days);
				indexes.days.sort((a, b) => {
					return a.key - b.key;
				});

				//convert times to array and sort by ordinal
				indexes.times = Object.values(indexes.times);
				indexes.times.sort((a, b) => { 
					return settings.times.indexOf(a.key) - settings.times.indexOf(b.key);
				});

				//convert types to array and sort by name
				indexes.types = Object.values(indexes.types);
				indexes.types.sort((a, b) => { 
					return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
				});

				this.setState({
					indexes: indexes,
					meetings: result,
				});
			}, error => {
				//todo add alert component, show error here
			});
	}

	//todo remove
	setFilters(filters) {
		this.setState({ filters: filters });
	}

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
		let filteredMeetings = [];
		let filterFound = false;
		for (let i = 0; i < settings.filters.length; i++) {
			let filter = settings.filters[i];
			if (this.state.filters[filter].length && this.state.indexes[filter].length) {
				filterFound = true;
				filteredMeetings.push([].concat.apply([], this.state.filters[filter].map(x => {
					return this.state.indexes[filter].find(y => y.key == x).slugs;
				})));
			}
		}
		if (filterFound) {
			filteredMeetings = this.getCommonElements(filteredMeetings);
		} else {
			filteredMeetings = this.state.meetings.map(meeting => meeting.slug);
		}
		
		return(
			<div>
				<Title state={this.state}/>
				<Controls state={this.state} setAppState={this.setAppState}/>
				<Alert state={this.state} setFilters={this.setFilters} filteredMeetings={filteredMeetings}/>
				<Table state={this.state} filteredMeetings={filteredMeetings}/>
			</div>
		);
	}
}
 
ReactDOM.render(<App/>, document.getElementById(settings.element_id));