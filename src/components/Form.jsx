import React, { useState } from 'react';
import { formatClasses as cx, settings, strings } from '../helpers';
import Button from './Button';

export default function Form({
  closeForm,
  feedbackEmails,
  meeting,
  typesInUse,
}) {
  const [fields, setFields] = useState({
    'overview': {
      autoFocus: true,
      help: 'In a sentence or two, describe the change you want made.',
      label: 'Overview',
      required: true,
      type: 'textarea',
    },
    'name': {
      help: 'Meeting names are typically in Title Case.',
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
      span: 6,
      type: 'url',
      value: meeting.conference_url,
    },
    'conference_phone': {
      help: 'Full phone number, starting with + and country code, to join the meeting. Use , and # to make it a one-tap link.',
      label: 'Conference Phone',
      span: 6,
      type: 'text',
      value: meeting.conference_phone,
    },
    'conference_url_notes': {
      help: 'Meeting ID and password (if applicable).',
      label: 'Conference URL Notes',
      span: 6,
      type: 'text',
      value: meeting.conference_phone_notes,
    },
    'conference_phone_notes': {
      help: 'Phone number, meeting ID, and password (if applicable).',
      label: 'Conference Phone Notes',
      span: 6,
      type: 'text',
      value: meeting.conference_phone_notes,
    },
    'location': {
      help: 'For in-person and hybrid meetings, this is the building name, eg Community Center or First Congregational Church.',
      label: 'Location',
      type: 'text',
      value: meeting.location,
    },
    'formatted_address': {
      help: 'In-person meetings should have a full street address, while online meetings can have a general location, eg San Jose, CA, USA.',
      label: 'Address',
      type: 'text',
      value: meeting.formatted_address,
    },
    'location_notes': {
      help: 'Additional information that pertains to each meeting at this location.',
      label: 'Location Notes',
      showIfValueExists: true,
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
      span: 4,
      type: 'url',
      value: meeting.website,
    },
    'email': {
      help: 'Optional public contact email, should not break personal anonymity.',
      label: 'Group Email',
      span: 4,
      type: 'email',
      value: meeting.email,
    },
    'venmo': {
      help: 'Optional Venmo handle for 7th Tradition contributions.',
      label: 'Venmo',
      span: 4,
      type: 'text',
      value: meeting.venmo,
    },
    'paypal': {
      help: 'Optional PayPal.me URL for 7th Tradition contributions.',
      label: 'PayPal',
      span: 4,
      type: 'url',
      value: meeting.paypal,
    },
    'square': {
      help: 'Optional cashtag for 7th Tradition contributions.',
      label: 'Cash App (Square)',
      span: 4,
      type: 'text',
      value: meeting.square,
    },
    'group_notes': {
      help: 'Additional information that pertains to each meeting of this group.',
      label: 'Grop Notes',
      showIfValueExists: true,
      type: 'textarea',
      value: meeting.group_notes,
    },
  });
  return (
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
      <legend>Request Meeting Update</legend>
      <p className="mb-3">
        Use this form to generate an email to the meeting list coordinator. You
        will need to be able to send email from your device for this to work.
      </p>
      <div className="row">
        {Object.keys(fields).map((field, index) => {
          const {
            autoFocus,
            current,
            help,
            label,
            options,
            required,
            showIfValueExists,
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
            required: required,
            value: current ?? value,
          };
          return (
            (!showIfValueExists || value) && (
              <div className={cx('mb-3', `col-md-${span ?? 12}`)} key={index}>
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
                      <div className="col-md-6 col-lg-4 col-xl-3" key={index}>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            defaultChecked={value.includes(option)}
                            id={option}
                            type="checkbox"
                          />
                          <label className="form-check-label" htmlFor={option}>
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
      <div className="row mt-4">
        <div className="col-md-6 mb-3">
          <button className="btn btn-primary" type="submit">
            Send Update Request
          </button>
          <p className="mt-2 mb-3 form-text">
            Clicking this button will open a formatted email, just press "Send."
          </p>
        </div>
        <div className="col-md-3 offset-md-3 mb-3">
          <Button
            className="btn btn-outline-secondary"
            onClick={() => closeForm()}
            text="Cancel"
          />
        </div>
      </div>
    </form>
  );
}
