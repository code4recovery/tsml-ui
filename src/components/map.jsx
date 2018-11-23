import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapboxGl, { Marker, Popup, ZoomControl } from 'react-mapbox-gl';

import { settings, strings } from '../settings';

export default class Map extends Component {
	constructor() {
		super();
		this.MapBox = false;
		//this.zoom = [11];
		this.fitBoundsOptions = {duration: 0, padding: 100};
	}

	render() {
		const hide = (this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'map') || this.props.state.input.meeting;
		let bounds = {};
		let locations = {};
		let locations_keys = [];
		let MapBox = false;

		/* todo try json 
		let geoJSON = {
			type: 'FeatureCollection',
			features: [
				{
					type: "Feature",
					properties: {
						description: '<strong>Make it Mount Pleasant</strong><p><a href="http://www.mtpleasantdc.com/makeitmtpleasant" target="_blank" title="Opens in a new window">Make it Mount Pleasant</a> is a handmade and vintage market and afternoon of live entertainment and kids activities. 12:00-6:00 p.m.</p>',
						icon: 'theatre'
					},
					geometry: {
						type: 'Point',
						coordinates: [-77.038659, 38.931567]
					},
				},
			]
		}; */

		if (!hide && settings.keys.mapbox) {
			if (!this.MapBox) {
				this.MapBox = ReactMapboxGl({
					accessToken: settings.keys.mapbox,
					maxZoom: 18,
					minZoom: 8,
				});
			}
			MapBox = this.MapBox;
		}

		if (MapBox && !hide) {

			//filter & sort locations so southern pins are in front
			let meetings = this.props.state.meetings.filter(meeting => {
				return (this.props.filteredSlugs.indexOf(meeting.slug) != -1);
			});
			meetings.sort((a, b) => {
				return b.latitude - a.latitude;
			});

			//loop through again because ideally it'd be sorted and have fewer keys
			for (let i = 0; i < meetings.length; i++) {
				let meeting = meetings[i];

				//build index of map pins
				if (meeting.latitude && meeting.latitude) {
					let coords = meeting.longitude + ',' + meeting.latitude;
					meeting.latitude = parseFloat(meeting.latitude);
					meeting.longitude = parseFloat(meeting.longitude);
					if (locations_keys.indexOf(coords) == -1) {
						locations_keys.push(coords);
						locations[coords] = {
							name: meeting.location,
							formatted_address: meeting.formatted_address,
							//probably a directions link here
							meetings: [],
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

		let center = [(parseFloat(bounds.west) + parseFloat(bounds.east)) / 2, (parseFloat(bounds.north) + parseFloat(bounds.south)) / 2];

		return(
			<div className={classNames('border rounded bg-light flex-grow-1', { 
				'd-none': hide,
				'd-flex': !hide
			})}>
				{ MapBox && bounds &&
				<MapBox
					style={settings.mapbox_style}
					center={center}
					zoom={[14]}
					fitBounds={[[bounds.west, bounds.south], [bounds.east, bounds.north]]}
					fitBoundsOptions={this.fitBoundsOptions}
					flyToOptions={this.fitBoundsOptions}
					className="map flex-grow-1">
					{ locations && locations_keys.map(coords => {
						let location = locations[coords];
						return(
							<Marker
								key={coords}
								coordinates={coords.split(',')}
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
					<ZoomControl zoomDiff={1.25} className="d-none d-md-flex"/>
				</MapBox>
				}
			</div>
		);
	}
}