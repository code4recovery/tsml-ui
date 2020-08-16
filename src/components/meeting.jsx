import React, { useState } from 'react';
import cx from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';

import { settings, strings } from '../helpers/settings';
import Link from './link';
import Button from './button';
import { formatAddress, formatMultiline } from '../helpers/format';
import Stack from './stack';

export default function Meeting({ state, setAppState }) {
  const meeting = state.meetings[state.input.meeting];

  if (!meeting) {
    //todo display error somewhere else
    return null;
  }

  const isApproxAddress = !formatAddress(meeting.formatted_address);

  const [popup, setPopup] = useState(true);

  const [viewport, setViewport] = useState({
    latitude: meeting.latitude,
    longitude: meeting.longitude,
    zoom: isApproxAddress ? 10 : 14,
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
        },${meeting.longitude}&saddr=Current+Location&q=${encodeURI(
          meeting.formatted_address
        )}`;

  //set page title
  document.title = meeting.name;

  const weekdays = settings.weekdays
    .map((weekday, index) => {
      return {
        name: strings[weekday],
        meetings: Object.values(state.meetings).filter(
          m =>
            m.formatted_address == meeting.formatted_address &&
            m.start.day() == index
        ),
      };
    })
    .filter(e => e.meetings.length);

  return (
    <div className="flex-column flex-grow-1 d-flex meeting">
      <h1 className="font-weight-light mb-1">
        <Link meeting={meeting} />
      </h1>
      <h6 className="border-bottom mb-3 pb-2 d-flex align-items-center">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M7.854 4.646a.5.5 0 0 1 0 .708L5.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0z"
          />
          <path
            fillRule="evenodd"
            d="M4.5 8a.5.5 0 0 1 .5-.5h6.5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"
          />
        </svg>
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
            <Stack className="list-group-item py-3">
              <h5>{strings.meeting_information}</h5>
              <p>
                {strings[settings.weekdays[meeting.start.format('d')]]}
                {', '}
                {meeting.start.format('h:mm a')}
                {meeting.end && ` – ${meeting.end.format('h:mm a')}`}
              </p>
              {meeting.types && (
                <ul className="ml-4">
                  {meeting.types.sort().map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              )}
              {meeting.notes && <p>{formatMultiline(meeting.notes)}</p>}
            </Stack>
            {(!!meeting.conference_provider || !!meeting.conference_phone) && (
              <Stack className="list-group-item py-3">
                <h5>{strings.types.ONL}</h5>
                {!!meeting.conference_provider && (
                  <Stack>
                    <Button
                      text={meeting.conference_provider}
                      icon="camera-video"
                      href={meeting.conference_url}
                    />
                    {!!meeting.conference_url_notes && (
                      <small className="d-block text-muted">
                        {formatMultiline(meeting.conference_url_notes)}
                      </small>
                    )}
                  </Stack>
                )}
                {!!meeting.conference_phone && (
                  <Button
                    text={strings.phone}
                    icon="telephone"
                    href={`tel:${meeting.conference_phone}`}
                  />
                )}
                {!!meeting.conference_phone_notes && (
                  <small className="d-block text-muted">
                    {formatMultiline(meeting.conference_phone_notes)}
                  </small>
                )}
              </Stack>
            )}
            {(!!meeting.venmo || !!meeting.square || !!meeting.paypal) && (
              <Stack className="list-group-item py-3">
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
              </Stack>
            )}
            {!isApproxAddress && (
              <Stack className="list-group-item py-3">
                {!!meeting.location && <h5>{meeting.location}</h5>}
                {!!meeting.formatted_address && (
                  <p
                    className={cx({
                      'text-decoration-line-through text-muted': isTempClosed,
                    })}
                  >
                    {meeting.formatted_address}
                  </p>
                )}
                {!!meeting.location_notes && (
                  <p>{formatMultiline(meeting.location_notes)}</p>
                )}
                {!!weekdays.length && (
                  <Stack>
                    {weekdays.map((weekday, index) => (
                      <Stack key={index} spacing={1}>
                        <h6>{weekday.name}</h6>
                        <ol style={{ listStyleType: 'none' }}>
                          {weekday.meetings.map(m => (
                            <li key={m.slug} style={{ paddingLeft: '5.25rem' }}>
                              <span
                                className="position-absolute text-muted text-nowrap text-right"
                                style={{
                                  left: '1.25rem',
                                  width: '4.5rem',
                                }}
                              >
                                {m.start.format('h:mm a')}
                              </span>
                              {m.slug === meeting.slug && <Link meeting={m} />}
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
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
            {(meeting.group || meeting.group_notes) && (
              <Stack className="list-group-item py-3">
                {!!meeting.group && <h5>{meeting.group}</h5>}
                {!!meeting.group_notes && <p>{meeting.group_notes}</p>}
              </Stack>
            )}
          </div>
        </div>
        {state.capabilities.map && (
          <div className="col-md-8 map">
            {viewport && meeting.latitude && (
              <ReactMapGL
                className="rounded border bg-light"
                {...viewport}
                mapboxApiAccessToken={settings.map.key}
                mapStyle={settings.map.style}
                onViewportChange={isApproxAddress ? undefined : setViewport}
                height="100%"
                width="100%"
              >
                {!isApproxAddress && (
                  <>
                    <Marker
                      latitude={meeting.latitude}
                      longitude={meeting.longitude}
                      offsetLeft={-settings.map.markers.location.width / 2}
                      offsetTop={-settings.map.markers.location.height}
                    >
                      <div
                        title={meeting.location}
                        style={settings.map.markers.location}
                        onClick={() => setPopup(true)}
                      />
                    </Marker>
                    {popup && (
                      <Popup
                        latitude={meeting.latitude}
                        longitude={meeting.longitude}
                        closeOnClick={false}
                        onClose={() => setPopup(false)}
                        offsetTop={-settings.map.markers.location.height}
                      >
                        <Stack>
                          <h4 className="font-weight-light">
                            {meeting.location}
                          </h4>
                          <p
                            className={cx({
                              'text-decoration-line-through text-muted': isTempClosed,
                            })}
                          >
                            {meeting.formatted_address}
                          </p>
                          {directionsUrl ? (
                            <Button
                              href={directionsUrl}
                              icon="directions"
                              text={strings.get_directions}
                            />
                          ) : (
                            <Button
                              className="btn-outline-danger disabled"
                              icon="x-circle"
                              text={strings.types.TC}
                            />
                          )}
                        </Stack>
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
