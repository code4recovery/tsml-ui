import React, { Component } from 'react';
import cx from 'classnames/bind';

import { settings, strings } from '../helpers/settings';
import Link from './link';

export default class Table extends Component {
  canShowColumn(column) {
    return column !== 'distance' || this.props.state.input.mode !== 'search';
  }

  getValue(meeting, key) {
    if (key == 'address') {
      const address = meeting.formatted_address.split(', ');
      return address.length ? address[0] : '';
    } else if (key == 'name' && meeting.slug) {
      return (
        <Link
          meeting={meeting}
          state={this.props.state}
          setAppState={this.props.setAppState}
        />
      );
    } else if (key == 'location' && meeting.video_conference_url) {
      return (
        <div className="location">
          <a href={meeting.video_conference_url} target="_blank">
            {meeting.video_conference_url}
          </a>
          <br />
          Dial In: {meeting.video_conference_dial_in}
        </div>
      );
    } else if (key == 'time') {
      return (
        <time className="text-nowrap">
          <div
            className={cx('mr-1', {
              'd-none': this.props.state.input.day.length == 1,
              'd-sm-inline': this.props.state.input.day.length != 1,
            })}
          >
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
            <tr className="d-none d-sm-table-row">
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
            {this.props.state.meetings.map(meeting => {
              if (this.props.filteredSlugs.indexOf(meeting.slug) == -1) return;
              return (
                <tr className="d-block d-sm-table-row" key={meeting.slug}>
                  {settings.defaults.columns.map(
                    column =>
                      this.canShowColumn(column) && (
                        <td
                          key={[meeting.slug, column].join('-')}
                          className={cx('d-block d-sm-table-cell', column)}
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
