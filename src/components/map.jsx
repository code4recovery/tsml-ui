import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapboxGl, { Marker, Popup, ZoomControl } from 'react-mapbox-gl';

import { settings, strings } from '../settings';

export default class Map extends Component {
	render() {
		const hide = (this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'map') || this.props.state.input.meeting;
		let MapBox = false;
		if (settings.keys.mapbox && !hide) {
			MapBox = ReactMapboxGl({
				accessToken: settings.keys.mapbox,
			});
		}
		return(
			<div className={classNames('border rounded bg-light flex-grow-1', { 
				'd-none': hide,
				'd-flex': !hide
			})}>
				{ MapBox &&
				<MapBox
					style="mapbox://styles/mapbox/streets-v9"
					center={[0, 0]}
					zoom={[14]}
					className="map flex-grow-1">
					<ZoomControl className="d-none d-md-flex"/>
				</MapBox>
				}
			</div>
		);
	}
}