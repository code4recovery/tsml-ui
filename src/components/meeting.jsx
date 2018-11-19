import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapboxGl, { Marker, Popup, ZoomControl } from 'react-mapbox-gl';

import { settings, strings } from '../settings';

export default class Meeting extends Component {

	constructor() {
		super();
	}

	goBack(event) {
		event.preventDefault();
		this.props.state.input.meeting = null;
		this.props.setAppState('input', this.props.state.input);
	}	

	render() {

		let meeting = {};

		if (this.props.state.input.meeting) {
			for (let i = 0; i < this.props.state.meetings.length; i++) {
				if (this.props.state.meetings[i].slug == this.props.state.input.meeting) {
					meeting = this.props.state.meetings[i];
				}
			}
		}

		let MapBox = false;

		if (settings.keys.mapbox && meeting.latitude && meeting.longitude) {
			MapBox = ReactMapboxGl({
				accessToken: settings.keys.mapbox,
			});
		}

		return(
			<div className={classNames('flex-column flex-grow-1', {
				'd-flex': this.props.state.input.meeting,
				'd-none': !this.props.state.input.meeting,
			})}>
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
									<li>One Day at a Time</li>
									<li>One Day at a Time</li>
									<li>One Day at a Time</li>
									<li>One Day at a Time</li>
								</ol>
							</div>
						</div>
					</div>
					<div className={classNames('col-md-8', {'d-none': !this.props.state.capabilities.map})}>
						{ MapBox &&
						<MapBox
							style="mapbox://styles/mapbox/streets-v9"
							center={[meeting.longitude, parseFloat(meeting.latitude) + .0035]}
							zoom={[14]}
							className="border rounded bg-light h-100 map">
							<Marker
								coordinates={[meeting.longitude, meeting.latitude]}
								anchor="bottom">
								<div title={meeting.location} style={{
									width: '26px',
									height: '38.4px',
									backgroundImage: 'url(data:image/svg+xml;base64,' + window.btoa('<?xml version="1.0" encoding="utf-8"?><svg viewBox="-1.1 -1.086 43.182 63.273" xmlns="http://www.w3.org/2000/svg"><path fill="#f76458" stroke="#b3382c" stroke-width="3" d="M20.5,0.5 c11.046,0,20,8.656,20,19.333c0,10.677-12.059,21.939-20,38.667c-5.619-14.433-20-27.989-20-38.667C0.5,9.156,9.454,0.5,20.5,0.5z"/></svg>') + ')',
								}}></div>
							</Marker>
							<Popup
								coordinates={[meeting.longitude, meeting.latitude]}
								className="col-sm-7 col-md-6 col-lg-5"
								offset={{ bottom: [0, -40] }}
								>
								<h3 className="font-weight-light">{meeting.location}</h3>
								<p>{meeting.formatted_address}</p>
								<button className="btn btn-outline-secondary btn-block">Directions</button>
							</Popup>
							<ZoomControl className="d-none d-md-flex"/>
						</MapBox>
						}
					</div>
				</div>
			</div>
		);
	}
}