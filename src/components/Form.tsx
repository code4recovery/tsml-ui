import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { formatClasses as cx, settings, strings } from '../helpers';
import type { Meeting } from '../types';

type FormProps = {
  feedbackEmails: string[];
  meeting: Meeting;
  typesInUse: string[];
};

type FormField = {
  help?: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  span?: number;
  options?: string[];
  type:
    | 'text'
    | 'email'
    | 'textarea'
    | 'select'
    | 'checkboxes'
    | 'time'
    | 'url';
  value?: string | string[];
  current?: string | string[];
};

type FormFields = {
  [index: string]: FormField;
};

export default function Form({
  feedbackEmails,
  meeting,
  typesInUse,
}: FormProps) {
  const [mode, setMode] = useState<string | undefined>();
  const modes = {
    update: {
      title: 'Request Update',
      button: 'Send Update Request',
    },
    add: {
      title: 'Add New Meeting',
      button: 'Send New Meeting Request',
    },
    remove: {
      title: 'Remove Meeting',
      button: 'Send Removal Request',
    },
  };

  const formFields: FormFields = {
    name: {
      help: 'Meeting names are typically in Title Case. Try to avoid using the words “AA” or “Meeting.”',
      label: 'Meeting Name',
      required: true,
      type: 'text',
    },
    day: {
      label: 'Day',
      options: ['', ...settings.weekdays.map(weekday => strings[weekday])],
      span: 4,
      type: 'select',
    },
    time: {
      label: 'Time',
      span: 4,
      type: 'time',
    },
    end_time: {
      label: 'End Time',
      span: 4,
      type: 'time',
    },
    types: {
      label: 'Types',
      options: typesInUse,
      type: 'checkboxes',
    },
    notes: {
      help: 'Additional information that could help someone find the meeting, eg “small house on west side of church.”',
      label: 'Notes',
      type: 'textarea',
    },
    conference_url: {
      help: 'This should be a full URL to join a video conference. Required for the meeting to be considered “online.”',
      label: 'Conference URL',
      placeholder:
        'e.g. https://zoom.us/d/123456789?pwd=128djof3fgG7efaSdfap231',
      span: 6,
      type: 'url',
    },
    conference_phone: {
      help: 'Full phone number, starting with + and country code, to join the meeting. Use , and # to make it a one-tap link.',
      label: 'Conference Phone',
      placeholder: 'e.g. tel:+16699009128,,1234567890#,,#,,121212#',
      span: 6,
      type: 'text',
    },
    conference_url_notes: {
      help: 'Meeting ID and password (if applicable).',
      label: 'Conference URL Notes',
      placeholder: 'e.g. Meeting ID: 123 456 789 Password: 121212',
      span: 6,
      type: 'text',
    },
    conference_phone_notes: {
      help: 'Phone number, meeting ID, and password (if applicable).',
      label: 'Conference Phone Notes',
      placeholder:
        'e.g. Dial-In: (669) 900-9128 Enter Meeting ID: 123 456 789# Password: 121212',
      span: 6,
      type: 'text',
    },
    location: {
      help: 'For in-person and hybrid meetings (as well as meetings that are marked Location Temporarily Closed), this is typically the building name.',
      label: 'Location',
      placeholder: 'e.g. Community Center',
      type: 'text',
    },
    formatted_address: {
      help: 'In-person meetings (as well as meetings that are marked Location Temporarily Closed) require a street address, while online meetings can have a general location.',
      label: 'Address',
      type: 'text',
    },
    location_notes: {
      help: 'Optional additional information that pertains to each meeting at this location.',
      label: 'Location Notes',
      type: 'textarea',
    },
    group: {
      help: 'Optional. This is helpful when a single group is responsible for several meetings.',
      label: 'Group',
      span: 4,
      type: 'text',
    },
    website: {
      help: 'Optional website address for the group.',
      label: 'Website',
      placeholder: 'e.g. https://groupname.org',
      span: 4,
      type: 'url',
    },
    email: {
      help: 'Optional public contact email, should not break personal anonymity.',
      label: 'Group Email',
      placeholder: 'e.g. hello@groupname.org',
      span: 4,
      type: 'email',
    },
    venmo: {
      help: 'Optional Venmo handle for 7th Tradition contributions.',
      label: 'Venmo',
      placeholder: 'e.g. @GroupName',
      span: 4,
      type: 'text',
    },
    paypal: {
      help: 'Optional PayPal.me URL for 7th Tradition contributions.',
      label: 'PayPal',
      placeholder: 'e.g. https://paypal.me/groupname',
      span: 4,
      type: 'url',
    },
    square: {
      help: 'Optional cashtag for 7th Tradition contributions.',
      label: 'Cash App (Square)',
      placeholder: 'e.g. $GroupName',
      span: 4,
      type: 'text',
    },
    group_notes: {
      help: 'Additional information that pertains to each meeting of this group.',
      label: 'Grop Notes',
      type: 'textarea',
    },
    your_name: {
      label: 'Your Name',
      required: true,
      type: 'text',
      span: 5,
    },
    your_email: {
      label: 'Your Email',
      required: true,
      type: 'email',
      span: 5,
    },
    comments: {
      help: 'In a sentence or two, please describe the change you’re requesting.',
      label: 'Comments',
      required: true,
      span: 10,
      type: 'textarea',
    },
  };
  const getDefaultValue = (field: keyof FormFields): string | string[] => {
    if (meeting.types && field === 'types') {
      return meeting.types?.map(type => strings.types[type]);
    }
    if (field === 'day' && meeting.day) {
      return `${
        strings[
          settings.weekdays[
            meeting.day as keyof typeof settings.weekdays
          ] as keyof Translation
        ]
      }`;
    }
    const value = meeting[field as keyof Meeting];
    if (typeof value === 'string') return value;
    return '';
  };

  Object.keys(formFields).forEach(
    field =>
      (formFields[field] = {
        ...formFields[field],
        current: getDefaultValue(field),
        value: getDefaultValue(field),
      })
  );
  const [fields, setFields] = useState(formFields);
  const canShow = (field: keyof Meeting) =>
    ['location_notes', 'group_notes'].includes(field)
      ? !!meeting[field]
      : [
          'conference_url',
          'conference_url_notes',
          'conference_phone',
          'conference_phone_notes',
        ].includes(field)
      ? Array.isArray(fields.types.current) &&
        fields.types.current?.includes('Online')
      : true;

  const form = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mode && form.current) {
      window.scrollTo({
        top: form.current.getBoundingClientRect().top - 16,
        behavior: 'smooth',
      });
    }
  }, [mode]);
  return (
    <div className="d-flex flex-column gap-3" ref={form}>
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
            {modes[m as keyof typeof modes].title}
          </button>
        ))}
      </div>
      {mode && (
        <form
          onSubmit={e => {
            e.preventDefault();
            const lines = [fields.comments.current, ''];
            const changes = Object.keys(fields)
              .slice(1)
              .filter(field => fields[field].current !== fields[field].value);
            if (changes.length) {
              lines.push('---', 'CHANGES:', '');
              changes.forEach(field => {
                lines.push(
                  `* ${field}: ~~${fields[field].value}~~ ${fields[field].current}`
                );
              });
            }
            console.log(lines.join('\n'));
            /*
            window.location = `mailto:${feedbackEmails.join()}?subject=${encodeURI(
              strings.email_subject.replace('%name%', meeting.name)
            )}&body=${encodeURI(lines.join('\n'))}`;
            */
          }}
        >
          {mode !== 'remove' && (
            <div className="row">
              {Object.keys(fields).map((field, index) => {
                const {
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
                  className: cx('bg-light', {
                    'form-control': type !== 'select',
                    'form-select': type === 'select',
                    'is-valid': current !== value && (!required || !!current),
                  }),
                  id: field,
                  onChange: (
                    e: ChangeEvent<
                      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                    >
                  ) =>
                    setFields({
                      ...fields,
                      [field]: {
                        ...fields[field],
                        current: e.target.value,
                      },
                    }),
                  placeholder: placeholder,
                  required: required,
                  value: mode === 'update' ? current ?? value : undefined,
                };
                return (
                  canShow(field as keyof Meeting) && (
                    <div
                      className={cx('mb-3', `col-md-${span ?? 12}`)}
                      key={index}
                    >
                      <label className="form-label" htmlFor={field}>
                        {label}
                      </label>
                      {['email', 'text', 'time', 'url'].includes(type) &&
                      typeof value === 'string' ? (
                        <input type={type} {...props} />
                      ) : type === 'select' && typeof value === 'string' ? (
                        <select {...props}>
                          {options?.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : type === 'textarea' && typeof value === 'string' ? (
                        <textarea {...props} rows={4} />
                      ) : type === 'checkboxes' && Array.isArray(current) ? (
                        <div className="row">
                          {options?.map((option, index) => (
                            <div
                              className="col-sm-6 col-lg-4 col-xl-3"
                              key={index}
                            >
                              <div className="form-check">
                                <input
                                  checked={current?.includes(option)}
                                  className="form-check-input"
                                  id={option}
                                  name={field}
                                  onChange={e =>
                                    setFields({
                                      ...fields,
                                      [field]: {
                                        ...fields[field],
                                        current: e.target.checked
                                          ? [...current, e.target.value]
                                          : current?.filter(
                                              val => val !== e.target.value
                                            ),
                                      },
                                    })
                                  }
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
                      <div className="form-text" id={`${field}-help`}>
                        {help}
                      </div>
                    </div>
                  )
                );
              })}
            </div>
          )}
          <button className="btn btn-primary mt-4 btn-lg" type="submit">
            {modes[mode as keyof typeof modes].button}
          </button>
        </form>
      )}
    </div>
  );
}
