import React, { useEffect, useState } from 'react';
import cx from 'classnames/bind';

import { formatDirectionsUrl, formatIcs, settings, strings } from '../helpers';
import Button from './Button';
import Icon from './Icon';
import Link from './Link';
import Map from './Map';

export default function Meeting({ state, setState }) {
  //open types
  const [define, setDefine] = useState(null);

  //existence checked in the parent component
  const meeting = state.meetings[state.input.meeting];

  //scroll to top when you navigate to this page
  useEffect(() => {
    document.getElementById('tsml-ui')?.scrollIntoView();
  }, [state.input.meeting]);

  //directions URL link
  const directionsUrl = meeting.isInPerson
    ? formatDirectionsUrl(meeting)
    : undefined;

  //set page title
  document.title = meeting.name;

  //format time string (duration? or appointment?)
  const timeString = meeting.start
    ? strings[settings.weekdays[meeting.start.format('d')]].concat(
        ' ',
        meeting.start.format('h:mm a'),
        meeting.end ? ` – ${meeting.end.format('h:mm a')}` : ''
      )
    : strings.appointment;

  //feedback URL link
  if (!meeting.feedback_url && settings.feedback_emails.length) {
    meeting.feedback_url = `mailto:${settings.feedback_emails.join()}?subject=${
      window.location.href
    }`;
  }

  const contactButtons = [];

  if (meeting.email) {
    contactButtons.push({
      href: `mailto:${meeting.email}`,
      icon: 'email',
      text: meeting.email,
    });
  }
  if (meeting.website) {
    contactButtons.push({
      href: meeting.website,
      target: '_blank',
      icon: 'link',
      text: new URL(meeting.website).host.replace('www.', ''),
    });
  }
  if (meeting.phone) {
    contactButtons.push({
      href: meeting.phone,
      icon: 'tel',
      text: meeting.phone,
    });
  }
  if (meeting.venmo) {
    contactButtons.push({
      href: `https://venmo.com/${meeting.venmo.substr(1)}`,
      icon: 'cash',
      text: strings.contribute_with.replace('%service%', 'Venmo'),
    });
  }
  if (meeting.square) {
    contactButtons.push({
      href: `https://cash.app/${meeting.square}`,
      icon: 'cash',
      text: strings.contribute_with.replace('%service%', 'Cash App'),
    });
  }
  if (meeting.paypal) {
    contactButtons.push({
      href: meeting.paypal,
      icon: 'cash',
      text: strings.contribute_with.replace('%service%', 'PayPal'),
    });
  }

  const locationWeekdays = settings.weekdays.map((weekday, index) => ({
    name: strings[weekday],
    meetings: Object.values(state.meetings)
      .filter(m => m.start?.day() === index)
      .filter(
        m =>
          meeting.isInPerson &&
          meeting.address &&
          m.isInPerson &&
          m.formatted_address === meeting.formatted_address
      ),
  }));

  const groupWeekdays = settings.weekdays.map((weekday, index) => ({
    name: strings[weekday],
    meetings: Object.values(state.meetings)
      .filter(m => m.start?.day() === index)
      .filter(
        m =>
          meeting.group &&
          (m.isOnline || m.isInPerson) &&
          m.group === meeting.group
      ),
  }));

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
      <div className="align-items-center border-bottom d-flex h6 mb-3 pb-2">
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
      </div>
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
              <h2 className="h5">{strings.meeting_information}</h2>
              <p>{timeString}</p>
              {state.capabilities.type && meeting.types && (
                <ul className="ms-4">
                  {meeting.types
                    .filter(type => type !== 'active')
                    .sort((a, b) =>
                      strings.types[a].localeCompare(strings.types[b])
                    )
                    .map((type, index) =>
                      strings.type_descriptions[type] ? (
                        <li
                          className="cursor-pointer m-0"
                          key={index}
                          onClick={() =>
                            setDefine(define === type ? null : type)
                          }
                        >
                          <div className="d-flex align-items-center gap-2">
                            <span>{strings.types[type]}</span>
                            <Icon
                              icon="info"
                              size={13}
                              className={
                                define === type ? 'text-muted' : undefined
                              }
                            />
                          </div>
                          {define === type && (
                            <small className="d-block mt-1 mb-2">
                              {strings.type_descriptions[type]}
                            </small>
                          )}
                        </li>
                      ) : (
                        <li className="m-0" key={index}>
                          {strings.types[type]}
                        </li>
                      )
                    )}
                </ul>
              )}
              {meeting.notes && <Paragraphs text={meeting.notes} />}
              {(meeting.isInPerson ||
                meeting.isOnline ||
                (!meeting.group && !!contactButtons.length)) && (
                <div className="d-grid gap-3 mt-2">
                  {meeting.conference_provider && (
                    <div className="d-grid gap-1">
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
                    <div className="d-grid gap-1">
                      <Button
                        className="online"
                        href={`tel:${meeting.conference_phone}`}
                        icon="phone"
                        text={strings.phone}
                      />
                      {meeting.conference_phone_notes && (
                        <Paragraphs
                          className="d-block text-muted"
                          text={meeting.conference_phone_notes}
                        />
                      )}
                    </div>
                  )}
                  {meeting.start &&
                    meeting.timezone &&
                    (meeting.isInPerson || meeting.isOnline) && (
                      <Button
                        onClick={() => formatIcs(meeting)}
                        icon="calendar"
                        text={strings.add_to_calendar}
                      />
                    )}
                  {!meeting.group &&
                    contactButtons.map((button, index) => (
                      <Button {...button} key={index} />
                    ))}
                </div>
              )}
            </div>
            {meeting.address && (
              <div
                className={cx(
                  {
                    'text-decoration-line-through text-muted':
                      meeting.isTempClosed,
                  },
                  'd-grid gap-2 list-group-item py-3'
                )}
              >
                {meeting.location && <h2 className="h5">{meeting.location}</h2>}
                {meeting.formatted_address && (
                  <p>{meeting.formatted_address}</p>
                )}
                {meeting.regions && <p>{meeting.regions.join(' > ')}</p>}
                {meeting.location_notes && (
                  <Paragraphs text={meeting.location_notes} />
                )}
                {formatWeekdays(
                  locationWeekdays,
                  meeting.slug,
                  state,
                  setState
                )}
              </div>
            )}
            {meeting.group &&
              (!meeting.address ||
                meeting.district ||
                meeting.group_notes ||
                !!groupWeekdays.length ||
                !!contactButtons.length) && (
                <div className="d-grid gap-2 list-group-item py-3">
                  <h2 className="h5">{meeting.group}</h2>
                  {meeting.district && <p>{meeting.district}</p>}
                  {meeting.group_notes && (
                    <Paragraphs text={meeting.group_notes} />
                  )}
                  {meeting.group && !!contactButtons.length && (
                    <div className="d-grid gap-3 mt-2">
                      {contactButtons.map((button, index) => (
                        <Button {...button} key={index} />
                      ))}
                    </div>
                  )}
                  {formatWeekdays(groupWeekdays, meeting.slug, state, setState)}
                </div>
              )}
            {meeting.updated && (
              <div className="list-group-item">
                {strings.updated.replace('%updated%', meeting.updated)}
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
              { 'd-md-block d-none': !meeting.isInPerson },
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

function formatWeekdays(weekday, slug, state, setState) {
  return weekday
    .filter(e => e.meetings.length)
    .map((weekday, index) => (
      <div key={index}>
        <h3 className="h6 mb-1 mt-2">{weekday.name}</h3>
        <ol className="list-unstyled">
          {weekday.meetings.map((m, index) => (
            <li
              className="d-flex flex-row gap-2 justify-content-between m-0"
              key={index}
            >
              <div className="text-muted text-nowrap">
                {m.start.format('h:mm a')}
              </div>
              <div className="flex-grow-1">
                {m.slug === slug && <Link meeting={m} />}
                {m.slug !== slug && (
                  <Link meeting={m} setState={setState} state={state} />
                )}
              </div>
              <div className="align-items-start d-flex gap-1 justify-content-end pt-1">
                {m.isInPerson && (
                  <small className="align-items-center d-flex flex-row float-end gap-2 px-2 py-1 rounded text-sm in-person">
                    <Icon icon="geo" size={13} />
                  </small>
                )}
                {m.isOnline && (
                  <small className="align-items-center d-flex flex-row float-end gap-2 px-2 py-1 rounded text-sm online">
                    {m.conference_provider && <Icon icon="camera" size={13} />}
                    {m.conference_phone && <Icon icon="phone" size={13} />}
                  </small>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    ));
}
