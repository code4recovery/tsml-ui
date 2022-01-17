import React, { useState } from 'react';
import { formatClasses as cx, settings, strings } from '../helpers';

export default function Form({ feedbackEmails, meeting, typesInUse }) {
  const [mode, setMode] = useState();
  const [message, setMessage] = useState('');
  const [fields, setFields] = useState({
    'name': {
      help: 'Meeting names are typically in Title Case. Try to avoid using the words “AA” or “Meeting.”',
      label: 'Meeting Name',
      required: true,
      type: 'text',
      value: meeting.name,
    },
    'day': {
      label: 'Day',
      options: ['', ...settings.weekdays.map(weekday => strings[weekday])],
      span: 4,
      type: 'select',
      value: meeting.day === '' ? '' : strings[settings.weekdays[meeting.day]],
    },
    'time': {
      label: 'Time',
      span: 4,
      type: 'time',
      value: meeting.time,
    },
    'end_time': {
      label: 'End Time',
      span: 4,
      type: 'time',
      value: meeting.end_time,
    },
    'types': {
      current: meeting.types.map(type => strings.types[type]),
      label: 'Types',
      options: typesInUse,
      type: 'checkboxes',
      value: meeting.types.map(type => strings.types[type]),
    },
    'notes': {
      help: 'Additional information that could help someone find the meeting, eg “small house on west side of church.”',
      label: 'Notes',
      type: 'textarea',
      value: meeting.notes,
    },
    'conference_url': {
      help: 'This should be a full URL to join a video conference. Required for the meeting to be considered “online.”',
      label: 'Conference URL',
      placeholder:
        'e.g. https://zoom.us/d/123456789?pwd=128djof3fgG7efaSdfap231',
      span: 6,
      type: 'url',
      value: meeting.conference_url,
    },
    'conference_phone': {
      help: 'Full phone number, starting with + and country code, to join the meeting. Use , and # to make it a one-tap link.',
      label: 'Conference Phone',
      placeholder: 'e.g. tel:+16699009128,,1234567890#,,#,,121212#',
      span: 6,
      type: 'text',
      value: meeting.conference_phone,
    },
    'conference_url_notes': {
      help: 'Meeting ID and password (if applicable).',
      label: 'Conference URL Notes',
      placeholder: 'e.g. Meeting ID: 123 456 789 Password: 121212',
      span: 6,
      type: 'text',
      value: meeting.conference_url_notes,
    },
    'conference_phone_notes': {
      help: 'Phone number, meeting ID, and password (if applicable).',
      label: 'Conference Phone Notes',
      placeholder:
        'e.g. Dial-In: (669) 900-9128 Enter Meeting ID: 123 456 789# Password: 121212',
      span: 6,
      type: 'text',
      value: meeting.conference_phone_notes,
    },
    'location': {
      help: 'For in-person and hybrid meetings (as well as meetings that are marked Location Temporarily Closed), this is typically the building name.',
      label: 'Location',
      placeholder: 'e.g. Community Center',
      type: 'text',
      value: meeting.location,
    },
    'formatted_address': {
      help: 'In-person meetings (as well as meetings that are marked Location Temporarily Closed) require a street address, while online meetings can have a general location.',
      label: 'Address',
      type: 'text',
      value: meeting.formatted_address,
    },
    'location_notes': {
      help: 'Optional additional information that pertains to each meeting at this location.',
      label: 'Location Notes',
      type: 'textarea',
      value: meeting.location_notes,
    },
    'group': {
      help: 'Optional. This is helpful when a single group is responsible for several meetings.',
      label: 'Group',
      span: 4,
      type: 'text',
      value: meeting.group,
    },
    'website': {
      help: 'Optional website address for the group.',
      label: 'Website',
      placeholder: 'e.g. https://groupname.org',
      span: 4,
      type: 'url',
      value: meeting.website,
    },
    'email': {
      help: 'Optional public contact email, should not break personal anonymity.',
      label: 'Group Email',
      placeholder: 'e.g. hello@groupname.org',
      span: 4,
      type: 'email',
      value: meeting.email,
    },
    'venmo': {
      help: 'Optional Venmo handle for 7th Tradition contributions.',
      label: 'Venmo',
      placeholder: 'e.g. @GroupName',
      span: 4,
      type: 'text',
      value: meeting.venmo,
    },
    'paypal': {
      help: 'Optional PayPal.me URL for 7th Tradition contributions.',
      label: 'PayPal',
      placeholder: 'e.g. https://paypal.me/groupname',
      span: 4,
      type: 'url',
      value: meeting.paypal,
    },
    'square': {
      help: 'Optional cashtag for 7th Tradition contributions.',
      label: 'Cash App (Square)',
      placeholder: 'e.g. $GroupName',
      span: 4,
      type: 'text',
      value: meeting.square,
    },
    'group_notes': {
      help: 'Additional information that pertains to each meeting of this group.',
      label: 'Grop Notes',
      type: 'textarea',
      value: meeting.group_notes,
    },
  });

  const modes = {
    'update': 'Request Update',
    'add': 'Add New Meeting',
    'remove': 'Remove Meeting',
  };

  const canShow = field => {
    return ['location_notes', 'group_notes'].includes(field)
      ? !!meeting[field]
      : [
          'conference_url',
          'conference_url_notes',
          'conference_phone',
          'conference_phone_notes',
        ].includes(field)
      ? fields.types.current.includes('Online')
      : true;
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="btn-group h-100 w-100" role="group">
        {Object.keys(modes).map(m => (
          <button
            className={cx(
              { 'bg-secondary text-white': mode === m },
              'btn btn-outline-secondary d-flex align-items-center justify-content-center w-100'
            )}
            key={m}
            onClick={() => setMode(m === mode ? undefined : m)}
          >
            {modes[m]}
          </button>
        ))}
      </div>
      {mode && (
        <form
          onSubmit={e => {
            e.preventDefault();
            const lines = [fields.overview.current, ''];
            const fieldNames = Object.keys(fields);
            const changes = fieldNames
              .slice(1)
              .filter(
                field =>
                  typeof fields[field].current !== 'undefined' &&
                  fields[field].current !== fields[field].value
              );
            if (changes.length) {
              lines.push('---', 'CHANGES:', '');
              changes.forEach(field => {
                lines.push(
                  `* ${field}: ~~${fields[field].value}~~ ${fields[field].current}`
                );
              });
            }
            window.location = `mailto:${feedbackEmails.join()}?subject=${encodeURI(
              strings.email_subject.replace('%name%', meeting.name)
            )}&body=${encodeURI(lines.join('\n'))}`;
          }}
        >
          {mode !== 'remove' && (
            <div className="row">
              {Object.keys(fields).map((field, index) => {
                const {
                  autoFocus,
                  current,
                  help,
                  label,
                  options,
                  placeholder,
                  required,
                  span,
                  type,
                  value,
                } = fields[field];
                const props = {
                  'aria-describedby': `${field}-help`,
                  autoFocus: autoFocus,
                  className: cx('bg-light', {
                    'form-control': type !== 'select',
                    'form-select': type === 'select',
                    'is-valid':
                      typeof current !== 'undefined' &&
                      current !== value &&
                      (!required || current),
                  }),
                  id: field,
                  onChange: e => {
                    setFields({
                      ...fields,
                      [field]: {
                        ...fields[field],
                        current: e.target.value,
                      },
                    });
                  },
                  placeholder: placeholder,
                  required: required,
                  value: mode === 'update' ? current ?? value : undefined,
                };
                return (
                  canShow(field) && (
                    <div
                      className={cx('mb-3', `col-md-${span ?? 12}`)}
                      key={index}
                    >
                      <label htmlFor={field} className="form-label">
                        {label}
                      </label>
                      {['email', 'text', 'time', 'url'].includes(type) ? (
                        <input {...props} type={type} />
                      ) : type === 'select' ? (
                        <select {...props}>
                          {options.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : type === 'textarea' ? (
                        <textarea {...props} rows={4} />
                      ) : type === 'checkboxes' ? (
                        <div className="row">
                          {options.map((option, index) => (
                            <div
                              className="col-md-6 col-lg-4 col-xl-3"
                              key={index}
                            >
                              <div className="form-check">
                                <input
                                  checked={current.includes(option)}
                                  className="form-check-input"
                                  id={option}
                                  onChange={e => {
                                    setFields({
                                      ...fields,
                                      [field]: {
                                        ...fields[field],
                                        current: e.target.checked
                                          ? [...current, e.target.value]
                                          : current.filter(
                                              val => val !== e.target.value
                                            ),
                                      },
                                    });
                                  }}
                                  name={field.name}
                                  value={option}
                                  type="checkbox"
                                />
                                <label
                                  className="form-check-label"
                                  htmlFor={option}
                                >
                                  {option}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}
                      <div id={`${field}-help`} className="form-text">
                        {help}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
          <div className="row mt-4">
            <div className="col-md-6 mb-3">
              <textarea
                rows={2}
                name="overview"
                className="bg-light form-control"
                onChange={e => setMessage(e.target.value)}
                value={message}
                required
              />
            </div>
            <div className="col-md-6">
              <p className="form-text">
                In a sentence or two, please describe the change you're
                requesting.
              </p>
            </div>
            <div className="col-md-6 mb-3">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={message.length < 10}
              >
                Create Update Request Email
              </button>
            </div>
            <div className="col-md-6"></div>
          </div>
        </form>
      )}
    </div>
  );
}
