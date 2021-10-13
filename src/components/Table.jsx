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

export default function Table({ state, setState, filteredSlugs, inProgress }) {
  const meetingsPerPage = 10;
  const [limit, setLimit] = useState(meetingsPerPage);
  const [showInProgress, setShowInProgress] = useState(false);

  //show columns based on capabilities
  const columns = ['time', 'distance', 'name', 'location', 'address', 'region']
    .filter(column => column !== 'region' || state.capabilities.region)
    .filter(column => column !== 'location' || state.capabilities.location)
    .filter(column => column !== 'distance' || state.capabilities.distance);

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
    return meeting[key];
  };

  const Row = ({ slug }) => {
    const meeting = state.meetings[slug];
    return (
      <tr
        className="d-block d-md-table-row"
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
            'clickable-rows': !settings.show.listButtons,
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
            <tbody className="tsml-in-progress">
              {showInProgress ? (
                inProgress.map((slug, index) => <Row slug={slug} key={index} />)
              ) : (
                <tr>
                  <td colspan={columns.length}>
                    <a
                      onClick={() => setShowInProgress(true)}
                      className="d-block text-center py-3 py-md-1"
                    >
                      {inProgress.length === 1
                        ? strings.in_progress_single
                        : strings.in_progress_multiple.replace(
                            '%count%',
                            inProgress.length
                          )}
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          )}
          <InfiniteScroll
            element="tbody"
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
