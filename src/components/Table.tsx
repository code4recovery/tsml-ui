import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import { Meeting, State } from '../types';
import {
  formatClasses as cx,
  formatDirectionsUrl,
  formatString as i18n,
  useSettings,
} from '../helpers';
import { icons } from './Icon';

import Button from './Button';
import Link from './Link';

type TableProps = {
  state: State;
  setState: (state: State) => void;
  filteredSlugs: string[];
  inProgress: string[];
  listButtons: boolean;
};

export default function Table({
  state,
  setState,
  filteredSlugs = [],
  inProgress = [],
  listButtons = false,
}: TableProps) {
  const { settings, strings } = useSettings();
  const meetingsPerPage = 10;
  const supported_columns = [
    'address',
    'distance',
    'location',
    'location_group',
    'name',
    'region',
    'time',
  ];
  const [limit, setLimit] = useState(meetingsPerPage);
  const [showInProgress, setShowInProgress] = useState(false);
  const { distance, location, region } = state.capabilities;

  //manage classes
  useEffect(() => {
    document.body.classList.add('tsml-ui-table');
    return () => {
      document.body.classList.remove('tsml-ui-table');
    };
  }, []);

  //show columns based on capabilities
  const columns = settings.columns
    .filter(col => supported_columns.includes(col))
    .filter(col => region || col !== 'region')
    .filter(col => distance || col !== 'distance')
    .filter(col => location || !['location', 'location_group'].includes(col));

  const getValue = (meeting: Meeting, key: string) => {
    if (key === 'address') {
      const buttons: {
        className: string;
        href?: string;
        icon: keyof typeof icons;
        text?: string;
      }[] = [];
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
        <div className="align-items-baseline d-flex flex-wrap justify-content-sm-end">
          <span className="fs-5 me-1">
            {meeting.distance.toLocaleString(navigator.language)}
          </span>
          <small className="text-muted">
            {strings[settings.distance_unit]}
          </small>
        </div>
      );
    } else if (key === 'location') {
      return meeting.location;
    } else if (key === 'location_group') {
      return meeting.isInPerson ? meeting.location : meeting.group;
    } else if (key === 'name' && meeting.slug) {
      return <Link meeting={meeting} state={state} setState={setState} />;
    } else if (key === 'region' && meeting.regions) {
      return meeting.regions[meeting.regions.length - 1];
    } else if (key === 'time') {
      return meeting.start ? (
        <time className="d-flex flex-column flex-lg-row gap-lg-1">
          <span className="text-nowrap text-lowercase">
            {meeting.start.toFormat('t')}
          </span>
          <span className="text-nowrap">{meeting.start.toFormat('cccc')}</span>
        </time>
      ) : (
        strings.appointment
      );
    }
    return null;
  };

  const Row = ({ slug }: { slug: keyof typeof state.meetings }) => {
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

  return !filteredSlugs.length ? null : (
    <div className="row">
      <table
        className={cx('table table-striped flex-grow-1 my-0', {
          'clickable-rows': !listButtons,
        })}
      >
        <thead>
          <tr className="d-none d-md-table-row">
            {columns.map((column, index) => (
              <th key={index} className={cx('pt-0', column)}>
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
                <td
                  className="p-2 text-center rounded-0"
                  colSpan={columns.length}
                >
                  <button
                    onClick={() => setShowInProgress(true)}
                    className="alert-link bg-transparent border-0 d-block fw-normal mx-auto p-2 text-center text-decoration-underline w-100"
                  >
                    {inProgress.length === 1
                      ? strings.in_progress_single
                      : i18n(strings.in_progress_multiple, {
                          count: inProgress.length,
                        })}
                  </button>
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
  );
}
