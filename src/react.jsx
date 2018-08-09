import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import settings from './settings';

export const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const times = ['morning', 'midday', 'evening', 'night'];
export const filters = ['regions', 'days', 'times', 'types'];
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
		};
		this.setFilters = this.setFilters.bind(this);
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
							name: settings.strings[days[meeting.day]],
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
								key: times[meeting.times[j]],
								name: settings.strings[times[meeting.times[j]]],
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
					return times.indexOf(a.key) - times.indexOf(b.key);
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

	setFilters(filters) {
		this.setState({filters: filters});
	}

	render() {
		return(
			<div>
				<Title filters={this.state.filters} indexes={this.state.indexes}/>
				<Controls filters={this.state.filters} indexes={this.state.indexes} setFilters={this.setFilters}/>
				<Table filters={this.state.filters} indexes={this.state.indexes} meetings={this.state.meetings}/>
			</div>
		);
	}
}

class Title extends Component {
	render() {
		let title = [settings.strings.meetings];
		if (this.props.filters) {
			if (this.props.indexes.types.length && this.props.filters.types.length) {
				title.unshift(this.props.filters.types.map(x => {
					return this.props.indexes.types.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.indexes.times.length && this.props.filters.times.length) {
				title.unshift(this.props.filters.times.map(x => {
					return this.props.indexes.times.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.indexes.days.length && this.props.filters.days.length) {
				title.unshift(this.props.filters.days.map(x => {
					return this.props.indexes.days.find(y => y.key == x).name;
				}).join(' + '));
			}
			if (this.props.indexes.regions.length && this.props.filters.regions.length) {
				title.push(settings.strings.in);
				title.push(this.props.filters.regions.map(x => {
					return this.props.indexes.regions.find(y => y.key == x).name;
				}).join(' + '));
			}
		}
		title = title.join(' ');
		document.title = title;
		return(
			<h1 className="d-none d-sm-block mt-4">{title}</h1>
		);
	}
}

class Controls extends Component {

	constructor() {
		super();
		this.state = { 
			dropdown: null,
			view: settings.defaults.view,
		};
		this.closeDropdown = this.closeDropdown.bind(this);
	}

	//add click listener for dropdowns (in lieu of including bootstrap js + jquery)
	componentDidMount() {
		document.body.addEventListener('click', this.closeDropdown);
	}

	//remove click listener for dropdowns (in lieu of including bootstrap js + jquery)
	componentWillUnmount() {
		document.body.removeEventListener('click', this.closeDropdown);
	}

	//close current dropdown (on body click)
	closeDropdown(e) {
		if (e.srcElement.classList.contains('dropdown-toggle')) return;
		this.setDropdown(null);
	}

	//open or close dropdown
	setDropdown(which) {
		this.setState({
			dropdown: this.state.dropdown == which ? null : which
		});
	}

	//set filter: pass it up to parent
	setFilter(e, filter, value) {
		e.preventDefault();
		e.stopPropagation();

		//add or remove from filters
		if (value) {
			if (e.metaKey) {
				const index = this.props.filters[filter].indexOf(value);
				if (index == -1) {
					this.props.filters[filter].push(value);
				} else {
					this.props.filters[filter].splice(index, 1);
				}
			} else {
				this.props.filters[filter] = [value];
			}
		} else {
			this.props.filters[filter] = [];
		}

		//sort filters
		this.props.filters[filter].sort((a, b) => {
			return this.props.indexes[filter].findIndex(x => a == x.key) - this.props.indexes[filter].findIndex(x => b == x.key);
		});

		//pass it up to app controller
		this.props.setFilters(this.props.filters);
	}

	//toggle list/map view
	setView(e, view) {
		e.preventDefault();
		this.setState({ view: view });
	}

	render() {
		return(
			<div className="row mt-4">
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="input-group">
						<input type="search" className="form-control" placeholder={settings.strings.search} aria-label={settings.strings.search}/>
						<div className="input-group-append">
							<button className="btn btn-outline-secondary dropdown-toggle" onClick={e => this.setDropdown('search')} aria-haspopup="true" aria-expanded="false"></button>
							<div className={classNames('dropdown-menu dropdown-menu-right', { show: (this.state.dropdown == 'search') })}>
								<a className="dropdown-item active bg-secondary" href="#">{settings.strings.search}</a>
								<a className="dropdown-item" href="#">{settings.strings.near_me}</a>
								<a className="dropdown-item" href="#">{settings.strings.near_location}</a>
							</div>
						</div>
					</div>
				</div>
				{filters.map(filter =>
				<div className="col-sm-6 col-lg-2 mb-3" key={filter}>
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" onClick={e => this.setDropdown(filter)} id="{filter}-dropdown" aria-haspopup="true" aria-expanded="false">
							{this.props.filters[filter].length && this.props.indexes[filter].length ? this.props.filters[filter].map(x => {
								return this.props.indexes[filter].find(y => y.key == x).name;
							}).join(' + ') : settings.strings[filter + '_any']}
						</button>
						<div className={classNames('dropdown-menu', { show: (this.state.dropdown == filter) })} aria-labelledby="{filter}-dropdown">
							<a className={classNames('dropdown-item', { 'active bg-secondary': !this.props.filters[filter].length })} onClick={e => this.setFilter(e, filter, null)} href="#">
								{settings.strings[filter + '_any']}
							</a>
							<div className="dropdown-divider"></div>
							{this.props.indexes[filter].map(x => 
								<a key={x.key} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
									'active bg-secondary': (this.props.filters[filter].indexOf(x.key) !== -1)
								})} href="#" onClick={e => this.setFilter(e, filter, x.key)}>
									<span>{x.name}</span>
									<span className="badge badge-light ml-3">{x.slugs.length}</span>
								</a>
							)}
						</div>
					</div>
				</div>
				)}
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="btn-group w-100" role="group" aria-label="Basic example">
						<button type="button" className={classNames('btn btn-outline-secondary w-100', { active: this.state.view == 'list' })} onClick={e => this.setView(e, 'list')}>{settings.strings.list}</button>
						<button type="button" className={classNames('btn btn-outline-secondary w-100', { active: this.state.view == 'map' })} onClick={e => this.setView(e, 'map')}>{settings.strings.map}</button>
					</div>
				</div>
			</div>
		);
	}
}

class Table extends Component {
	getValue(meeting, key) {
		if (key == 'address') {
			const address = meeting.formatted_address.split(', ');
			return address.length ? address[0] : '';
		} else if (key == 'name') {
			return(
				<a href={meeting.url}>{meeting.name}</a>
			);
		} else if (key == 'time') {
			return meeting.time_formatted;
		}
		return meeting[key];
	}

	//get common matches
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
		let matches = [];
		for (let i = 0; i < filters.length; i++) {
			let filter = filters[i];
			if (this.props.filters[filter].length && this.props.indexes[filter].length) {
				matches.push([].concat.apply([], this.props.filters[filter].map(x => {
					return this.props.indexes[filter].find(y => y.key == x).slugs;
				})));
			}
		}
		matches = this.getCommonElements(matches);

		return(
			<table className="table table-striped mt-3">
				<thead>
					<tr className="d-none d-sm-table-row">
						{settings.defaults.columns.map(column => 
							<th key={column} className={column}>{settings.strings[column]}</th>
						)}
					</tr>
				</thead>
				<tbody>
					{this.props.meetings.map(meeting => {
						if (matches.indexOf(meeting.slug) == -1) return;
						return(
							<tr key={meeting.slug}>
								{settings.defaults.columns.map(column => 
									<td key={[meeting.slug, column].join('-')} className={classNames('d-block d-sm-table-cell', column)}>{this.getValue(meeting, column)}</td>
								)}
							</tr>
						)
					})}
				</tbody>
			</table>
		);
	}
}
 
ReactDOM.render(<App/>, document.getElementById(settings.element_id));