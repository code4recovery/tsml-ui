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
				let indexes = this.state.indexes;
				//build index arrays for dropdowns
				for (let i = 0; i < result.length; i++) {
					if (indexes.regions.indexOf(result[i].region) == -1) {
						indexes.regions.push(result[i].region);
					}
					for (let j = 0; j < result[i].types.length; j++) {
						if (indexes.types.indexOf(result[i].types[j]) == -1) {
							indexes.types.push(result[i].types[j]);
						}
					}
				}
				indexes.regions.sort();
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
			if (this.props.filters.day !== null) {
				title.unshift(settings.strings[days[this.props.filters.day]]);
			}
			if (this.props.filters.region !== null) {
				title.push(settings.strings.in);
				title.push(this.props.indexes.regions[this.props.filters.region]);
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
		const region_label = this.props.filters.region == null ? settings.strings.everywhere : this.props.indexes.regions[this.props.filters.region];
		const region_options = this.props.indexes.regions.map((region, index) => 
			<a key={index} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
				'active bg-secondary': (this.props.filters.region == index)
			})} href="#" onClick={(e) => this.setFilter(e, 'region', index)}>
				<span>{region}</span>
				<span className="badge badge-light ml-3">9</span>
			</a>
		);

		//build day dropdown
		const day_label = this.props.filters.day == null ? settings.strings.any_day : settings.strings[days[this.props.filters.day]];
		const day_options = days.map((day, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.day == index)
			})} href="#" onClick={(e) => this.setFilter(e, 'day', index)}>{settings.strings[day]}</a>
		);

		//build time dropdown

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
							<a className={classNames('dropdown-item', { 'active bg-secondary': this.props.filters.day == null })} onClick={(e) => this.setFilter(e, 'day', null)} href="#">Any Day</a>
							<div className="dropdown-divider"></div>
							{day_options}
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{settings.strings.any_time}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">{settings.strings.any_time}</a>
							<div className="dropdown-divider"></div>
							<a className="dropdown-item" href="#">{settings.strings.morning}</a>
							<a className="dropdown-item" href="#">{settings.strings.midday}</a>
							<a className="dropdown-item" href="#">{settings.strings.evening}</a>
							<a className="dropdown-item" href="#">{settings.strings.night}</a>
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
							if (this.props.filters.day != meeting.day) return;
						}
						if (this.props.filters.region !== null) {
							if (this.props.indexes.regions[this.props.filters.region] != meeting.region) return;
						}
						return(
							<tr key={meeting.id}>
								{settings.defaults.columns.map(column => 
									<td key={meeting.id+column} className={classNames('d-block d-sm-table-cell', column)}>{this.getValue(meeting, column)}</td>
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