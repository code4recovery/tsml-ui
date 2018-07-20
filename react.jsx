import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import settings from './settings';

class App extends Component {
	constructor() {
		super();
		const d = new Date();
		this.state = { 
			isLoaded: false,
			meetings: [],
			filters: {
				day: d.getDay(),
				types: [],
				region: null,
				district: null,
				radius: null,
				query: null,
				center: null,
			},
			regions: [],
			types: [],
		};
		this.setFilters = this.setFilters.bind(this);
	}

	componentDidMount() {
		fetch(settings.json)
			.then(res => res.json())
			.then(result => {
				let regions = [];
				let types = [];
				for (let i = 0; i < result.length; i++) {
					if (regions.indexOf(result[i].region) == -1) {
						regions.push(result[i].region);
					}
					for (let j = 0; j < result[i].types.length; j++) {
						if (types.indexOf(result[i].types[j]) == -1) {
							types.push(result[i].types[j]);
						}
					}
				}
				regions.sort();
				console.log(types);
				this.setState({
					isLoaded: true,
					meetings: result,
					regions: regions,
					types: types,
				});
			}, error => {
				this.setState({
					isLoaded: true,
				});
			});
	}

	setFilters(filters) {
		this.setState({filters: filters});
	}

	render() {
		return(
			<div>
				<Title filters={this.state.filters} regions={this.state.regions}/>
				<Controls filters={this.state.filters} setFilters={this.setFilters} regions={this.state.regions} types={this.state.types}/>
				<Table filters={this.state.filters} meetings={this.state.meetings} regions={this.state.regions}/>
			</div>
		);
	}
}

class Title extends Component {
	render() {
		let title = [settings.strings.meetings];
		if (this.props.filters) {
			if (this.props.filters.day !== null) {
				title.unshift(settings.strings[settings.days[this.props.filters.day]]);
			}
			if (this.props.filters.region !== null) {
				title.push(settings.strings.in);
				title.push(this.props.regions[this.props.filters.region]);
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
			current_view: settings.view
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
		const region_label = this.props.filters.region == null ? settings.strings.everywhere : this.props.regions[this.props.filters.region];
		const region_options = this.props.regions.map((region, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.region == index)
			})} href="#" onClick={(e) => this.setFilter(e, 'region', index)}>{region}</a>
		);

		//build day dropdown
		const day_label = this.props.filters.day == null ? settings.strings.any_day : settings.strings[settings.days[this.props.filters.day]];
		const day_options = settings.days.map((day, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.day == index)
			})} href="#" onClick={(e) => this.setFilter(e, 'day', index)}>{settings.strings[day]}</a>
		);

		//build time dropdown

		//build type dropdown
		const types_label = this.props.filters.types.length ? settings.strings.any_type : this.props.filters.types.join(' + ');
		const types_options = this.props.types.map((type, index) => 
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

function Table(props) {

	const rows = props.meetings.map((meeting) => {
		if (props.filters.day !== null) {
			if (props.filters.day != meeting.day) return;
		}
		if (props.filters.region !== null) {
			if (props.regions[props.filters.region] != meeting.region) return;
		}
		meeting.address = meeting.formatted_address.split(', ');
		meeting.address = meeting.address.length ? meeting.address[0] : '';
		return(
			<tr key={meeting.id}>
				<td className="d-block d-sm-table-cell time">{meeting.time_formatted}</td>
				<td className="d-block d-sm-table-cell name">
					<a href={meeting.url}>{meeting.name}</a>
				</td>
				<td className="d-block d-sm-table-cell location">{meeting.location}</td>
				<td className="d-block d-sm-table-cell address">{meeting.address}</td>
				<td className="d-block d-sm-table-cell region">{meeting.region}</td>
			</tr>
		)
	});

	return(
		<table className="table table-striped mt-3">
			<thead>
				<tr className="d-none d-sm-table-row">
					<th className="time">{settings.strings.time}</th>
					<th className="name">{settings.strings.name}</th>
					<th className="location">{settings.strings.location}</th>
					<th className="address">{settings.strings.address}</th>
					<th className="region">{settings.strings.region}</th>
				</tr>
			</thead>
			<tbody>
				{rows}
			</tbody>
		</table>
	);
}
 
ReactDOM.render(<App/>, document.getElementById('app'));