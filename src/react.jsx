import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import settings from './settings';

export const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const times = ['morning', 'midday', 'evening', 'night'];

class App extends Component {
	constructor() {
		super();
		this.state = { 
			filters: {
				day: settings.defaults.today ? new Date().getDay() : null,
				types: [],
				region: null,
				district: null,
				radius: null,
				query: null,
				center: null,
				time: null,
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
		fetch(settings.json)
			.then(res => res.json())
			.then(result => {
				let indexes = {
					days: {},
					regions: {},
					times: {},
					types: [],
				}
				//build index arrays for dropdowns
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

					//build type index
					for (let j = 0; j < meeting.types.length; j++) {
						if (indexes.types.indexOf(meeting.types[j]) == -1) {
							indexes.types.push(meeting.types[j]);
						}
					}
				}

				//sort regions
				indexes.regions = Object.values(indexes.regions);
				indexes.regions.sort((a, b) => { 
					return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);
				});

				//sort days
				indexes.days = Object.values(indexes.days);
				indexes.days.sort((a, b) => {
					return a.key - b.key;
				});

				//sort times
				indexes.times = Object.values(indexes.times);
				indexes.times.sort((a, b) => { 
					return days.indexOf(a.key) - days.indexOf(b.day);
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
			if (this.props.indexes.times.length && this.props.filters.time !== null) {
				title.unshift(this.props.indexes.times.find(x => x.key == this.props.filters.time).name);
			}
			if (this.props.indexes.days.length && this.props.filters.day !== null) {
				title.unshift(this.props.indexes.days.find(x => x.key == this.props.filters.day).name);
			}
			if (this.props.indexes.regions.length && this.props.filters.region !== null) {
				title.push(settings.strings.in);
				title.push(this.props.indexes.regions.find(x => x.key == this.props.filters.region).name);
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
			current_view: settings.defaults.view
		};
	}

	setFilter(e, filter, value) {
		e.preventDefault();
		this.props.filters[filter] = value;
		this.props.setFilters(this.props.filters);
	}

	setView(e, view) {
		e.preventDefault();
		this.setState({ current_view: view });
	}

	render() {

		//build region dropdown
		const region_label = this.props.filters.region == null ? settings.strings.everywhere : this.props.indexes.regions.find(x => x.key == this.props.filters.region).name;
		const region_options = this.props.indexes.regions.map(region => 
			<a key={region.key} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
				'active bg-secondary': (this.props.filters.region == region.key)
			})} href="#" onClick={(e) => this.setFilter(e, 'region', region.key)}>
				<span>{region.name}</span>
				<span className="badge badge-light ml-3">{region.slugs.length}</span>
			</a>
		);

		//build day dropdown
		const day_label = this.props.filters.day == null ? settings.strings.any_day : settings.strings[days[this.props.filters.day]];
		const day_options = this.props.indexes.days.map(day => 
			<a key={day.key} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
				'active bg-secondary': (this.props.filters.day == day.key)
			})} href="#" onClick={(e) => this.setFilter(e, 'day', day.key)}>
				<span>{day.name}</span>
				<span className="badge badge-light ml-3">{day.slugs.length}</span>
			</a>
		);

		//build time dropdown
		const time_label = this.props.filters.time == null ? settings.strings.any_time : settings.strings[this.props.filters.time];
		const time_options = this.props.indexes.times.map(time => 
			<a key={time.key} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
				'active bg-secondary': (this.props.filters.time == time.key)
			})} href="#" onClick={(e) => this.setFilter(e, 'time', time.key)}>
				<span>{time.name}</span>
				<span className="badge badge-light ml-3">{time.slugs.length}</span>
			</a>
		);

		//build type dropdown
		const types_label = this.props.filters.types.length ? this.props.filters.types.join(' + ') : settings.strings.any_type;
		const types_options = this.props.indexes.types.map((type, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.type == type)
			})} href="#" onClick={(e) => this.setFilter(e, 'types', index)}>{settings.strings.types[type]}</a>
		);

		return(
			<div className="row mt-4">
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="input-group">
						<input type="search" className="form-control" placeholder={settings.strings.search} aria-label={settings.strings.search}/>
						<div className="input-group-append">
							<button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
							<div className="dropdown-menu dropdown-menu-right">
								<a className="dropdown-item active bg-secondary" href="#">{settings.strings.search}</a>
								<a className="dropdown-item" href="#">{settings.strings.near_me}</a>
								<a className="dropdown-item" href="#">{settings.strings.near_location}</a>
							</div>
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{region_label}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className={classNames('dropdown-item', { 'active bg-secondary': this.props.filters.region == null })} onClick={(e) => this.setFilter(e, 'region', null)} href="#">{settings.strings.everywhere}</a>
							<div className="dropdown-divider"></div>
							{region_options}
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{day_label}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className={classNames('dropdown-item', { 'active bg-secondary': this.props.filters.day == null })} onClick={(e) => this.setFilter(e, 'day', null)} href="#">{settings.strings.any_day}</a>
							<div className="dropdown-divider"></div>
							{day_options}
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{time_label}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className={classNames('dropdown-item', { 'active bg-secondary': this.props.filters.time == null })} onClick={(e) => this.setFilter(e, 'time', null)} href="#">{settings.strings.any_time}</a>
							<div className="dropdown-divider"></div>
							{time_options}
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{types_label}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">{settings.strings.any_type}</a>
							<div className="dropdown-divider"></div>
							{types_options}
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="btn-group w-100" role="group" aria-label="Basic example">
						<button type="button" className={classNames('btn btn-outline-secondary w-100', { active: this.state.current_view == 'list' })} onClick={(e) => this.setView(e, 'list')}>{settings.strings.list}</button>
						<button type="button" className={classNames('btn btn-outline-secondary w-100', { active: this.state.current_view == 'map' })} onClick={(e) => this.setView(e, 'map')}>{settings.strings.map}</button>
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
	render() {
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
					{this.props.meetings.map((meeting) => {
						if (this.props.filters.day !== null) {
							if (this.props.indexes.days.find(x => x.key == this.props.filters.day).slugs.indexOf(meeting.slug) == -1) return;
						}
						if (this.props.filters.region !== null) {
							if (this.props.indexes.regions.find(x => x.key == this.props.filters.region).slugs.indexOf(meeting.slug) == -1) return;
						}
						if (this.props.filters.time !== null) {
							if (this.props.indexes.times.find(x => x.key == this.props.filters.time).slugs.indexOf(meeting.slug) == -1) return;
						}
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