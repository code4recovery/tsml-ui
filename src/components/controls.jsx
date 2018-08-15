import React, { Component } from 'react';
import classNames from 'classnames/bind';

import settings from '../settings';

export default class Controls extends Component {

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
				{settings.filters.map(filter =>
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
