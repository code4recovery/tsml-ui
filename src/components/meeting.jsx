import React, { Component } from 'react';
import classNames from 'classnames/bind';

import settings from '../settings';

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

		return(
			<div className={classNames('row', {
				'd-none': !this.props.state.input.meeting
			})}>
				<div className="col offset-md-1 col-md-10 py-3">
					<h1 className="font-weight-light pb-2">
						<a href={window.location.pathname} onClick={event=>this.goBack(event)}>{settings.strings.meetings}</a>
						<span className="mx-1">&rarr;</span>
						{meeting.name}
					</h1>
					<div className="row">
						<div className="col col-md-4">
							<a className="btn btn-outline-secondary btn-block mb-3" href="">Get Directions</a>
							<ul className="list-group">
								<li className="list-group-item">
									<h5>Meeting Information</h5>
									<p className="mb-1">{settings.strings[settings.days[meeting.day]]}, {meeting.time_formatted}</p>
									<ul>
										<li>Discussion</li>
										<li>Meditation</li>
										<li>Speaker</li>
									</ul>
								</li>
								<li className="list-group-item">
									<h5>{meeting.location}</h5>
									<p className="mb-1">{meeting.formatted_address}</p>
									<p className="mb-1">Also at this location:</p>
									<ol>
										<li>One Day at a Time</li>
										<li>One Day at a Time</li>
										<li>One Day at a Time</li>
										<li>One Day at a Time</li>
									</ol>
								</li>
							</ul>
						</div>
						<div className="col col-md-8">
							<div className="border rounded bg-light h-100"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
