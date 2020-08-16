import React, { useState } from 'react';
import cx from 'classnames/bind';
import InfiniteScroll from 'react-infinite-scroller';

import { formatAddress, settings, strings } from '../helpers';
import Button from './Button';
import Link from './Link';

export default function Table({ state, setAppState, filteredSlugs }) {
  const meetingsPerPage = 10;
  const [limit, setLimit] = useState(meetingsPerPage);

  const canShowColumn = column => {
    return column !== 'distance' || state.capabilities.distance;
  };

  const getValue = (meeting, key) => {
    if (key == 'address') {
      const buttons = [];
      if (meeting.conference_provider) {
        buttons.push(
          <Button
            key="url"
            text={meeting.conference_provider}
            href={meeting.conference_url}
            icon="camera"
            className="btn-sm"
            block={false}
          />
        );
      }
      if (meeting.conference_phone) {
        buttons.push(
          <Button
            key="phone"
            text={strings.phone}
            href={'tel:' + meeting.conference_phone}
            icon="telephone"
            className="btn-sm"
            block={false}
          />
        );
      }
      if (buttons.length) {
        return <div className="btn-group my-1 w-100">{buttons}</div>;
      } else {
        return (
          <span
            className={cx({
              'text-decoration-line-through text-muted': meeting.types.includes(
                strings.types.TC
              ),
            })}
          >
            {formatAddress(meeting.formatted_address)}
          </span>
        );
      }
    } else if (key == 'name' && meeting.slug) {
      return <Link meeting={meeting} state={state} setAppState={setAppState} />;
    } else if (key == 'region' && meeting.regions) {
      return meeting.regions[meeting.regions.length - 1];
    } else if (key == 'time') {
      return (
        <time className="text-nowrap">
          {meeting.start.format('h:mm a')}
          <div className="d-xl-inline ml-xl-1">
            {strings[settings.weekdays[meeting.start.format('d')]]}
          </div>
        </time>
      );
    } else if (key == 'distance') {
      return (
        <>
          {meeting.distance}
          {meeting.distance && (
            <small className="text-muted ml-1">{settings.distance_unit}</small>
          )}
        </>
      );
    }
    return meeting[key];
  };

  return (
    !!filteredSlugs.length && (
      <div className="row">
        <table className="table table-striped flex-grow-1 my-0">
          <thead>
            <tr className="d-none d-md-table-row">
              {settings.columns.map(
                column =>
                  canShowColumn(column) && (
                    <th key={column} className={column}>
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
            {filteredSlugs.slice(0, limit).map(slug => {
              const meeting = state.meetings[slug];
              return (
                <tr className="d-block d-md-table-row" key={meeting.slug}>
                  {settings.columns.map(
                    column =>
                      canShowColumn(column) && (
                        <td
                          key={[meeting.slug, column].join('-')}
                          className={cx('d-block d-md-table-cell', column)}
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
