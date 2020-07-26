import React, { useState } from 'react';
import cx from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';

import { settings, strings } from '../helpers/settings';
import Link from './link';
import Button from './button';
import { formatAddress } from '../helpers/format';

export default function Meeting({ state, setAppState }) {
  const meeting = state.meetings[state.input.meeting];

  const isApproxAddress = !formatAddress(meeting.formatted_address);

  const [popup, setPopup] = useState(true);

  const [viewport, setViewport] = useState({
    latitude: meeting.latitude,
    longitude: meeting.longitude,
    zoom: isApproxAddress ? 9 : 14,
  });

  //create a link for directions
  const iOS =
    !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

  const isTempClosed = meeting.types.includes(strings.types.TC);

  const directionsUrl =
    isTempClosed || isApproxAddress
      ? undefined
      : `${iOS ? 'maps://' : 'https://www.google.com/maps'}?daddr=${
          meeting.latitude
        },${meeting.longitude}&saddr=Current+Location&q=${encodeURIComponent(
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
          onClick={event => {
            event.preventDefault();
            setViewport(null);
            state.input.meeting = null;
            setAppState('input', state.input);
          }}
        >
          {strings.back_to_meetings}
        </a>
      </h6>
      <div className="row flex-grow-1">
        <div className="mb-3 col-md-4 mb-md-0">
          {directionsUrl && (
            <Button
              href={directionsUrl}
              text={strings.get_directions}
              icon="directions"
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
            {(!!meeting.conference_provider || !!meeting.conference_phone) && (
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
            {!isApproxAddress && (
              <div className="list-group-item py-3">
                {meeting.location && <h5>{meeting.location}</h5>}
                <p
                  className={cx('my-0 mt-1', {
                    'text-decoration-line-through text-muted': isTempClosed,
                  })}
                >
                  {meeting.formatted_address}
                </p>
                {state.meetings &&
                  meeting &&
                  meeting.hasOwnProperty('formatted_address') && (
                    <>
                      {settings.days.map((day, index) => {
                        const meetings = Object.values(state.meetings).filter(
                          m =>
                            m.formatted_address == meeting.formatted_address &&
                            m.start.day() == index
                        );
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
                                        state={state}
                                        setAppState={setAppState}
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
            )}
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
        {state.capabilities.map && (
          <div className="col-md-8 map">
            {viewport && meeting.latitude && (
              <ReactMapGL
                className="rounded border bg-light"
                {...viewport}
                mapboxApiAccessToken={settings.keys.mapbox}
                mapStyle={settings.mapbox_style}
                onViewportChange={setViewport}
                width="100%"
                height="100%"
              >
                {!isApproxAddress && (
                  <>
                    <Marker
                      latitude={meeting.latitude}
                      longitude={meeting.longitude}
                      offsetLeft={-settings.marker_style.width / 2}
                      offsetTop={-settings.marker_style.height}
                    >
                      <div
                        title={meeting.location}
                        style={settings.marker_style}
                        onClick={() => setPopup(true)}
                      />
                    </Marker>
                    {popup && (
                      <Popup
                        latitude={meeting.latitude}
                        longitude={meeting.longitude}
                        className="popup"
                        closeOnClick={false}
                        onClose={() => setPopup(false)}
                        offsetTop={-settings.marker_style.height}
                      >
                        <h4 className="font-weight-light mb-2">
                          {meeting.location}
                        </h4>
                        <p
                          className={cx('m-0', {
                            'text-decoration-line-through text-muted': isTempClosed,
                          })}
                        >
                          {meeting.formatted_address}
                        </p>

                        {directionsUrl ? (
                          <Button
                            className="mt-3"
                            href={directionsUrl}
                            text={strings.get_directions}
                            icon="directions"
                          />
                        ) : (
                          <Button
                            className="btn-outline-danger disabled mt-3"
                            text={strings.types.TC}
                            icon="x-circle"
                          />
                        )}
                      </Popup>
                    )}
                    <div className="control">
                      <NavigationControl
                        showCompass={false}
                        onViewportChange={setViewport}
                      />
                    </div>
                  </>
                )}
              </ReactMapGL>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
