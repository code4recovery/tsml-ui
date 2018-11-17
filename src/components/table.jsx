import React, { Component } from 'react';
import classNames from 'classnames/bind';

import { settings, strings } from '../settings';

export default class Table extends Component {
	getValue(meeting, key) {
		if (key == 'address') {
			const address = meeting.formatted_address.split(', ');
			return address.length ? address[0] : '';
		} else if (key == 'name' && meeting.slug) {
			return(
				<a href={ window.location.pathname + '?meeting=' + meeting.slug } onClick={event => this.setMeeting(event, meeting.slug)}>{meeting.name}</a>
			);
		} else if (key == 'time') {
			return(
				<time className="text-nowrap">
					<div className={classNames('mr-1', {
						'd-none': this.props.state.input.day.length == 1,
						'd-sm-inline': this.props.state.input.day.length != 1,
					})}>
						{strings[settings.days[meeting.day]]}
					</div>
					{meeting.time_formatted}
				</time>
			);
		}
		return meeting[key];
	}

	setMeeting(event, slug) {
		event.preventDefault();
		this.props.state.input.meeting = slug;
		this.props.setAppState('input', this.props.state.input);
	}

	render() {

		return(
			<div class="row">
				<table className={classNames('table table-striped flex-grow-1 my-0', { 
					'd-none': (this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'list') || this.props.state.input.meeting
				})}>
					<thead>
						<tr className="d-none d-sm-table-row">
							{settings.defaults.columns.map(column => 
								<th key={column} className={column}>{strings[column]}</th>
							)}
						</tr>
					</thead>
					<tbody>
						{this.props.state.meetings.map(meeting => {
							if (this.props.filteredSlugs.indexOf(meeting.slug) == -1) return;
							return(
								<tr className="d-block d-sm-table-row" key={meeting.slug}>
									{settings.defaults.columns.map(column => 
										<td key={[meeting.slug, column].join('-')} className={classNames('d-block d-sm-table-cell', column)}>
											{this.getValue(meeting, column)}
										</td>
									)}
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		);
	}
}