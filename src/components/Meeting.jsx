import React, { useEffect } from 'react';
import cx from 'classnames/bind';
import moment from 'moment-timezone';

import { formatDirectionsUrl, settings, setTitle, strings } from '../helpers';
import Button from './Button';
import Icon from './Icon';
import Link from './Link';
import Map from './Map';

export default function Meeting({ meeting, state, setState }) {
  //scroll to top when you navigate to this page
  useEffect(() => {
    window.scroll(0, 0);
  }, [state.input.meeting]);

  //directions URL link
  const directionsUrl = meeting.isInPerson
    ? formatDirectionsUrl(meeting)
    : undefined;

  //set page title
  setTitle(meeting.name);

  //format time string (duration? or appointment?)
  const timeString = meeting.start
    ? `
      ${strings[settings.weekdays[meeting.start.format('d')]]},  
      ${meeting.start.format('h:mm a')}
      ${meeting.end ? ` – ${meeting.end.format('h:mm a')}` : ''}`
    : strings.appointment;

  //feedback URL link
  if (!meeting.feedback_url && settings.feedback_emails) {
    meeting.feedback_url = `mailto:${settings.feedback_emails.join()}?subject=${
      window.location.href
    }`;
  }

  return (
    <div
      className={cx('d-flex flex-column flex-grow-1 meeting', {
        'in-person': meeting.isInPerson,
        'inactive': !meeting.isInPerson && !meeting.isOnline,
        'online': meeting.isOnline,
      })}
    >
      <h1 className="fw-light mb-1">
        <Link meeting={meeting} />
      </h1>
      <h6 className="align-items-center border-bottom d-flex mb-3 pb-2">
        <Icon icon="back" />
        <a
          href={window.location.pathname}
          onClick={e => {
            e.preventDefault();
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
      <div className="flex-grow-1 row">
        <div className="align-content-start col-md-4 d-grid gap-3 mb-3 mb-md-0">
          {directionsUrl && (
            <Button
              className="in-person"
              href={directionsUrl}
              icon="geo"
              text={strings.get_directions}
            />
          )}
          <div className="list-group">
            <div className="d-grid gap-2 list-group-item py-3">
              <h5>{strings.meeting_information}</h5>
              <p>{timeString}</p>
              {meeting.types && (
                <ul className="ms-4">
                  {meeting.types.sort().map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              )}
              {meeting.notes && <Paragraphs text={meeting.notes} />}
            </div>
            {(meeting.conference_provider || meeting.conference_phone) && (
              <div className="d-grid gap-2 list-group-item py-3">
                <h5>{strings.types.online}</h5>
                {meeting.conference_provider && (
                  <div className="d-grid gap-2">
                    <Button
                      className="online"
                      href={meeting.conference_url}
                      icon="camera"
                      text={meeting.conference_provider}
                    />
                    {meeting.conference_url_notes && (
                      <Paragraphs
                        className="d-block text-muted"
                        text={meeting.conference_url_notes}
                      />
                    )}
                  </div>
                )}
                {meeting.conference_phone && (
                  <Button
                    className="online"
                    href={`tel:${meeting.conference_phone}`}
                    icon="telephone"
                    text={strings.phone}
                  />
                )}
                {meeting.conference_phone_notes && (
                  <Paragraphs
                    className="d-block text-muted"
                    text={meeting.conference_phone_notes}
                  />
                )}
              </div>
            )}
            {(meeting.venmo || meeting.square || meeting.paypal) && (
              <div className="d-grid gap-2 list-group-item py-3">
                <h5>{strings.seventh_tradition}</h5>
                {meeting.venmo && (
                  <Button
                    href={`https://venmo.com/${meeting.venmo.substr(1)}`}
                    icon="cash"
                    text="Venmo"
                  />
                )}
                {meeting.square && (
                  <Button
                    href={`https://cash.app/${meeting.square}`}
                    icon="cash"
                    text="Cash App"
                  />
                )}
                {meeting.paypal && (
                  <Button href={meeting.paypal} icon="cash" text="PayPal" />
                )}
              </div>
            )}
            {meeting.isInPerson && (
              <div className="d-grid gap-2 list-group-item py-3">
                {meeting.location && <h5>{meeting.location}</h5>}
                {meeting.formatted_address && (
                  <p
                    className={cx({
                      'text-decoration-line-through text-muted':
                        meeting.isTempClosed,
                    })}
                  >
                    {meeting.formatted_address}
                  </p>
                )}
                {meeting.location_notes && (
                  <Paragraphs text={meeting.location_notes} />
                )}
                <Weekdays
                  formattedAddress={meeting.formatted_address}
                  state={state}
                  slug={meeting.slug}
                  setState={setState}
                />
              </div>
            )}
            {(meeting.group || meeting.group_notes || meeting.district) && (
              <div className="d-grid gap-2 list-group-item py-3">
                {meeting.group && <h5>{meeting.group}</h5>}
                {meeting.group_notes && (
                  <Paragraphs text={meeting.group_notes} />
                )}
                {meeting.district && <p>{meeting.district}</p>}
                {!meeting.isInPerson && meeting.group && (
                  <Weekdays
                    group={meeting.group}
                    state={state}
                    slug={meeting.slug}
                    setState={setState}
                  />
                )}
              </div>
            )}
            {meeting.updated && (
              <div className="list-group-item">
                {strings.updated.replace(
                  '%updated%',
                  moment
                    .tz(meeting.updated, 'UTC')
                    .tz(settings.timezone)
                    .format('ll')
                )}
              </div>
            )}
          </div>

          {meeting.feedback_url && (
            <Button
              href={meeting.feedback_url}
              icon="edit"
              text={strings.feedback}
            />
          )}
        </div>
        {state.capabilities.map && (
          <div
            className={cx(
              { 'd-none d-md-block': !meeting.isInPerson },
              'col-md-8'
            )}
          >
            <Map
              filteredSlugs={[meeting.slug]}
              listMeetingsInPopup={false}
              state={state}
              setState={setState}
            />
          </div>
        )}
      </div>
    </div>
  );
}

//return paragraphs from possibly-multiline string
function Paragraphs({ text, className }) {
  return (
    <div className={className}>
      {text
        .split('\n')
        .filter(e => e)
        .map((p, index) => (
          <p key={index}>{p}</p>
        ))}
    </div>
  );
}

function Weekdays({ formattedAddress, group, state, slug, setState }) {
  return settings.weekdays
    .map((weekday, index) => ({
      name: strings[weekday],
      meetings: Object.values(state.meetings)
        .filter(m => m.start?.day() === index)
        .filter(
          m =>
            (formattedAddress && m.formatted_address === formattedAddress) ||
            (group && m.group === group)
        ),
    }))
    .filter(e => e.meetings.length)
    .map((weekday, index) => (
      <div key={index}>
        <h6 className="mt-2 mb-1">{weekday.name}</h6>
        <ol className="list-unstyled">
          {weekday.meetings.map((m, index) => (
            <li key={index} style={{ paddingLeft: '5.25rem' }}>
              <span
                className="position-absolute text-muted text-nowrap text-right"
                style={{
                  left: '1.25rem',
                  width: '4.5rem',
                }}
              >
                {m.start.format('h:mm a')}
              </span>
              {m.slug === slug && <Link meeting={m} />}
              {m.slug !== slug && (
                <Link meeting={m} setState={setState} state={state} />
              )}
            </li>
          ))}
        </ol>
      </div>
    ));
}
