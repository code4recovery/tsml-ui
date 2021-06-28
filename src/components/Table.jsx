import React, { useState } from 'react';
import cx from 'classnames/bind';
import InfiniteScroll from 'react-infinite-scroller';

import { formatDirectionsUrl, settings, strings } from '../helpers';
import Button from './Button';
import Link from './Link';

export default function Table({ state, setState, filteredSlugs }) {
  const meetingsPerPage = 10;
  const [limit, setLimit] = useState(meetingsPerPage);

  //region might not be present in the data
  const columns = ['time', 'distance', 'name', 'location', 'address'];
  if (state.capabilities.region) columns.push('region');

  const canShowColumn = column => {
    return column !== 'distance' || state.capabilities.distance;
  };

  const getValue = (meeting, key) => {
    if (key === 'address') {
      const buttons = [];
      if (meeting.isInPerson) {
        buttons.push({
          className: 'in-person',
          href: settings.show.listButtons
            ? formatDirectionsUrl(meeting)
            : undefined,
          icon: 'geo',
          text: meeting.address,
        });
      }
      if (meeting.conference_provider) {
        buttons.push({
          className: 'online',
          href: settings.show.listButtons ? meeting.conference_url : undefined,
          icon: 'camera',
          text: meeting.conference_provider,
        });
      }
      if (meeting.conference_phone) {
        buttons.push({
          className: 'online',
          href: settings.show.listButtons
            ? `tel:${meeting.conference_phone}`
            : undefined,
          icon: 'phone',
          text: strings.phone,
        });
      }
      if (!meeting.isInPerson && !meeting.isOnline) {
        buttons.push({
          className: 'inactive',
          icon: 'close',
          text: strings.types.inactive,
        });
      }
      return (
        <div className="d-flex flex-wrap gap-1">
          {buttons.map((button, index) => (
            <Button key={index} small={true} {...button} />
          ))}
        </div>
      );
    } else if (key === 'distance') {
      return meeting.distance ? (
        <>
          {meeting.distance}
          <small className="ms-1 text-muted">{settings.distance_unit}</small>
        </>
      ) : null;
    } else if (key === 'location') {
      return meeting.isInPerson ? meeting.location : meeting.group;
    } else if (key === 'name' && meeting.slug) {
      return <Link meeting={meeting} state={state} setState={setState} />;
    } else if (key === 'region' && meeting.regions) {
      return meeting.regions[meeting.regions.length - 1];
    } else if (key === 'time') {
      return meeting.start ? (
        <time className="text-nowrap">
          {meeting.start.format('h:mm a')}
          <div className="d-xl-inline ms-xl-1">
            {strings[settings.weekdays[meeting.start?.format('d')]]}
          </div>
        </time>
      ) : (
        strings.appointment
      );
    }
    return meeting[key];
  };

  return (
    !!filteredSlugs.length && (
      <div className="row">
        <table
          className={cx('table table-striped flex-grow-1 my-0', {
            'clickable-rows': !settings.show.listButtons,
          })}
        >
          <thead>
            <tr className="d-none d-md-table-row">
              {columns.map(
                (column, index) =>
                  canShowColumn(column) && (
                    <th key={index} className={column}>
                      {strings[column]}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <InfiniteScroll
            element="tbody"
            loadMore={() => {
              setLimit(limit + meetingsPerPage);
            }}
            hasMore={filteredSlugs.length > limit}
          >
            {filteredSlugs.slice(0, limit).map((slug, index) => {
              const meeting = state.meetings[slug];
              return (
                <tr
                  className="d-block d-md-table-row"
                  key={index}
                  onClick={() => {
                    if (settings.show.listButtons) return;
                    setState({
                      ...state,
                      input: {
                        ...state.input,
                        meeting: meeting.slug,
                      },
                    });
                  }}
                >
                  {columns.map(
                    (column, index) =>
                      canShowColumn(column) && (
                        <td
                          className={cx('d-block d-md-table-cell', column)}
                          key={index}
                        >
                          {getValue(meeting, column)}
                        </td>
                      )
                  )}
                </tr>
              );
            })}
          </InfiniteScroll>
        </table>
      </div>
    )
  );
}
