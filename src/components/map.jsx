import React, { Component } from 'react';
import classNames from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { settings, strings } from '../settings';

export default class Map extends Component {

	constructor() {
		super();
		this.child = React.createRef();
		this.state = {
			bounds: {},
			popup: true,
			viewport: null,
		};
		this.updateViewport = this.updateViewport.bind(this)
	}

	/*
	goToNYC() {
		const viewport = {...this.state.viewport, longitude: -74.1, latitude: 40.7};
		this.setState({viewport});
	}
	*/

	updateViewport(viewport) {
		console.log('updateViewport');
		this.setState({ viewport: viewport });
	}

	render() {

		//is component hidden?
		if ((this.props.filteredSlugs.length == 0) || (this.props.state.input.view != 'map') || this.props.state.input.meeting) {
			return null;
		}
		
		console.log('render');

		//filter & sort locations so southern pins are in front
		let meetings = this.props.state.meetings.filter(meeting => {
			return (this.props.filteredSlugs.indexOf(meeting.slug) != -1);
		});
		meetings.sort((a, b) => {
			return b.latitude - a.latitude;
		});

		//build index of map pins and define bounds
		let locations = {};
		let locations_keys = [];
		for (let i = 0; i < meetings.length; i++) {
			let meeting = meetings[i];

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

		//do we need to make the viewport
		if (!this.state.viewport) {
			if (this.state.bounds.west == this.state.bounds.east) {
				//single marker
				this.state.viewport = {
					latitude: this.state.bounds.north,
					longitude: this.state.bounds.west,
					zoom: 14,
				}
			} else {
				//calculate bounds (need to know the map dimensions!)
				const width = 500;
				const height = 500;
				const padding = Math.min(width, height) / 10;
				this.state.viewport = new WebMercatorViewport({
					width: width,
					height: height,
				}).fitBounds([
					[this.state.bounds.west, this.state.bounds.south], 
					[this.state.bounds.east, this.state.bounds.north]
				], { padding: padding });
			}
		}

		return(
			<div className="border rounded bg-light flex-grow-1 map" ref={this.child}>
				{ this.state.viewport &&
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
				}
			</div>
		);
	}
}