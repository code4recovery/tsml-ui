import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import merge from 'deepmerge';

//override these with window.config
export const defaults = merge({
	days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
	google_maps_key: null, //enable maps using google
	json: null, //path to JSON file (required)
	mapbox_key: null, //enable maps using mapbox
	strings: {
		address: 'Address',
		any_day: 'Any Day',
		any_time: 'Any Time',
		any_type: 'Any Type',
		evening: 'Evening',
		everywhere: 'Everywhere',
		friday: 'Friday',
		in: 'in', //todo find way to do this with string pattern
		list: 'List',
		location: 'Location',
		map: 'Map',
		meetings: 'Meetings',
		midday: 'Midday',
		monday: 'Monday',
		morning: 'Morning',
		near_location: 'Near Location',
		near_me: 'Near Me',
		night: 'Night',
		region: 'Region',
		saturday: 'Saturday',
		search: 'Search',
		sunday: 'Sunday',
		thursday: 'Thursday',
		time: 'Time',
		tuesday: 'Tuesday',
		types: {
			'11': '11th Step Meditation',
			'12x12': '12 Steps & 12 Traditions,',
			'ASBI': 'As Bill Sees It',
			'BA': 'Babysitting Available',
			'B': 'Big Book',
			'H': 'Birthday',
			'BRK': 'Breakfast',
			'CAN': 'Candlelight',
			'CF': 'Child-Friendly',
			'C': 'Closed',
			'AL-AN': 'Concurrent with Al-Anon',
			'AL': 'Concurrent with Alateen',
			'XT': 'Cross Talk Permitted',
			'DR': 'Daily Reflections',
			'DB': 'Digital Basket',
			'D': 'Discussion',
			'DD': 'Dual Diagnosis',
			'EN': 'English',
			'FF': 'Fragrance Free',
			'FR': 'French',
			'G': 'Gay',
			'GR': 'Grapevine',
			'NDG': 'Indigenous',
			'ITA': 'Italian',
			'JA': 'Japanese',
			'KOR': 'Korean',
			'L': 'Lesbian',
			'LIT': 'Literature',
			'LS': 'Living Sober',
			'LGBTQ': 'LGBTQ',
			'MED': 'Meditation',
			'M': 'Men',
			'N': 'Native American',
			'BE': 'Newcomer',
			'NS': 'Non-Smoking',
			'O': 'Open',
			'POC': 'People of Color',
			'POL': 'Polish',
			'POR': 'Portuguese',
			'P': 'Professionals',
			'PUN': 'Punjabi',
			'RUS': 'Russian',
			'A': 'Secular',
			'ASL': 'Sign Language',
			'SM': 'Smoking Permitted',
			'S': 'Spanish',
			'SP': 'Speaker',
			'ST': 'Step Meeting',
			'TR': 'Tradition Study',
			'T': 'Transgender',
			'X': 'Wheelchair Access',
			'XB': 'Wheelchair-Accessible Bathroom',
			'W': 'Women',
			'Y': 'Young People',
		},
		wednesday: 'Wednesday',
	},
}, window.config);

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
		};
		this.setFilters = this.setFilters.bind(this);
	}

	componentDidMount() {
		fetch(defaults.json)
			.then(res => res.json())
			.then((result) => {
				let regions = [];
				for (let i = 0; i < result.length; i++) {
					if (regions.indexOf(result[i].region) == -1) {
						regions.push(result[i].region);
					}
					regions.sort();
				}
				this.setState({
					isLoaded: true,
					meetings: result,
					regions: regions,
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
				<Title filters={this.state.filters} regions={this.state.regions}/>
				<Controls filters={this.state.filters} setFilters={this.setFilters} regions={this.state.regions}/>
				<Table filters={this.state.filters} meetings={this.state.meetings} regions={this.state.regions}/>
			</div>
		);
	}
}

function Title(props) {
	let title = [defaults.strings.meetings];
	if (props.filters) {
		if (props.filters.day !== null) {
			title.unshift(defaults.strings[defaults.days[props.filters.day]]);
		}
		if (props.filters.region !== null) {
			title.push(defaults.strings.in);
			title.push(props.regions[props.filters.region]);
		}
	}
	title = title.join(' ');
	document.title = title;
	return(
		<h1 className="d-none d-sm-block mt-4">{title}</h1>
	);
}

class Controls extends Component {

	setFilter(e, filter, value) {
		e.preventDefault();
		this.props.filters[filter] = value;
		this.props.setFilters(this.props.filters);
	}

	render() {

		//build region dropdown
		const region_label = this.props.filters.region == null ? defaults.strings.everywhere : this.props.regions[this.props.filters.region];
		const region_options = this.props.regions.map((region, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.region == index)
			})} href="#" onClick={(e) => this.setFilter(e, 'region', index)}>{region}</a>
		);

		//build day dropdown
		const day_label = this.props.filters.day == null ? defaults.strings.any_day : defaults.strings[defaults.days[this.props.filters.day]];
		const day_options = defaults.days.map((day, index) => 
			<a key={index} className={classNames('dropdown-item', {
				'active bg-secondary': (this.props.filters.day == index)
			})} href="#" onClick={(e) => this.setFilter(e, 'day', index)}>{defaults.strings[day]}</a>
		);

		//build time dropdown

		//build type dropdown

		return(
			<div className="row mt-4">
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="input-group">
						<input type="search" className="form-control" placeholder={defaults.strings.search} aria-label={defaults.strings.search}/>
						<div className="input-group-append">
							<button className="btn btn-outline-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
							<div className="dropdown-menu dropdown-menu-right">
								<a className="dropdown-item active bg-secondary" href="#">{defaults.strings.search}</a>
								<a className="dropdown-item" href="#">{defaults.strings.near_me}</a>
								<a className="dropdown-item" href="#">{defaults.strings.near_location}</a>
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
							<a className={classNames('dropdown-item', { 'active bg-secondary': this.props.filters.region == null })} href="#">{defaults.strings.everywhere}</a>
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
							{defaults.strings.any_time}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">{defaults.strings.any_time}</a>
							<div className="dropdown-divider"></div>
							<a className="dropdown-item" href="#">{defaults.strings.morning}</a>
							<a className="dropdown-item" href="#">{defaults.strings.midday}</a>
							<a className="dropdown-item" href="#">{defaults.strings.evening}</a>
							<a className="dropdown-item" href="#">{defaults.strings.night}</a>
						</div>
					</div>
				</div>
				<div className="col-sm-6 col-lg-2 mb-3">
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							{defaults.strings.any_type}
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item active bg-secondary" href="#">{defaults.strings.any_type}</a>
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
						<button type="button" className="btn btn-outline-secondary w-100 active">{defaults.strings.list}</button>
						<button type="button" className="btn btn-outline-secondary w-100">{defaults.strings.map}</button>
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
					<th className="time">{defaults.strings.time}</th>
					<th className="name">{defaults.strings.name}</th>
					<th className="location">{defaults.strings.location}</th>
					<th className="address">{defaults.strings.address}</th>
					<th className="region">{defaults.strings.region}</th>
				</tr>
			</thead>
			<tbody>
				{rows}
			</tbody>
		</table>
	);
}
 
ReactDOM.render(<App/>, document.getElementById('app'));