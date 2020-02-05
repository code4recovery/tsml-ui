import React, { Component } from 'react';
import cx from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';

import { settings, strings } from '../settings';
import Link from './link';
import Name from './name';

export default class Meeting extends Component {
  constructor() {
    super();
    this.state = {
      popup: true,
      viewport: null,
    };
    this.updateViewport = this.updateViewport.bind(this);
  }

  goBack(event) {
    event.preventDefault();
    this.props.state.input.meeting = null;
    this.state.viewport = null;
    this.props.setAppState('input', this.props.state.input);
  }

  updateViewport(viewport) {
    this.setState({ viewport: viewport });
  }

  render() {
    let meeting = {};

    //fetch meeting data from array
    for (let i = 0; i < this.props.state.meetings.length; i++) {
      if (this.props.state.meetings[i].slug == this.props.state.input.meeting) {
        meeting = this.props.state.meetings[i];

        meeting.latitude = parseFloat(meeting.latitude);
        meeting.longitude = parseFloat(meeting.longitude);

        if (!this.state.viewport) {
          this.state.viewport = {
            latitude: meeting.latitude,
            longitude: meeting.longitude,
            zoom: 14,
          };
        }

        //create a link for directions
        const iOS =
          !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        let maps_prefix = '';

        if (iOS) {
          maps_prefix = 'maps://?';
        } else {
          maps_prefix = 'https://www.google.com/maps?';
        }

        meeting.direction_link =
          maps_prefix +
          'daddr=' +
          meeting.latitude +
          ',' +
          meeting.longitude +
          '&saddr=Current+Location&q=' +
          encodeURIComponent(meeting.formatted_address);

        //set page title
        document.title = meeting.name;
      }
    }

    return (
      <div className="flex-column flex-grow-1 d-flex">
        <h1 className="font-weight-light mb-1">
          <Name meeting={meeting} />
        </h1>
        <h6 className="mb-3 border-bottom pb-2">
          <span className="font-weight-bold mr-2">&rsaquo;</span>
          <a
            href={window.location.pathname}
            onClick={event => this.goBack(event)}
          >
            {strings.back_to_meetings}
          </a>
        </h6>
        <div className="row flex-grow-1">
          <div className="mb-3 col-md-4 mb-md-0">
            <a
              className="btn btn-outline-secondary btn-block mb-3"
              href={meeting.direction_link}
              target="_blank"
            >
              {strings.get_directions}
            </a>
            <div className="list-group">
              <div className="list-group-item border-bottom-0">
                <h5>{strings.meeting_information}</h5>
                <p className="my-0 mt-1">
                  {strings[settings.days[meeting.day]]},{' '}
                  {meeting.formatted_time}
                  {meeting.end_time ? ' – ' + meeting.formatted_end_time : ''}
                </p>
                <ul
                  className={cx('my-0 mt-1', {
                    'd-none': !meeting.types || !meeting.types.length,
                  })}
                >
                  {meeting.types
                    ? meeting.types.map(type => {
                      return <li key={type}>{type}</li>;
                    })
                    : ''}
                </ul>
                {meeting.notes && (
                  <p className="my-0 mt-2">
                    {meeting.notes.replace(/(?:\r\n|\r|\n)/g, '<br>')}
                  </p>
                )}
              </div>
              <div className="list-group-item">
                <h5>{meeting.location}</h5>
                <p className="my-0 mt-1">{meeting.formatted_address}</p>
                {this.props.state.meetings &&
                  meeting &&
                  meeting.hasOwnProperty('formatted_address') && (
                    <>
                      {settings.days.map((day, index) => {
                        const meetings = this.props.state.meetings.filter(
                          m =>
                            m.day == index &&
                            m.formatted_address === meeting.formatted_address
                        );
                        return (
                          meetings.length > 0 && (
                            <div key={day}>
                              <h6 className="mt-3 pb-2 border-bottom">
                                {strings[day]}
                              </h6>
                              <ol
                                className="m-0 p-0"
                                style={{ listStyleType: 'none' }}
                              >
                                {meetings.map(m => (
                                  <li
                                    key={m.slug}
                                    style={{ paddingLeft: '5.25rem' }}
                                  >
                                    <span
                                      className="position-absolute text-muted text-right"
                                      style={{
                                        left: '1.25rem',
                                        width: '4.5rem',
                                      }}
                                    >
                                      {m.formatted_time}
                                    </span>
                                    {m.slug === meeting.slug && <Name meeting={m} />}
                                    {m.slug !== meeting.slug && (
                                      <Link
                                        meeting={m}
                                        state={this.props.state}
                                        setAppState={this.props.setAppState}
                                      />
                                    )}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )
                        );
                      })}
                    </>
                  )}
              </div>
            </div>
          </div>
          <div
            className={cx('col-md-8 map', {
              'd-none': !this.props.state.capabilities.map,
            })}
          >
            {this.state.viewport && meeting.latitude && (
              <ReactMapGL
                className="rounded border bg-light"
                {...this.state.viewport}
                mapboxApiAccessToken={settings.keys.mapbox}
                mapStyle={settings.mapbox_style}
                onViewportChange={this.updateViewport}
                width="100%"
                height="100%"
              >
                <Marker
                  latitude={meeting.latitude}
                  longitude={meeting.longitude}
                  offsetLeft={-settings.marker_style.width / 2}
                  offsetTop={-settings.marker_style.height}
                >
                  <div
                    title={meeting.location}
                    style={settings.marker_style}
                    onClick={() => this.setState({ popup: true })}
                  />
                </Marker>
                {this.state.popup && (
                  <Popup
                    latitude={meeting.latitude}
                    longitude={meeting.longitude}
                    className="popup"
                    onClose={() => this.setState({ popup: false })}
                    offsetTop={-settings.marker_style.height}
                  >
                    <h4 className="font-weight-light">{meeting.location}</h4>
                    <p>{meeting.formatted_address}</p>

                    {/*
                    <button
                      className="btn btn-outline-secondary btn-block"
                      href={meeting.direction_link}
                      target="_blank"
                    >
                      {strings.get_directions}
                    </button>
                    */}
                  </Popup>
                )}
                <div className="control">
                  <NavigationControl
                    showCompass={false}
                    onViewportChange={this.updateViewport}
                  />
                </div>
              </ReactMapGL>
            )}
          </div>
        </div>
      </div>
    );
  }
}
