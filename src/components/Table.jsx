import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import {
  formatClasses as cx,
  formatDirectionsUrl,
  settings,
  strings,
} from '../helpers';
import Button from './Button';
import Link from './Link';

export default function Table({
  state,
  setState,
  filteredSlugs = [],
  inProgress = [],
  listButtons = false,
}) {
  const meetingsPerPage = 10;
  const [limit, setLimit] = useState(meetingsPerPage);
  const [showInProgress, setShowInProgress] = useState(false);

  //show columns based on capabilities
  const columns = settings.columns
    .filter(column => column !== 'region' || state.capabilities.region)
    .filter(
      column =>
        (column !== 'location' && column !== 'location_group') ||
        state.capabilities.location
    )
    .filter(column => column !== 'distance' || state.capabilities.distance);

  const getValue = (meeting, key) => {
    if (key === 'address') {
      const buttons = [];
      if (meeting.isInPerson) {
        buttons.push({
          className: 'in-person',
          href: listButtons ? formatDirectionsUrl(meeting) : undefined,
          icon: 'geo',
          text: meeting.address,
        });
      }
      if (meeting.conference_provider) {
        buttons.push({
          className: 'online',
          href: listButtons ? meeting.conference_url : undefined,
          icon: 'camera',
          text: meeting.conference_provider,
        });
      }
      if (meeting.conference_phone) {
        buttons.push({
          className: 'online',
          href: listButtons ? `tel:${meeting.conference_phone}` : undefined,
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
    } else if (key === 'distance' && meeting.distance) {
      return (
        <>
          {meeting.distance}
          <small className="ms-1 text-muted">{settings.distance_unit}</small>
        </>
      );
    } else if (key === 'location_group') {
      return meeting.isInPerson ? meeting.location : meeting.group;
    } else if (key === 'name' && meeting.slug) {
      return <Link meeting={meeting} state={state} setState={setState} />;
    } else if (key === 'region' && meeting.regions) {
      return meeting.regions[meeting.regions.length - 1];
    } else if (key === 'time') {
      return meeting.start ? (
        <time className="d-flex flex-column flex-lg-row gap-lg-1">
          <span className="text-nowrap">{meeting.start.format('h:mm a')}</span>
          <span className="text-nowrap">
            {strings[settings.weekdays[meeting.start?.format('d')]]}
          </span>
        </time>
      ) : (
        strings.appointment
      );
    }
    return null;
  };

  const Row = ({ slug }) => {
    const meeting = state.meetings[slug];
    return (
      <tr
        className={cx(
          { 'cursor-pointer': !listButtons },
          'd-block d-md-table-row'
        )}
        onClick={() => {
          if (listButtons) return;
          setState({
            ...state,
            input: {
              ...state.input,
              meeting: meeting.slug,
            },
          });
        }}
      >
        {columns.map((column, index) => (
          <td className={cx('d-block d-md-table-cell', column)} key={index}>
            {getValue(meeting, column)}
          </td>
        ))}
      </tr>
    );
  };

  return (
    !!filteredSlugs.length && (
      <div className="row">
        <table
          className={cx('table table-striped flex-grow-1 my-0', {
            'clickable-rows': !listButtons,
          })}
        >
          <thead>
            <tr className="d-none d-md-table-row">
              {columns.map((column, index) => (
                <th key={index} className={column}>
                  {strings[column]}
                </th>
              ))}
            </tr>
          </thead>
          {!!inProgress.length && (
            <tbody className="border-0">
              {showInProgress ? (
                inProgress.map((slug, index) => <Row slug={slug} key={index} />)
              ) : (
                <tr>
                  <td className="p-0" colSpan={columns.length}>
                    <div className="alert alert-warning m-0 opacity-50 p-2 rounded-0">
                      <button
                        onClick={() => setShowInProgress(true)}
                        className="alert-link bg-transparent border-0 d-block fw-normal mx-auto py-2 py-md-1 text-center text-decoration-underline w-100"
                      >
                        {inProgress.length === 1
                          ? strings.in_progress_single
                          : strings.in_progress_multiple.replace(
                              '%count%',
                              inProgress.length
                            )}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          )}
          <InfiniteScroll
            element="tbody"
            className="border-0"
            loadMore={() => {
              setLimit(limit + meetingsPerPage);
            }}
            hasMore={filteredSlugs.length > limit}
          >
            {filteredSlugs.slice(0, limit).map((slug, index) => (
              <Row slug={slug} key={index} />
            ))}
          </InfiniteScroll>
        </table>
      </div>
    )
  );
}
