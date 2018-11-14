import React, { Component } from 'react';
import classNames from 'classnames/bind';

import settings from '../settings';

export default class Map extends Component {
	render() {
		return(
			<div id="map" className={classNames('border rounded bg-light flex-grow-1', { 
				'd-none': (this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'map') || this.props.state.input.meeting
			})}></div>
		);
	}
}