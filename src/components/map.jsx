import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapboxGl, { Marker, Popup, ZoomControl } from 'react-mapbox-gl';

import { settings, strings } from '../settings';

export default class Map extends Component {
	render() {
		const hide = (this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'map') || this.props.state.input.meeting;
		let MapBox = false;
		let bounds = {};
		let locations = {};
		let locations_keys = [];
		if (settings.keys.mapbox && !hide) {

			//instantiate map with proper bounds
			MapBox = ReactMapboxGl({
				accessToken: settings.keys.mapbox,
			});

			//loop through again because ideally it'd be sorted and have fewer keys
			for (let i = 0; i < this.props.state.meetings.length; i++) {
				let meeting = this.props.state.meetings[i];
				
				//build index of map pins
				if (meeting.latitude && meeting.latitude) {
					let coords = meeting.latitude.toString() + ',' + meeting.latitude.toString();
					if (locations_keys.indexOf(coords) == -1) {
						locations_keys.push(coords);
						locations[coords] = {
							name: meeting.location,
							formatted_address: meeting.formatted_address,
							//probably a directions link here
							meetings: [],
							coords: coords,
							latitude: meeting.latitude,
							longitude: meeting.longitude,
						}
					}

					if (!bounds.north || meeting.latitude > bounds.north) bounds.north = meeting.latitude;
					if (!bounds.south || meeting.latitude < bounds.south) bounds.south = meeting.latitude;
					if (!bounds.east || meeting.longitude > bounds.east) bounds.east = meeting.longitude;
					if (!bounds.west || meeting.longitude < bounds.west) bounds.west = meeting.longitude;

					locations[coords].meetings.push(meeting);
				}
			}
		}

		locations = Object.values(locations);

		return(
			<div className={classNames('border rounded bg-light flex-grow-1', { 
				'd-none': hide,
				'd-flex': !hide
			})}>
				{ MapBox && bounds &&
				<MapBox
					style="mapbox://styles/mapbox/streets-v9"
					center={[0, 0]}
					zoom={[14]}
					fitBounds={[[bounds.west, bounds.south], [bounds.east, bounds.north]]}
					fitBoundsOptions={{duration: 0, padding: 100}}
					className="map flex-grow-1">
					{ locations && locations.map(location => {
						return(
							<Marker
								key={location.coords}
								coordinates={[location.longitude, location.latitude]}
								anchor="bottom"
								title={location.name}
								style={{
									width: '26px',
									height: '38.4px',
									backgroundImage: 'url(data:image/svg+xml;base64,' + window.btoa('<?xml version="1.0" encoding="utf-8"?><svg viewBox="-1.1 -1.086 43.182 63.273" xmlns="http://www.w3.org/2000/svg"><path fill="#f76458" stroke="#b3382c" stroke-width="3" d="M20.5,0.5 c11.046,0,20,8.656,20,19.333c0,10.677-12.059,21.939-20,38.667c-5.619-14.433-20-27.989-20-38.667C0.5,9.156,9.454,0.5,20.5,0.5z"/></svg>') + ')',
								}}>
							</Marker>
						);
					})}
					<ZoomControl className="d-none d-md-flex"/>
				</MapBox>
				}
			</div>
		);
	}
}