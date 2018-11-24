import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';

import { settings, strings } from '../settings';

export default class Meeting extends Component {

	constructor() {
		super();
		this.state = {
			popup: true,
			viewport: null,
			meeting: null,
		};
		this.updateViewport = this.updateViewport.bind(this)
	}

	goBack(event) {
		event.preventDefault();
		this.props.state.input.meeting = null;
		this.props.setAppState('input', this.props.state.input);
	}	

	updateViewport(viewport) {
		this.setState({ viewport: viewport });
	}

	render() {

		let meeting = {};

		//fetch meeting data from array
		if (this.props.state.input.meeting) {
			for (let i = 0; i < this.props.state.meetings.length; i++) {
				if (this.props.state.meetings[i].slug == this.props.state.input.meeting) {
					this.state.meeting = this.props.state.meetings[i];

					this.state.meeting.latitude = parseFloat(this.state.meeting.latitude);
					this.state.meeting.longitude = parseFloat(this.state.meeting.longitude);

					if (!this.state.viewport) this.state.viewport = {
						latitude: this.state.meeting.latitude,
						longitude: this.state.meeting.longitude,
						zoom: 14,
					};

					//set page title
					document.title = meeting.name;
				}
			}
		}

		return this.state.meeting && (
			<div className="flex-column flex-grow-1 d-flex">
				<h1 className="font-weight-light">
					<a href={window.location.pathname} onClick={event=>this.goBack(event)}>{strings.meetings}</a>
					<span className="mx-1">&rarr;</span>
					{this.state.meeting.name}
				</h1>
				<div className="row flex-grow-1">
					<div className={classNames('mb-3', {'col-md-4 mb-md-0': this.props.state.capabilities.map})}>
						<a className="btn btn-outline-secondary btn-block mb-3" href="">Get Directions</a>
						<div className="list-group">
							<div className="list-group-item">
								<h5>Meeting Information</h5>
								<p className="my-0 mt-1">
									{strings[settings.days[this.state.meeting.day]]}, {this.state.meeting.time_formatted}
									{ this.state.meeting.end_time ? ' – ' + this.state.meeting.end_time_formatted : '' }
								</p>
								<ul className={classNames('my-0 mt-1', { 'd-none': (!this.state.meeting.types || !this.state.meeting.types.length) })}>
									{this.state.meeting.types ? this.state.meeting.types.map(type => {
										return(
											<li key={type}>{strings.types[type]}</li>
										);
									}) : ''}
								</ul>
							</div>
							<div className="list-group-item">
								<h5>{this.state.meeting.location}</h5>
								<p className="my-0 mt-1">{this.state.meeting.formatted_address}</p>
								<p className="my-0 mt-1">Other meetings at this address:</p>
								<ol className="my-0 mt-1">
									<li>One Day at a Time</li>
									<li>One Day at a Time</li>
									<li>One Day at a Time</li>
									<li>One Day at a Time</li>
								</ol>
							</div>
						</div>
					</div>
					<div className={classNames('col-md-8 map', {'d-none': !this.props.state.capabilities.map})}>

						{this.state.viewport && this.state.meeting.latitude && <ReactMapGL
							className="rounded border bg-light"
							{...this.state.viewport}
							mapboxApiAccessToken={settings.keys.mapbox}
							mapStyle={settings.mapbox_style}
							onViewportChange={this.updateViewport}
							width="100%"
							height="100%"
						>
							<Marker
								latitude={this.state.meeting.latitude - .0025}
								longitude={this.state.meeting.longitude}
								offsetLeft={-settings.marker_style.width / 2}
								offsetTop={-settings.marker_style.height}
								>
								<div
									title={this.state.meeting.location}
									style={settings.marker_style}
									onClick={() => this.setState({popup: true})}
									/>
							</Marker>
							{ this.state.popup && <Popup
								latitude={this.state.meeting.latitude - .0025}
								longitude={this.state.meeting.longitude}
								className="popup"
								onClose={() => this.setState({popup: false})}
								offsetTop={-settings.marker_style.height}
								>
								<h3 className="font-weight-light">{this.state.meeting.location}</h3>
								<p>{this.state.meeting.formatted_address}</p>
								<button className="btn btn-outline-secondary btn-block">Directions</button>
							</Popup>}
					        <div className="control">
								<NavigationControl showCompass={false} onViewportChange={this.updateViewport}/>
							</div>
						</ReactMapGL>}
					</div>
				</div>
			</div>
		);
	}
}