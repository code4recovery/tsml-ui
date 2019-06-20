import React, { Component } from 'react';

export default class Link extends Component {

	setMeeting(event, slug) {
		event.preventDefault();
		this.props.state.input.meeting = slug;
		this.props.setAppState('input', this.props.state.input);
	}

	render() {
		return (
			<a href={ window.location.pathname + '?meeting=' + this.props.meeting.slug } onClick={event => this.setMeeting(event, this.props.meeting.slug)}>
				{this.props.meeting.name}
			</a>
		);
	}

}