import React, { Component } from 'react';
import classNames from 'classnames/bind';

import settings from '../settings';

export default class Controls extends Component {

	constructor() {
		super();
		this.state = { 
			dropdown: null,
		};
		this.searchInput = React.createRef();
		this.closeDropdown = this.closeDropdown.bind(this);
		this.search = this.search.bind(this);
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

	//keyword search
	search(e) {
		if (this.props.state.mode != 'search') return;
		this.props.state.input.search = e.target.value;
		this.props.setAppState('input', this.props.state.input);
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
				const index = this.props.state.input[filter].indexOf(value);
				if (index == -1) {
					this.props.state.input[filter].push(value);
				} else {
					this.props.state.input[filter].splice(index, 1);
				}
			} else {
				this.props.state.input[filter] = [value];
			}
		} else {
			this.props.state.input[filter] = [];
		}

		//sort filters
		this.props.state.input[filter].sort((a, b) => {
			return this.props.state.indexes[filter].findIndex(x => a == x.key) - this.props.state.indexes[filter].findIndex(x => b == x.key);
		});

		//pass it up to app controller
		this.props.setAppState('input', this.props.state.input);
	}

	setMode(e, mode) {
		e.preventDefault();
		if (mode != 'me') {
			//set settimeout to wait for disabled to clear
			setTimeout(function() {
				this.searchInput.current.focus();
			}.bind(this), 100);
		}
		this.props.setAppState('mode', mode);
	}

	//toggle list/map view
	setView(e, view) {
		e.preventDefault();
		this.props.setAppState('view', view);
	}

	render() {
		return(
			<div className="row d-print-none">
				<div className="col-sm-6 col-lg-2">
					<div className="input-group mt-3">
						<input type="search" 
							className="form-control" 
							onChange={this.search}
							value={this.props.state.input.search}
							ref={this.searchInput} 
							placeholder={settings.strings.modes[this.props.state.mode]} 
							aria-label={settings.strings.modes[this.props.state.mode]} 
							disabled={this.props.state.mode == 'me'}
							spellCheck="false"
							/>
						<div className="input-group-append">
							<button 
								className="btn btn-outline-secondary dropdown-toggle" 
								onClick={e => this.setDropdown('search')} 
								aria-haspopup="true" 
								aria-expanded="false"></button>
							<div className={classNames('dropdown-menu dropdown-menu-right', { show: (this.state.dropdown == 'search') })}>
							{settings.modes.map(x => 
								<a key={x} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
									'active bg-secondary': (this.props.state.mode == x)
								})} href="#" onClick={e => this.setMode(e, x)}>
								{settings.strings.modes[x]}
								</a>
							)}
							</div>
						</div>
					</div>
				</div>
				{settings.filters.map(filter =>
				<div className="col-sm-6 col-lg-2 mt-3" key={filter}>
					<div className="dropdown">
						<button className="btn btn-outline-secondary w-100 dropdown-toggle" onClick={e => this.setDropdown(filter)} id="{filter}-dropdown" aria-haspopup="true" aria-expanded="false">
							{this.props.state.input[filter].length && this.props.state.indexes[filter].length ? this.props.state.input[filter].map(x => {
								return this.props.state.indexes[filter].find(y => y.key == x).name;
							}).join(' + ') : settings.strings[filter + '_any']}
						</button>
						<div className={classNames('dropdown-menu', { show: (this.state.dropdown == filter) })} aria-labelledby="{filter}-dropdown">
							<a className={classNames('dropdown-item', { 'active bg-secondary': !this.props.state.input[filter].length })} onClick={e => this.setFilter(e, filter, null)} href="#">
								{settings.strings[filter + '_any']}
							</a>
							<div className="dropdown-divider"></div>
							{this.props.state.indexes[filter].map(x => 
								<a key={x.key} className={classNames('dropdown-item d-flex justify-content-between align-items-center', {
									'active bg-secondary': (this.props.state.input[filter].indexOf(x.key) !== -1)
								})} href="#" onClick={e => this.setFilter(e, filter, x.key)}>
									<span>{x.name}</span>
									<span className="badge badge-light ml-3">{x.slugs.length}</span>
								</a>
							)}
						</div>
					</div>
				</div>
				)}
				<div className="col-sm-6 col-lg-2 mt-3">
					<div className="btn-group w-100" role="group" aria-label="Basic example">
						<button type="button" className={classNames('btn btn-outline-secondary w-100', { active: this.props.state.view == 'list' })} onClick={e => this.setView(e, 'list')}>{settings.strings.list}</button>
						<button type="button" className={classNames('btn btn-outline-secondary w-100', { active: this.props.state.view == 'map' })} onClick={e => this.setView(e, 'map')}>{settings.strings.map}</button>
					</div>
				</div>
			</div>
		);
	}
}
