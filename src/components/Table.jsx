import React, { useState } from 'react';
import cx from 'classnames/bind';
import InfiniteScroll from 'react-infinite-scroller';

import { settings, strings } from '../helpers';
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
    if (key === 'address') {
      if (settings.show.listButtons) {
        const buttons = [];
        if (meeting.conference_provider) {
          buttons.push(
            <Button
              block={false}
              href={meeting.conference_url}
              icon="camera"
              key="url"
              small={true}
              text={meeting.conference_provider}
            />
          );
        }
        if (meeting.conference_phone) {
          buttons.push(
            <Button
              block={false}
              href={`tel:${meeting.conference_phone}`}
              icon="telephone"
              key="phone"
              small={true}
              text={strings.phone}
            />
          );
        }
        return buttons.length ? (
          <div className="btn-group my-1 w-100">{buttons}</div>
        ) : (
          meeting.address
        );
      } else {
        const labels = [];
        if (meeting.isInPerson) {
          labels.push({
            label: meeting.address,
            icon: 'pin-filled',
            className: 'label-in-person',
          });
        }
        if (meeting.conference_provider) {
          labels.push({
            label: meeting.conference_provider,
            icon: 'camera-filled',
            className: 'label-online',
          });
        }
        if (meeting.conference_phone) {
          labels.push({
            label: strings.phone,
            icon: 'telephone-filled',
            className: 'label-online',
          });
        }
        return (
          <div className="overflow-auto">
            {labels.map((label, index) => (
              <small
                className={cx(
                  label.className,
                  'align-items-center d-flex float-start me-1 my-1 px-2 py-1 rounded'
                )}
                key={index}
              >
                {label.icon && (
                  <Icon icon={label.icon} className="me-1" size={18} />
                )}
                {label.label}
              </small>
            ))}
          </div>
        );
      }
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
              {settings.columns.map(
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
                  {settings.columns.map(
                    (column, index) =>
                      canShowColumn(column) && (
                        <td
                          key={index}
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
