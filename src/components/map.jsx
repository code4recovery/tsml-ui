import React, { Component } from 'react';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import WebMercatorViewport from 'viewport-mercator-project';

import { settings, strings } from '../helpers/settings';
import Link from './link';
import Button from './button';

export default class Map extends Component {
  constructor() {
    super();
    this.state = {
      bounds: {},
      locations: {},
      locations_keys: [],
      popup: true,
      viewport: new WebMercatorViewport(),
    };
    //need this for changes to the viewport, eg panning, zooming, resizing
    this.updateViewport = this.updateViewport.bind(this);
  }

  updateViewport(viewport) {
    //need this for changes to the viewport, eg panning + zooming
    this.setState({ viewport: viewport });
  }

  resetMapBounds() {
    //filter & sort meetings so southern pins are in front
    const meetings = this.props.filteredSlugs
      .map(slug => {
        return this.props.state.meetings[slug];
      })
      .sort((a, b) => {
        return b.latitude - a.latitude;
      });

    //reset bounds
    this.state.locations = {};
    this.state.locations_keys = [];
    this.state.bounds = {};

    //build index of map pins and define bounds
    meetings.forEach(meeting => {
      if (meeting.latitude && meeting.latitude) {
        const coords = meeting.longitude + ',' + meeting.latitude;

        //create a new pin
        if (this.state.locations_keys.indexOf(coords) === -1) {
          this.state.locations_keys.push(coords);
          this.state.locations[coords] = {
            name: meeting.location,
            formatted_address: meeting.formatted_address,
            latitude: meeting.latitude,
            longitude: meeting.longitude,
            //probably a directions link here
            meetings: [],
          };
        }

        //expand bounds
        if (
          !this.state.bounds.north ||
          meeting.latitude > this.state.bounds.north
        )
          this.state.bounds.north = meeting.latitude;
        if (
          !this.state.bounds.south ||
          meeting.latitude < this.state.bounds.south
        )
          this.state.bounds.south = meeting.latitude;
        if (
          !this.state.bounds.east ||
          meeting.longitude > this.state.bounds.east
        )
          this.state.bounds.east = meeting.longitude;
        if (
          !this.state.bounds.west ||
          meeting.longitude < this.state.bounds.west
        )
          this.state.bounds.west = meeting.longitude;

        //add meeting to pin
        this.state.locations[coords].meetings.push(meeting);
      }
    });

    //make the viewport
    if (this.state.bounds.west === this.state.bounds.east) {
      //single marker
      this.state.viewport = {
        latitude: this.state.bounds.north,
        longitude: this.state.bounds.west,
        zoom: 14,
      };
    } else {
      //calculate bounds now knowing dimensions
      //setTimeout seems to be unfortunately necessary to render properly (todo try removing)
      setTimeout(() => {
        this.setState({
          viewport: new WebMercatorViewport({
            width: this.state.viewport.width,
            height: this.state.viewport.height,
          }).fitBounds(
            [
              [this.state.bounds.west, this.state.bounds.south],
              [this.state.bounds.east, this.state.bounds.north],
            ],
            {
              padding:
                Math.min(
                  this.state.viewport.width,
                  this.state.viewport.height
                ) / 10,
            }
          ),
        });
      });
    }
  }

  render() {
    //reset the map bounds if necessary
    if (!this.props.state.map_initialized) {
      this.resetMapBounds();
      this.props.setMapInitialized(); //report that bounds are set
    }

    return (
      <div className="border rounded bg-light flex-grow-1 map">
        {this.state.viewport && (
          <ReactMapGL
            {...this.state.viewport}
            mapboxApiAccessToken={settings.keys.mapbox}
            mapStyle={settings.mapbox_style}
            onViewportChange={this.updateViewport}
            style={{ position: 'absolute' }}
            width="100%"
            height="100%"
          >
            {this.state.locations_keys.map(key => {
              const location = this.state.locations[key];

              //create a link for directions
              const iOS =
                !!navigator.platform &&
                /iPad|iPhone|iPod/.test(navigator.platform);

              location.directions_url = `${
                iOS ? 'maps://' : 'https://www.google.com/maps'
              }?daddr=${location.latitude},${
                location.longitude
              }&saddr=Current+Location&q=${encodeURIComponent(
                location.formatted_address
              )}`;

              return (
                <div key={key}>
                  <Marker
                    latitude={location.latitude}
                    longitude={location.longitude}
                    offsetLeft={-settings.marker_style.width / 2}
                    offsetTop={-settings.marker_style.height}
                  >
                    <div
                      title={location.name}
                      style={settings.marker_style}
                      onClick={() => this.setState({ popup: key })}
                    />
                  </Marker>
                  {this.state.popup == key && (
                    <Popup
                      latitude={location.latitude}
                      longitude={location.longitude}
                      className="popup"
                      closeOnClick={false}
                      onClose={() => this.setState({ popup: null })}
                      offsetTop={-settings.marker_style.height}
                    >
                      <h4 className="font-weight-light">{location.name}</h4>
                      <p>{location.formatted_address}</p>
                      <ul className="list-group mb-3">
                        {location.meetings.map(meeting => (
                          <li key={meeting.slug} className="list-group-item">
                            <time>{meeting.formatted_time}</time>
                            <Link
                              meeting={meeting}
                              state={this.props.state}
                              setAppState={this.props.setAppState}
                            />
                          </li>
                        ))}
                      </ul>
                      {location.directions_url && (
                        <Button
                          href={location.directions_url}
                          text={strings.get_directions}
                          icon={'directions'}
                        />
                      )}
                    </Popup>
                  )}
                </div>
              );
            })}
            <div className="control">
              <NavigationControl
                showCompass={false}
                onViewportChange={this.updateViewport}
              />
            </div>
          </ReactMapGL>
        )}
      </div>
    );
  }
}
