import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { settings, strings } from '../settings';

export default class Map extends Component {
	constructor() {
		super();
		this.state = {
			bounds: {},
			popup: true,
			viewport: null,
		};
		this.updateViewport = this.updateViewport.bind(this)
	}

	updateViewport(viewport) {
		this.setState({ viewport: viewport });
	}

	render() {

		const hide = (this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'map') || this.props.state.input.meeting;

		let locations = {};
		let locations_keys = [];

		if (!hide) {

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
							latitude: meeting.latitude,
							longitude: meeting.longitude,
							//probably a directions link here
							meetings: [],
						}
					}

					if (!this.state.bounds.north || meeting.latitude > this.state.bounds.north) this.state.bounds.north = meeting.latitude;
					if (!this.state.bounds.south || meeting.latitude < this.state.bounds.south) this.state.bounds.south = meeting.latitude;
					if (!this.state.bounds.east || meeting.longitude > this.state.bounds.east) this.state.bounds.east = meeting.longitude;
					if (!this.state.bounds.west || meeting.longitude < this.state.bounds.west) this.state.bounds.west = meeting.longitude;

					locations[coords].meetings.push(meeting);
				}
			}

			if (!this.state.viewport) this.state.viewport = new WebMercatorViewport({
				width: 400,
				height: 400,
			}).fitBounds([
				[this.state.bounds.west, this.state.bounds.south], 
				[this.state.bounds.east, this.state.bounds.north]
			], { padding: 40 });
		}

		return !hide && this.state.viewport && (
			<div className="border rounded bg-light flex-grow-1 map">
				<ReactMapGL
					{...this.state.viewport}
					mapboxApiAccessToken={settings.keys.mapbox}
					mapStyle={settings.mapbox_style}
					onViewportChange={this.updateViewport}
					style={{position: 'absolute'}}
					width="100%"
					height="100%"
					>
					{locations_keys.map(key => {
						const location = locations[key];
						return(
					<Marker
						key={key}
						latitude={location.latitude}
						longitude={location.longitude}
						offsetLeft={-settings.marker_style.width / 2}
						offsetTop={-settings.marker_style.height}
						>
						<div
							title={location.name}
							style={settings.marker_style}
							onClick={() => this.setState({popup: true})}
							/>
					</Marker>
						);
					})}
			        <div className="control">
						<NavigationControl showCompass={false} onViewportChange={this.updateViewport}/>
					</div>
				</ReactMapGL>
			</div>
		);
	}
}