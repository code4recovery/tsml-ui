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
					meeting = this.props.state.meetings[i];

					meeting.latitude = parseFloat(meeting.latitude);
					meeting.longitude = parseFloat(meeting.longitude);

					if (!this.state.viewport) this.state.viewport = {
						latitude: meeting.latitude,
						longitude: meeting.longitude,
						zoom: 14,
					};

					//set page title
					document.title = meeting.name;
				}
			}
		}

		let other_meetings = []
		if(this.props.state.meetings && meeting && meeting.hasOwnProperty('formatted_address')) {
			other_meetings = this.props.state.meetings.filter(
				(m) => m.formatted_address === meeting.formatted_address
			)
		}

		return this.props.state.input.meeting && meeting && (
			<div className="flex-column flex-grow-1 d-flex">
				<h1 className="font-weight-light">
					<a href={window.location.pathname} onClick={event=>this.goBack(event)}>{strings.meetings}</a>
					<span className="mx-1">&rarr;</span>
					{meeting.name}
				</h1>
				<div className="row flex-grow-1">
					<div className={classNames('mb-3', {'col-md-4 mb-md-0': this.props.state.capabilities.map})}>
						<a className="btn btn-outline-secondary btn-block mb-3" href="">Get Directions</a>
						<div className="list-group">
							<div className="list-group-item">
								<h5>Meeting Information</h5>
								<p className="my-0 mt-1">
									{strings[settings.days[meeting.day]]}, {meeting.time_formatted}
									{ meeting.end_time ? ' – ' + meeting.end_time_formatted : '' }
								</p>
								<ul className={classNames('my-0 mt-1', { 'd-none': (!meeting.types || !meeting.types.length) })}>
									{meeting.types ? meeting.types.map(type => {
										return(
											<li key={type}>{strings.types[type]}</li>
										);
									}) : ''}
								</ul>
							</div>
							<div className="list-group-item">
								<h5>{meeting.location}</h5>
								<p className="my-0 mt-1">{meeting.formatted_address}</p>
								<p className="my-0 mt-1">Other meetings at this address:</p>
								<ol className="my-0 mt-1">
									{other_meetings.map(other_meeting => {
										return(
											<li>
												{other_meeting.name} ({strings[settings.days[other_meeting.day]]}, {other_meeting.time_formatted})
											</li>
										);
									})}
								</ol>
							</div>
						</div>
					</div>
					<div className={classNames('col-md-8 map', {'d-none': !this.props.state.capabilities.map})}>

						{this.state.viewport && meeting.latitude && <ReactMapGL
							className="rounded border bg-light"
							{...this.state.viewport}
							mapboxApiAccessToken={settings.keys.mapbox}
							mapStyle={settings.mapbox_style}
							onViewportChange={this.updateViewport}
							width="100%"
							height="100%"
						>
							<Marker
								latitude={meeting.latitude - .0025}
								longitude={meeting.longitude}
								offsetLeft={-settings.marker_style.width / 2}
								offsetTop={-settings.marker_style.height}
								>
								<div
									title={meeting.location}
									style={settings.marker_style}
									onClick={() => this.setState({popup: true})}
									/>
							</Marker>
							{ this.state.popup && <Popup
								latitude={meeting.latitude - .0025}
								longitude={meeting.longitude}
								className="popup"
								onClose={() => this.setState({popup: false})}
								offsetTop={-settings.marker_style.height}
								>
								<h4 className="font-weight-light">{meeting.location}</h4>
								<p>{meeting.formatted_address}</p>
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