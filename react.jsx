import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';

export const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
			}
		};
		this.setFilters = this.setFilters.bind(this);
	}

	componentDidMount() {
		fetch('/data.json')
			.then(res => res.json())
			.then((result) => {
				this.setState({
					isLoaded: true,
					meetings: result,
				});
			},
			(error) => {
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
				<Title filters={this.state.filters}/>
				<Controls filters={this.state.filters} setFilters={this.setFilters}/>
				<Table filters={this.state.filters} meetings={this.state.meetings}/>
			</div>
		);
	}
}

function Title(props) {
	let title = 'Meetings';
	if (props.filters) {
		if (props.filters.day !== null) {
			title = days[props.filters.day] + ' ' + title;
		}
	}
	document.title = title;
	return(
		<h1 className="d-none d-sm-block mt-4">{title}</h1>
	);
}

class Controls extends Component {

	setDay(e, day) {
		e.preventDefault();
		this.props.filters.day = day;
		this.props.setFilters(this.props.filters);
	}

	render() {

		const day_label = this.props.filters.day == null ? 'Any Day' : days[this.props.filters.day];
		const day_options = days.map((day, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.day == index)
			})} href="#" onClick={(e) => this.setDay(e, index)}>{day}</a>
		);
		return(
			<div className="row mt-4">
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="input-group">
						<input type="search" className="form-control" placeholder="Search" aria-label="Search"/>
						<div className="input-group-append">
							<button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
							<div className="dropdown-menu dropdown-menu-right">
								<a className="dropdown-item active bg-secondary" href="#">Search</a>
								<a className="dropdown-item" href="#">Near Me</a>
								<a className="dropdown-item" href="#">Near Location</a>
							</div>
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Everywhere
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">Everywhere</a>
							<div className="dropdown-divider"></div>
							<a className="dropdown-item" href="#">Campbell</a>
							<a className="dropdown-item" href="#">Cupertino</a>
							<a className="dropdown-item" href="#">Mountain View</a>
							<a className="dropdown-item" href="#">Palo Alto</a>
							<a className="dropdown-item" href="#">Saratoga</a>
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{day_label}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className={classNames('dropdown-item', { 'active bg-secondary': this.props.filters.day == null })} onClick={(e) => this.setDay(e, null)} href="#">Any Day</a>
							<div className="dropdown-divider"></div>
							{day_options}
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Any Time
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">Any Time</a>
							<div className="dropdown-divider"></div>
							<a className="dropdown-item" href="#">Morning</a>
							<a className="dropdown-item" href="#">Midday</a>
							<a className="dropdown-item" href="#">Evening</a>
							<a className="dropdown-item" href="#">Night</a>
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							Any Type
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">Any Type</a>
							<div className="dropdown-divider"></div>
							<a className="dropdown-item" href="#">Big Book</a>
							<a className="dropdown-item" href="#">Closed</a>
							<a className="dropdown-item" href="#">LGBTQ</a>
							<a className="dropdown-item" href="#">Men</a>
							<a className="dropdown-item" href="#">Open</a>
							<a className="dropdown-item" href="#">Women</a>
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="btn-group w-100" role="group" aria-label="Basic example">
						<button type="button" className="btn btn-outline-secondary w-100 active">List</button>
						<button type="button" className="btn btn-outline-secondary w-100">Map</button>
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
					<th className="time">Time</th>
					<th className="name">Name</th>
					<th className="location">Location</th>
					<th className="address">Address</th>
					<th className="region">Region</th>
				</tr>
			</thead>
			<tbody>
				{rows}
			</tbody>
		</table>
	);
}
 
ReactDOM.render(<App/>, document.getElementById('app'));