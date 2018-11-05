import React, { Component } from 'react';
import classNames from 'classnames/bind';

import settings from '../settings';

export default class Alert extends Component {

	constructor() {
		super();
	}

	render() {
		const hide: boolean = this.props.state.meetings.length == 0 || this.props.filteredSlugs.length > 0;
		return(
			<div className={classNames('alert alert-warning mt-3', { 'd-none': hide })}>
				{settings.strings.no_results}
			</div>
		);
	}
}
