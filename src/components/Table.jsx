import React, { useState } from 'react';
import cx from 'classnames/bind';
import InfiniteScroll from 'react-infinite-scroller';

import { formatAddress, settings, strings } from '../helpers';
import Button from './Button';
import Icon from './Icon';
import Link from './Link';

export default function Table({ state, setState, filteredSlugs }) {
  const meetingsPerPage = 10;
  const [limit, setLimit] = useState(meetingsPerPage);

  const canShowColumn = column => {
    return column !== 'distance' || state.capabilities.distance;
  };

  const getValue = (meeting, key) => {
    if (key == 'address') {
      if (settings.show.listButtons) {
        const buttons = [];
        if (meeting.conference_provider) {
          buttons.push(
            <Button
              block={false}
              className="btn-sm"
              href={meeting.conference_url}
              icon="camera"
              key="url"
              text={meeting.conference_provider}
            />
          );
        }
        if (meeting.conference_phone) {
          buttons.push(
            <Button
              block={false}
              className="btn-sm"
              href={`tel:${meeting.conference_phone}`}
              icon="telephone"
              key="phone"
              text={strings.phone}
            />
          );
        }
        return buttons.length ? (
          <div className="btn-group my-1 w-100">{buttons}</div>
        ) : (
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
      } else {
        const labels = [];
        const address = formatAddress(meeting.formatted_address);
        if (address && !meeting.types.includes(strings.types.TC)) {
          labels.push({
            label: address,
          });
        }
        if (meeting.conference_provider) {
          labels.push({
            label: meeting.conference_provider,
            icon: 'camera',
          });
        }
        if (meeting.conference_phone) {
          labels.push({
            label: strings.phone,
            icon: 'telephone',
          });
        }
        return (
          <div className="overflow-auto">
            {labels.map((label, index) => (
              <small
                className="d-flex float-left mr-1 align-items-center bg-secondary text-light rounded px-2 p-1 my-1"
                key={index}
              >
                {label.icon && (
                  <Icon icon={label.icon} className="mr-1" size={18} />
                )}
                {label.label}
              </small>
            ))}
          </div>
        );
      }
    } else if (key == 'name' && meeting.slug) {
      return <Link meeting={meeting} state={state} setState={setState} />;
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
      return meeting.distance ? (
        <>
          {meeting.distance}
          <small className="text-muted ml-1">{settings.distance_unit}</small>
        </>
      ) : null;
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
                <tr
                  className="d-block d-md-table-row"
                  key={meeting.slug}
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
