import React from 'react';
import { settings, strings } from '../helpers';

export default function Form({ meeting, closeForm, typesInUse }) {
  console.log(meeting);
  const verboseTypes = meeting.types.map(type => strings.types[type]);
  return (
    <form>
      <legend>Request Meeting Update</legend>
      <div className="mb-3">
        <label htmlFor="overview" className="form-label">
          Overview
        </label>
        <textarea
          className="form-control bg-light"
          id="overview"
          aria-describedby="overview-help"
          required
          autoFocus
        />
        <div id="overview-help" className="form-text">
          In a sentence or two, describe the change you're trying to make.
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Meeting Name
        </label>
        <input
          type="text"
          className="form-control bg-light"
          id="name"
          aria-describedby="name-help"
          defaultValue={meeting.name}
          required
        />
        <div id="name-help" className="form-text">
          Meeting names are typically in Title Case.
        </div>
      </div>
      <div className="row">
        <div className="mb-3 col-md-4">
          <label htmlFor="time" className="form-label">
            Day
          </label>
          <select
            className="form-select bg-light"
            id="day"
            aria-describedby="day-help"
            defaultValue={meeting.day}
          >
            <option value="" />
            {settings.weekdays.map((weekday, index) => (
              <option value={index} key={index}>
                {strings[weekday]}
              </option>
            ))}
          </select>
          <div id="day-help" className="form-text"></div>
        </div>
        <div className="mb-3 col-md-4">
          <label htmlFor="time" className="form-label">
            Time
          </label>
          <input
            type="time"
            className="form-control bg-light"
            id="time"
            aria-describedby="time-help"
            defaultValue={meeting.time}
          />
          <div id="time-help" className="form-text"></div>
        </div>
        <div className="mb-3 col-md-4">
          <label htmlFor="end_time" className="form-label">
            End Time
          </label>
          <input
            type="time"
            className="form-control bg-light"
            id="end_time"
            aria-describedby="end_time-help"
            defaultValue={meeting.end_time}
          />
          <div id="end_time-help" className="form-text"></div>
        </div>
      </div>
      <div className="mb-3">
        <div className="row">
          <div className="col-md-12">
            <label className="form-label">Types</label>
          </div>
          {typesInUse.map((type, index) => (
            <div className="col-md-3" key={index}>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="exampleCheck1"
                  defaultChecked={verboseTypes.includes(type)}
                />
                <label className="form-check-label" htmlFor="exampleCheck1">
                  {type}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="notes" className="form-label">
          Notes
        </label>
        <textarea
          className="form-control bg-light"
          id="notes"
          aria-describedby="notes-help"
          defaultValue={meeting.notes}
        />
        <div id="notes-help" className="form-text">
          Additional information that could help someone find the meeting, eg{' '}
          <em>Enter the church from rear</em>.
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="conference_url" className="form-label">
            Conference URL
          </label>
          <input
            type="url"
            className="form-control bg-light"
            id="conference_url"
            aria-describedby="conference_url-help"
            defaultValue={meeting.conference_url}
            placeholder="https://zoom.us/j/1234567890?pwd=A0a0B1b1C2c2D3d3E4e4F5f5G6g6H7h7"
          />
          <div id="conference_url-help" className="form-text">
            This should be a full URL to join a video conference. Required for
            the meeting to be considered "online."
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="conference_phone" className="form-label">
            Conference Phone
          </label>
          <input
            type="text"
            className="form-control bg-light"
            id="conference_phone"
            aria-describedby="conference_phone-help"
            defaultValue={meeting.conference_phone}
            placeholder="+16699009128,,1234567890#,,#,,121212#"
          />
          <div id="conference_phone-help" className="form-text">
            Full phone number, starting with + and country code, to join the
            meeting. Use , and # to make it a one-tap link.
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="conference_url_notes" className="form-label">
            Conference URL Notes
          </label>
          <input
            type="url"
            className="form-control bg-light"
            id="conference_url_notes"
            aria-describedby="conference_url_notes-help"
            defaultValue={meeting.conference_url_notes}
            placeholder="Meeting ID: 123 456 7890 Password: 121212"
          />
          <div id="conference_url_notes-help" className="form-text">
            Meeting ID and password (if applicable).
          </div>
        </div>
        <div className="col-md-6 mb-3">
          <label htmlFor="conference_phone_notes" className="form-label">
            Conference Phone Notes
          </label>
          <input
            type="text"
            className="form-control bg-light"
            id="conference_phone_notes"
            aria-describedby="conference_phone_notes-help"
            defaultValue={meeting.conference_phone_notes}
            placeholder="Dial-In: (669) 900-9128 Enter Meeting ID: 123 456 7890# Password: 121212"
          />
          <div id="conference_phone_notes-help" className="form-text">
            Phone number, meeting ID, and password (if applicable).
          </div>
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="location" className="form-label">
          Location
        </label>
        <input
          type="text"
          className="form-control bg-light"
          id="location"
          aria-describedby="location-help"
          defaultValue={meeting.location}
          required
        />
        <div id="location-help" className="form-text">
          For in-person and hybrid meetings, this is the building name, eg{' '}
          <em>Community Center</em> or <em>First Congregational Church</em>.
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="formatted_address" className="form-label">
          Address
        </label>
        <input
          type="text"
          className="form-control bg-light"
          id="formatted_address"
          aria-describedby="formatted_address-help"
          defaultValue={meeting.formatted_address}
          required
        />
        <div id="formatted_address-help" className="form-text">
          In-person meetings should have a full street address, while online
          meetings can have a general location, eg <em>San Jose, CA, USA</em>.
        </div>
      </div>
      {meeting.location_notes && (
        <div className="mb-3">
          <label htmlFor="location_notes" className="form-label">
            Location Notes
          </label>
          <textarea
            className="form-control bg-light"
            id="location_notes"
            aria-describedby="location_notes-help"
            defaultValue={meeting.location_notes}
          />
          <div id="location_notes-help" className="form-text"></div>
        </div>
      )}
      <div className="row">
        <div className="mb-3 col-md-4">
          <label htmlFor="group" className="form-label">
            Group
          </label>
          <input
            type="text"
            className="form-control bg-light"
            id="group"
            aria-describedby="group-help"
            defaultValue={meeting.group}
            required
          />
          <div id="group-help" className="form-text">
            Optional. This is helpful when a single group is responsible for
            several meetings.
          </div>
        </div>
        <div className="mb-3 col-md-4">
          <label htmlFor="website" className="form-label">
            Group Website
          </label>
          <input
            type="url"
            className="form-control bg-light"
            id="website"
            aria-describedby="website-help"
            defaultValue={meeting.website}
            placeholder="https://groupname.org"
          />
          <div id="website-help" className="form-text">
            Optional website address for the group.
          </div>
        </div>
        <div className="mb-3 col-md-4">
          <label htmlFor="email" className="form-label">
            Group Email
          </label>
          <input
            type="email"
            className="form-control bg-light"
            id="email"
            aria-describedby="email-help"
            defaultValue={meeting.email}
            placeholder="groupname@gmail.com"
          />
          <div id="email-help" className="form-text">
            Optional public contact information, should not break personal
            anonymity.
          </div>
        </div>
      </div>
      <div className="row">
        <div className="mb-3 col-md-4">
          <label htmlFor="venmo" className="form-label">
            Venmo
          </label>
          <input
            type="text"
            className="form-control bg-light"
            id="venmo"
            aria-describedby="venmo-help"
            defaultValue={meeting.venmo}
            placeholder="@GroupName"
          />
          <div id="venmo-help" className="form-text">
            Optional Venmo handle for 7th Tradition contributions
          </div>
        </div>
        <div className="mb-3 col-md-4">
          <label htmlFor="paypal" className="form-label">
            PayPal
          </label>
          <input
            type="url"
            className="form-control bg-light"
            id="paypal"
            aria-describedby="paypal-help"
            defaultValue={meeting.paypal}
            placeholder="https://paypal.me/groupname"
          />
          <div id="paypal-help" className="form-text">
            Optional PayPal.me URL for 7th Tradition contributions.
          </div>
        </div>
        <div className="mb-3 col-md-4">
          <label htmlFor="email" className="form-label">
            Cash App (Square)
          </label>
          <input
            type="text"
            className="form-control bg-light"
            id="square"
            aria-describedby="square-help"
            defaultValue={meeting.square}
            placeholder="$GroupName"
          />
          <div id="square-help" className="form-text">
            Optional cashtag for 7th Tradition contributions.
          </div>
        </div>
      </div>
      {meeting.group_notes && (
        <div className="mb-3">
          <label htmlFor="group_notes" className="form-label">
            Group Notes
          </label>
          <textarea
            className="form-control bg-light"
            id="group_notes"
            aria-describedby="group_notes-help"
            defaultValue={meeting.group_notes}
          />
          <div id="group_notes-help" className="form-text"></div>
        </div>
      )}
      <button type="submit" className="btn btn-primary">
        Send Update Request
      </button>
    </form>
  );
}
