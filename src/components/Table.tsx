import { Dispatch, SetStateAction, useState, useMemo } from 'react';

import InfiniteScroll from 'react-infinite-scroller';
import { useSearchParams } from 'react-router-dom';

import { formatString as i18n, useSettings } from '../helpers';
import {
  tableChicletCss,
  tableChicletsCss,
  tableInProgressCss,
  tableWrapperCss,
  tableChevronCss,
} from '../styles';
import { Meeting, State } from '../types';

import Icon, { icons } from './Icon';
import Link from './Link';

export default function Table({
                                filteredSlugs = [],
                                inProgress = [],
                                setState,
                                state,
                              }: {
  filteredSlugs: string[];
  inProgress: string[];
  setState: Dispatch<SetStateAction<State>>;
  state: State;
}) {
  const { settings, strings } = useSettings();
  const [_, setSearchParams] = useSearchParams();
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
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const sortableColumns = ['time', 'name', 'location_group', 'address', 'region', 'distance'];
  const sortedSlugs = useMemo(() => {
    if (!sortColumn || !sortableColumns.includes(sortColumn)) return filteredSlugs;
    const compare = (aSlug: string, bSlug: string) => {
      const a = state.meetings[aSlug];
      const b = state.meetings[bSlug];
      let aValue: any;
      let bValue: any;
      switch (sortColumn) {
        case 'time':
          if (!a.start && !b.start) return 0;
          if (!a.start) return 1;
          if (!b.start) return -1;
          // Map ISO to 0=Sun,1=Mon..
          const aDay = a.start.weekday === 7 ? 0 : a.start.weekday;
          const bDay = b.start.weekday === 7 ? 0 : b.start.weekday;
          if (aDay !== bDay) {
            return sortDirection === 'asc' ? aDay - bDay : bDay - aDay;
          }
          const aTime = a.start.hour * 60 + a.start.minute;
          const bTime = b.start.hour * 60 + b.start.minute;
          return aTime - bTime;
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'location_group':
          aValue = a.isInPerson ? a.location : a.group || '';
          bValue = b.isInPerson ? b.location : b.group || '';
          break;
        case 'address':
          aValue = a.formatted_address || '';
          bValue = b.formatted_address || '';
          break;
        case 'region':
          aValue = Array.isArray(a.regions) && a.regions.length ? a.regions[a.regions.length - 1] : '';
          bValue = Array.isArray(b.regions) && b.regions.length ? b.regions[b.regions.length - 1] : '';
          break;
        case 'distance':
          aValue = typeof a.distance === 'number' ? a.distance : Number.POSITIVE_INFINITY;
          bValue = typeof b.distance === 'number' ? b.distance : Number.POSITIVE_INFINITY;
          break;
        default:
          aValue = '';
          bValue = '';
      }
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    };
    return [...filteredSlugs].sort(compare);
  }, [filteredSlugs, sortColumn, sortDirection, state.meetings]);

  //show columns based on capabilities
  const columns = settings.columns
    .filter(col => supported_columns.includes(col))
    .filter(col => region || col !== 'region')
    .filter(col => distance || col !== 'distance')
    .filter(col => location || !['location', 'location_group'].includes(col));

  const getValue = (meeting: Meeting, key: string) => {
    if (key === 'address') {
      const attendance: {
        icon: keyof typeof icons;
        text?: string;
        noTranslate?: boolean;
        type: 'in-person' | 'online' | 'inactive';
      }[] = [];
      if (meeting.isInPerson) {
        attendance.push({
          icon: 'geo',
          text: meeting.address,
          type: 'in-person',
          noTranslate: true,
        });
      }
      if (meeting.conference_provider) {
        attendance.push({
          icon: 'camera',
          text: meeting.conference_provider,
          type: 'online',
        });
      }
      if (meeting.conference_phone) {
        attendance.push({
          icon: 'phone',
          text: strings.phone,
          type: 'online',
        });
      }
      if (!meeting.isInPerson && !meeting.isOnline) {
        attendance.push({
          icon: 'close',
          text: strings.types.inactive,
          type: 'inactive',
        });
      }
      return (
        <div css={tableChicletsCss}>
          {attendance.map(({ icon, text, type, noTranslate }, index) => (
            <span css={tableChicletCss(type)} key={index}>
              <Icon icon={icon} size={18} />
              {text && (
                <span className={noTranslate ? 'notranslate' : undefined}>
                  {text}
                </span>
              )}
            </span>
          ))}
        </div>
      );
    } else if (key === 'distance' && meeting.distance) {
      return (
        <div>
          <span>{meeting.distance.toLocaleString(navigator.language)}</span>
          <small>{strings[settings.distance_unit]}</small>
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
        <time>
          <span>{meeting.start.toFormat('t')}</span>
          <span>{meeting.start.toFormat('cccc')}</span>
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
        onClick={() =>
          setSearchParams({
            meeting: meeting.slug,
          })
        }
      >
        {columns.map((column, index) => (
          <td className={`tsml-${column}`} key={index}>
            {getValue(meeting, column)}
          </td>
        ))}
      </tr>
    );
  };

  return !filteredSlugs.length ? null : (
    <div css={tableWrapperCss}>
      <table>
        <thead>
        <tr>
          {columns.map((column, index) => {
            const isSortable = sortableColumns.includes(column);
            const isActive = sortColumn === column;
            return (
              <th
                key={index}
                style={isSortable ? { cursor: 'pointer', userSelect: 'none' } : {}}
                onClick={
                  isSortable
                    ? () => {
                      if (sortColumn === column) {
                        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortColumn(column);
                        setSortDirection('asc');
                      }
                    }
                    : undefined
                }
              >
                {strings[column as keyof Translation] as string}
                {isActive && (
                  <span
                    css={tableChevronCss}
                    className={sortDirection === 'desc' ? 'down' : ''}
                  />
                )}
              </th>
            );
          })}
        </tr>
        </thead>
        {!!inProgress.length && (
          <tbody css={tableInProgressCss}>
          {showInProgress ? (
            inProgress.map((slug, index) => <Row slug={slug} key={index} />)
          ) : (
            <tr>
              <td colSpan={columns.length}>
                <button onClick={() => setShowInProgress(true)}>
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
          hasMore={filteredSlugs.length > limit}
          loadMore={() => setLimit(limit + meetingsPerPage)}
        >
          {sortedSlugs.slice(0, limit).map((slug, index) => (
            <Row slug={slug} key={index} />
          ))}
        </InfiniteScroll>
      </table>
    </div>
  );
}