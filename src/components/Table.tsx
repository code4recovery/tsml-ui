import { useState } from 'react';

import InfiniteScroll from 'react-infinite-scroller';

import { useNavigate } from 'react-router-dom';

import { formatUrl, formatString as i18n } from '../helpers';
import { useData, useError, useFilter, useInput, useLocation, useSettings } from '../hooks';
import {
  tableChicletCss,
  tableChicletsCss,
  tableInProgressCss,
  tableWrapperCss,
} from '../styles';
import { Meeting } from '../types';

import Icon, { icons } from './Icon';
import Link from './Link';

export default function Table() {
  const { capabilities, meetings } = useData();
  const { error } = useError();
  const { filteredSlugs, inProgress } = useFilter();
  const { settings, strings } = useSettings();
  const { input } = useInput();
  const { latitude, longitude } = useLocation();
  const navigate = useNavigate();
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

  if (error) {
    return null;
  }

  const { distance, location, region } = capabilities;

  //show columns based on capabilities
  const columns = settings.columns
    .filter(col => supported_columns.includes(col))
    .filter(col => region || col !== 'region')
    .filter(col => (distance && latitude && longitude) || col !== 'distance')
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
      return <Link meeting={meeting} />;
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

  const Row = ({ slug }: { slug: keyof typeof meetings }) => {
    const meeting = meetings[slug];
    return (
      <tr
        onClick={() =>
          navigate(formatUrl({ ...input, meeting: meeting.slug }, settings))
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

  return !filteredSlugs?.length ? null : (
    <div css={tableWrapperCss}>
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>
                {strings[column as keyof Translation] as string}
              </th>
            ))}
          </tr>
        </thead>
        {!!inProgress?.length && (
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
          {filteredSlugs.slice(0, limit).map((slug, index) => (
            <Row slug={slug} key={index} />
          ))}
        </InfiniteScroll>
      </table>
    </div>
  );
}
