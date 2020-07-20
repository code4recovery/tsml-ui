import React, { Component } from 'react';
import cx from 'classnames/bind';

import { settings, strings } from '../helpers/settings';
import Link from './link';
import Button from './button';

export default class Table extends Component {
  canShowColumn(column) {
    return column !== 'distance' || this.props.state.input.mode !== 'search';
  }

  getValue(meeting, key) {
    if (key == 'address') {
      if (meeting.conference_url || meeting.conference_phone) {
        return meeting.conference_provider && meeting.conference_phone ? (
          <div className="btn-group w-100">
            <Button
              text={meeting.conference_provider}
              href={meeting.conference_url}
              icon="camera-video"
              className="btn-sm"
              block={false}
            />
            <Button
              text={strings.phone}
              href={'tel:' + meeting.conference_phone}
              icon="telephone"
              className="btn-sm"
              block={false}
            />
          </div>
        ) : meeting.conference_provider ? (
          <Button
            text={meeting.conference_provider}
            href={meeting.conference_url}
            icon="camera-video"
            className="btn-sm"
          />
        ) : (
          <Button
            text="Phone"
            href={'tel:' + meeting.conference_phone}
            icon="telephone"
            className="btn-sm"
          />
        );
      } else {
        const address = meeting.formatted_address.split(', ');
        return address.length && address[0] !== meeting.region
          ? address[0]
          : '';
      }
    } else if (key == 'name' && meeting.slug) {
      return (
        <Link
          meeting={meeting}
          state={this.props.state}
          setAppState={this.props.setAppState}
        />
      );
    } else if (key == 'time') {
      return (
        <time className="text-nowrap">
          <div className="d-lg-inline mr-1">
            {strings[settings.days[meeting.day]]}
          </div>
          {meeting.formatted_time}
        </time>
      );
    }
    return meeting[key];
  }

  render() {
    return (
      <div className="row">
        <table className="table table-striped flex-grow-1 my-0">
          <thead>
            <tr className="d-none d-md-table-row">
              {settings.defaults.columns.map(
                column =>
                  this.canShowColumn(column) && (
                    <th key={column} className={column}>
                      {strings[column]}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {this.props.filteredSlugs.map(slug => {
              const meeting = this.props.state.meetings.filter(
                meeting => meeting.slug == slug
              )[0];
              return (
                <tr className="d-block d-md-table-row" key={meeting.slug}>
                  {settings.defaults.columns.map(
                    column =>
                      this.canShowColumn(column) && (
                        <td
                          key={[meeting.slug, column].join('-')}
                          className={cx('d-block d-md-table-cell', column)}
                        >
                          {this.getValue(meeting, column)}
                        </td>
                      )
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
