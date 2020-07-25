import React, { Component } from 'react';
import cx from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';

import { settings, strings } from '../helpers/settings';
import Link from './link';
import Button from './button';

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
    const meeting = this.props.state.meetings[this.props.state.input.meeting];

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

    meeting.directions_url = `${
      iOS ? 'maps://' : 'https://www.google.com/maps'
    }?daddr=${meeting.latitude},${
      meeting.longitude
    }&saddr=Current+Location&q=${encodeURIComponent(
      meeting.formatted_address
    )}`;

    //set page title
    document.title = meeting.name;

    return (
      <div className="flex-column flex-grow-1 d-flex">
        <h1 className="font-weight-light mb-1">
          <Link meeting={meeting} />
        </h1>
        <h6 className="border-bottom mb-3 pb-2">
          <span className="font-weight-bold mr-1">&larr;</span>
          <a
            href={window.location.pathname}
            onClick={event => this.goBack(event)}
          >
            {strings.back_to_meetings}
          </a>
        </h6>
        <div className="row flex-grow-1">
          <div className="mb-3 col-md-4 mb-md-0">
            {meeting.directions_url && (
              <Button
                href={meeting.directions_url}
                text={strings.get_directions}
                icon={'directions'}
                className="mb-3"
              />
            )}
            <div className="list-group">
              <div className="list-group-item py-3">
                <h5>{strings.meeting_information}</h5>
                <p className="my-0 mt-1">
                  {strings[settings.days[meeting.start.format('d')]]},{' '}
                  {meeting.start.format('h:mm a')}
                  {meeting.end ? ' – ' + meeting.end.format('h:mm a') : ''}
                </p>
                {meeting.types && (
                  <ul className="my-0 mt-1">
                    {meeting.types.sort().map(type => (
                      <li key={type}>{type}</li>
                    ))}
                  </ul>
                )}
                {meeting.notes && (
                  <p className="my-0 mt-2">
                    {meeting.notes.replace(/(?:\r\n|\r|\n)/g, '<br>')}
                  </p>
                )}
              </div>
              {(!!meeting.conference_provider ||
                !!meeting.conference_phone) && (
                <div className="list-group-item py-3">
                  <h5>{strings.types.ONL}</h5>
                  {!!meeting.conference_provider && (
                    <Button
                      text={meeting.conference_provider}
                      icon="camera-video"
                      href={meeting.conference_url}
                    />
                  )}
                  {!!meeting.conference_phone && (
                    <Button
                      text={strings.phone}
                      icon="telephone"
                      href={`tel:${meeting.conference_url}`}
                    />
                  )}
                </div>
              )}
              {(!!meeting.venmo || !!meeting.square || !!meeting.paypal) && (
                <div className="list-group-item py-3">
                  <h5>{strings.seventh_tradition}</h5>
                  {!!meeting.venmo && (
                    <Button
                      text="Venmo"
                      icon="cash"
                      href={`https://venmo.com/${meeting.venmo.substr(1)}`}
                    />
                  )}
                  {!!meeting.square && (
                    <Button
                      text="Cash App"
                      icon="cash"
                      href={`https://cash.app/${meeting.square}`}
                    />
                  )}
                  {!!meeting.paypal && (
                    <Button
                      text="PayPal"
                      icon="cash"
                      href={`https://www.paypal.me/${meeting.paypal}`}
                    />
                  )}
                </div>
              )}
              <div className="list-group-item py-3">
                {meeting.location && <h5>{meeting.location}</h5>}
                <p className="my-0 mt-1">{meeting.formatted_address}</p>
                {this.props.state.meetings &&
                  meeting &&
                  meeting.hasOwnProperty('formatted_address') && (
                    <>
                      {settings.days.map((day, index) => {
                        const meetings = Object.keys(this.props.state.meetings)
                          .filter(slug => {
                            const m = this.props.state.meetings[slug];
                            return (
                              m.day == index &&
                              m.formatted_address == meeting.formatted_address
                            );
                          })
                          .map(slug => this.props.state.meetings[slug]);
                        return (
                          meetings.length > 0 && (
                            <div key={day}>
                              <h6 className="border-bottom mt-3 pb-2">
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
                                      {m.start.format('h:mm a')}
                                    </span>
                                    {m.slug === meeting.slug && (
                                      <Link meeting={m} />
                                    )}
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
              {(meeting.group || meeting.group_notes) && (
                <div className="list-group-item py-3">
                  {!!meeting.group && (
                    <h5 className={cx({ 'm-0': !meeting.group_notes })}>
                      {meeting.group}
                    </h5>
                  )}
                  {!!meeting.group_notes && (
                    <p className="my-0 mt-1">{meeting.group_notes}</p>
                  )}
                </div>
              )}
            </div>
          </div>
          {this.props.state.capabilities.map && (
            <div className="col-md-8 map">
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
                      closeOnClick={false}
                      onClose={() => this.setState({ popup: false })}
                      offsetTop={-settings.marker_style.height}
                    >
                      <h4 className="font-weight-light">{meeting.location}</h4>
                      <p>{meeting.formatted_address}</p>

                      {meeting.directions_url && (
                        <Button
                          href={meeting.directions_url}
                          text={strings.get_directions}
                          icon={'directions'}
                        />
                      )}
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
          )}
        </div>
      </div>
    );
  }
}
