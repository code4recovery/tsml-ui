import React, { useEffect, useState } from 'react';
import cx from 'classnames/bind';
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';

import { formatAddress, formatMultiline, settings, strings } from '../helpers';
import Button from './Button';
import Icon from './Icon';
import Link from './Link';
import Stack from './Stack';

export default function Meeting({ state, setState }) {
  const meeting = state.meetings[state.input.meeting];

  //scroll to top when you navigate to this page
  useEffect(() => {
    window.scroll(0, 0);
  }, [state.input.meeting]);

  if (!meeting) {
    //todo display an error somewhere
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
        <Icon icon="back" />
        <a
          href={window.location.pathname}
          onClick={e => {
            e.preventDefault();
            setViewport(null);
            setState({
              ...state,
              input: {
                ...state.input,
                meeting: null,
              },
            });
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
              <p class="meeting-time">
                {strings[settings.weekdays[meeting.start.format('d')]]}
                {', '}
                {meeting.start.format('h:mm a')}
                {meeting.end && ` – ${meeting.end.format('h:mm a')}`}
              </p>
              {meeting.types && (
                <ul className="ml-4 meeting-types">
                  {meeting.types.sort().map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              )}
              {meeting.notes && <p class="meeting-notes">{formatMultiline(meeting.notes)}</p>}
            </Stack>
            {(!!meeting.conference_provider || !!meeting.conference_phone) && (
              <Stack className="list-group-item py-3">
                <h5>{strings.types.ONL}</h5>
                {!!meeting.conference_provider && (
                  <Stack className={'conference-provider'}>
                    <Button
                      text={meeting.conference_provider}
                      icon="camera"
                      href={meeting.conference_url}
                      className={'conference-url'}
                    />
                    {!!meeting.conference_url_notes && (
                      <small className="d-block text-muted conference-url-notes">
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
                    className={'conference-phone'}
                  />
                )}
                {!!meeting.conference_phone_notes && (
                  <small className="d-block text-muted conference-phone-notes">
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
                    className={'venmo'}
                  />
                )}
                {!!meeting.square && (
                  <Button
                    text="Cash App"
                    icon="cash"
                    href={`https://cash.app/${meeting.square}`}
                    className={'square'}
                  />
                )}
                {!!meeting.paypal && (
                  <Button
                    text="PayPal"
                    icon="cash"
                    href={meeting.paypal}
                    className={'paypal'}
                  />
                )}
              </Stack>
            )}
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
                <p class="location-notes">{formatMultiline(meeting.location_notes)}</p>
              )}
              {!isApproxAddress && !!weekdays.length && (
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
                                setState={setState}
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
            {(meeting.group || meeting.group_notes) && (
              <Stack className="list-group-item py-3">
                {!!meeting.group && <h5>{meeting.group}</h5>}
                {!!meeting.group_notes && <p class="meeting-group-notes">{meeting.group_notes}</p>}
              </Stack>
            )}
          </div>

          {meeting.feedback_url && (
            <Button
              href={meeting.feedback_url}
              text={strings.feedback}
              icon="edit"
              className="mt-3 feedback-url"
            />
          )}
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
                              icon="close"
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
