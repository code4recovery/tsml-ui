import React, { Component } from 'react';
import classNames from 'classnames/bind';

import settings from '../settings';

export default class Map extends Component {
	render() {

		const hide: boolean = (this.props.filteredSlugs.length == 0) || (this.props.state.view != 'map');

		return(
			<div id="map" className={classNames('border rounded bg-light my-3', { 'd-none': hide })}></div>
		);
	}
}