import React from 'react';
import { strings } from '../helpers';
//import { formatDirectionsUrl, settings, strings } from '../helpers';

export default function Grid({ state, setState, filteredSlugs }) {
  return (
    <div className="row">
      {filteredSlugs.map(slug => {
        const meeting = state.meetings[slug];
        return (
          <div className="col-xs-12 col-md-6 col-lg-4 col-xl-3" key={slug}>
            <div className="border mb-3 rounded shadow-sm p-3 d-grid gap-1">
              <h5 className="pb-1">{meeting.name}</h5>
              <p>
                {meeting.start
                  ? meeting.start.format('dddd h:mm a')
                  : strings.appointment}
              </p>
              {!!meeting.regions.length && <p>{meeting.regions.join(' > ')}</p>}
              {!!meeting.notes && <p>{meeting.notes}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
