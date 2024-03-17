import { useEffect, useState } from 'react';

import { DateTime, Info } from 'luxon';
import { Helmet } from 'react-helmet';
import {
  LoaderFunctionArgs,
  Link as RouterLink,
  useLoaderData,
  useSearchParams,
} from 'react-router-dom';

import {
  formatDirectionsUrl,
  formatFeedbackEmail,
  formatIcs,
  formatString as i18n,
  useData,
  useSettings,
} from '../helpers';
import {
  buttonHelpCss,
  meetingBackCss,
  meetingColumnsCss,
  meetingCss,
  meetingOnlineCss,
  tableChicletCss,
} from '../styles';

import Button from './Button';
import Icon, { icons } from './Icon';
import Link from './Link';
import Map from './Map';

import type { Meeting as MeetingType } from '../types';

export const loader = ({ params }: LoaderFunctionArgs) => params;

export default function Meeting() {
  const { capabilities, meetings } = useData();
  const { settings, strings } = useSettings();
  const { feedback_emails } = settings;
  const { meetingSlug } = useLoaderData() as { meetingSlug: string };
  const [searchParams] = useSearchParams();

  // open types
  const [define, setDefine] = useState<string | undefined>();

  if (!(meetingSlug in meetings)) {
    throw new Error('Meeting not found');
  }
  const meeting = meetings[meetingSlug as keyof typeof meetings];

  const sharePayload = {
    title: meeting.name,
    url: meeting.url ?? location.href,
  };

  // format time string (duration? or appointment?)
  const formatTime = (start?: DateTime, end?: DateTime) => {
    if (!start) {
      return strings.appointment;
    }

    if (end) {
      if (start.weekday === end.weekday) {
        return `${start.toFormat('cccc t')} – ${end.toFormat('t ZZZZ')}`;
      }

      return `${start.toFormat('cccc t')} – ${end.toFormat('cccc t ZZZZ')}`;
    }

    return start.toFormat('cccc t ZZZZ');
  };

  // log edit_url
  useEffect(() => {
    if (meeting.edit_url) {
      console.log(`TSML UI edit ${meeting.name}: ${meeting.edit_url}`);
      wordPressEditLink(meeting.edit_url);
    }

    return () => {
      wordPressEditLink();
    };
  }, [meetingSlug]);

  // directions URL link
  const directionsUrl = meeting.isInPerson
    ? formatDirectionsUrl(meeting)
    : undefined;

  // feedback URL link
  if (!meeting.feedback_url && feedback_emails.length) {
    meeting.feedback_url = formatFeedbackEmail({
      feedback_emails,
      meeting,
      searchParams,
      settings,
      strings,
    });
  }

  const contactButtons: {
    href: string;
    icon: keyof typeof icons;
    text: string;
    target?: string;
  }[] = [];

  if (meeting.email) {
    contactButtons.push({
      href: `mailto:${meeting.email}`,
      icon: 'email',
      text: meeting.email,
    });
  }
  if (meeting.website) {
    contactButtons.push({
      href: meeting.website,
      target: '_blank',
      icon: 'link',
      text: new URL(meeting.website).host.replace('www.', ''),
    });
  }
  if (meeting.phone) {
    contactButtons.push({
      href: `tel:${meeting.phone}`,
      icon: 'phone',
      text: meeting.phone,
    });
  }
  if (meeting.venmo) {
    contactButtons.push({
      href: `https://venmo.com/${meeting.venmo.substring(1)}`,
      icon: 'cash',
      text: i18n(strings.contribute_with, { service: 'Venmo' }),
    });
  }
  if (meeting.square) {
    contactButtons.push({
      href: `https://cash.app/${meeting.square}`,
      icon: 'cash',
      text: i18n(strings.contribute_with, { service: 'Cash App' }),
    });
  }
  if (meeting.paypal) {
    contactButtons.push({
      href: `https://www.paypal.com/paypalme/${meeting.paypal}`,
      icon: 'cash',
      text: i18n(strings.contribute_with, { service: 'PayPal' }),
    });
  }
  for (let i = 1; i < 4; i++) {
    if (!meeting[`contact_${i}_name` as keyof typeof Meeting]) continue;
    if (meeting[`contact_${i}_email` as keyof typeof Meeting])
      contactButtons.push({
        href: `mailto:${meeting[`contact_${i}_email` as keyof typeof Meeting]}`,
        icon: 'email',
        text: i18n(strings.contact_email, {
          contact: meeting[`contact_${i}_name` as keyof typeof Meeting],
        }),
      });
    if (meeting[`contact_${i}_phone` as keyof typeof Meeting])
      contactButtons.push({
        href: `tel:${meeting[`contact_${i}_phone` as keyof typeof Meeting]}`,
        icon: 'phone',
        text: i18n(strings.contact_call, {
          contact: meeting[`contact_${i}_name` as keyof typeof Meeting],
        }),
      });
  }

  const locationWeekdays = Info.weekdays()
    .map((weekday, index) => ({
      name: weekday,
      meetings: Object.values(meetings)
        .filter(m => m.start?.weekday === index + 1)
        .filter(
          m =>
            meeting.isInPerson &&
            m.isInPerson &&
            m.formatted_address === meeting.formatted_address
        )
        .sort((a, b) =>
          !a.start ? -1 : !b.start ? 1 : a.start.toMillis() - b.start.toMillis()
        ),
    }))
    .filter(e => e.meetings.length);

  // don't display if only one meeting
  if (
    locationWeekdays.length === 1 &&
    locationWeekdays[0].meetings.length === 1
  ) {
    locationWeekdays.splice(0, 1);
  }

  const groupWeekdays = Info.weekdays()
    .map((weekday, index) => ({
      name: weekday,
      meetings: Object.values(meetings)
        .filter(m => m.start?.weekday === index + 1)
        .filter(
          m =>
            meeting.group &&
            (m.isOnline || m.isInPerson) &&
            m.group === meeting.group
        )
        .sort((a, b) =>
          !a.start ? -1 : !b.start ? 1 : a.start.toMillis() - b.start.toMillis()
        ),
    }))
    .filter(e => e.meetings.length);

  // don't display if only one meeting
  if (groupWeekdays.length === 1 && groupWeekdays[0].meetings.length === 1) {
    groupWeekdays.splice(0, 1);
  }

  return (
    <>
      <Helmet>
        <title>{meeting.name}</title>
        <meta property="og:title" content={meeting.name} />
        <meta name="description" content={meeting.notes} />
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <div css={meetingCss}>
        <h1 id="tsml-title" tabIndex={-1}>
          <Link meeting={meeting} link={false} />
        </h1>
        <div css={meetingBackCss}>
          <Icon icon="back" />
          <RouterLink
            preventScrollReset={true}
            to={`/${searchParams ? `?${searchParams}` : ''}`}
          >
            {strings.back_to_meetings}
          </RouterLink>
        </div>
        <div css={meetingColumnsCss}>
          <div>
            {directionsUrl && (
              <Button
                href={directionsUrl}
                icon="geo"
                text={strings.get_directions}
                type="in-person"
              />
            )}
            <div>
              <div>
                <h2>{strings.meeting_information}</h2>
                <p>{formatTime(meeting.start, meeting.end)}</p>

                {meeting.start &&
                  meeting.start.zoneName !== meeting.timezone && (
                    <p>
                      (
                      {formatTime(
                        meeting.start.setZone(meeting.timezone),
                        meeting.end?.setZone(meeting.timezone)
                      )}
                      )
                    </p>
                  )}
                {capabilities.type && meeting.types && (
                  <ul>
                    {meeting.types
                      .filter(type => type !== 'active')
                      .sort((a, b) =>
                        strings.types[a].localeCompare(strings.types[b])
                      )
                      .map((type, index) => (
                        <li key={index}>
                          {strings.type_descriptions?.[
                            type as keyof typeof strings.type_descriptions
                          ] ? (
                            <button
                              onClick={() =>
                                setDefine(define === type ? undefined : type)
                              }
                            >
                              <div>
                                <span>{strings.types[type]}</span>
                                <Icon icon="info" size={13} />
                              </div>
                              {define === type && (
                                <small>
                                  {
                                    strings.type_descriptions[
                                      type as keyof typeof strings.type_descriptions
                                    ]
                                  }
                                </small>
                              )}
                            </button>
                          ) : (
                            strings.types[type]
                          )}
                        </li>
                      ))}
                  </ul>
                )}
                {meeting.notes && <Paragraphs text={meeting.notes} />}
                {(meeting.isActive ||
                  (!meeting.group && !!contactButtons.length)) && (
                  <>
                    {meeting.conference_provider && (
                      <div css={buttonHelpCss}>
                        <Button
                          href={meeting.conference_url}
                          icon="camera"
                          text={meeting.conference_provider}
                          type="online"
                        />
                        {meeting.conference_url_notes && (
                          <Paragraphs text={meeting.conference_url_notes} />
                        )}
                      </div>
                    )}
                    {meeting.conference_phone && (
                      <div css={buttonHelpCss}>
                        <Button
                          href={`tel:${meeting.conference_phone}`}
                          icon="phone"
                          text={strings.phone}
                          type="online"
                        />
                        {meeting.conference_phone_notes && (
                          <Paragraphs text={meeting.conference_phone_notes} />
                        )}
                      </div>
                    )}
                    {capabilities.sharing &&
                      navigator.canShare(sharePayload) && (
                        <Button
                          icon="share"
                          onClick={() =>
                            navigator.share(sharePayload).catch(() => {})
                          }
                          text={strings.share}
                        />
                      )}
                    {meeting.start && meeting.isActive && (
                      <Button
                        icon="calendar"
                        onClick={() => formatIcs(meeting)}
                        text={strings.add_to_calendar}
                      />
                    )}
                    {!meeting.group &&
                      contactButtons.map((button, index) => (
                        <Button {...button} key={index} />
                      ))}
                  </>
                )}
              </div>
              {!meeting.approximate && (
                <div data-disabled={meeting.isTempClosed}>
                  {meeting.location && <h2>{meeting.location}</h2>}
                  {meeting.formatted_address && (
                    <p className="notranslate">{meeting.formatted_address}</p>
                  )}
                  {!!meeting.regions?.length && (
                    <p>{meeting.regions.join(' > ')}</p>
                  )}
                  {meeting.location_notes && (
                    <Paragraphs text={meeting.location_notes} />
                  )}
                  {formatWeekdays(locationWeekdays, meeting.slug)}
                </div>
              )}
              {meeting.group &&
                (meeting.district ||
                  meeting.group_notes ||
                  !!groupWeekdays.length ||
                  !!contactButtons.length) && (
                  <div>
                    <h2>{meeting.group}</h2>
                    {meeting.district && <p>{meeting.district}</p>}
                    {meeting.group_notes && (
                      <Paragraphs text={meeting.group_notes} />
                    )}
                    {contactButtons.map((button, index) => (
                      <Button {...button} key={index} />
                    ))}

                    {formatWeekdays(groupWeekdays, meeting.slug)}
                  </div>
                )}
              {meeting.updated && (
                <div>{i18n(strings.updated, { updated: meeting.updated })}</div>
              )}
            </div>

            {meeting.feedback_url && (
              <Button
                href={meeting.feedback_url}
                icon="edit"
                text={strings.feedback}
              />
            )}
          </div>
          <div
            css={
              meeting.isOnline && !meeting.isInPerson
                ? meetingOnlineCss
                : undefined
            }
          >
            <Map filteredSlugs={[meetingSlug]} listMeetingsInPopup={false} />
          </div>
        </div>
      </div>
    </>
  );
}

// return paragraphs from possibly-multiline string
function Paragraphs({ text }: { text: string }) {
  return (
    <div>
      {text
        .split('\n')
        .filter(e => e)
        .map((p, index) => (
          <p key={index}>{p}</p>
        ))}
    </div>
  );
}

function formatWeekdays(
  weekday: { name: string; meetings: MeetingType[] }[],
  slug: string
) {
  return weekday.map(({ meetings, name }, index) => (
    <div key={index}>
      <h3>{name}</h3>
      <ol>
        {meetings.map((m, index) => (
          <li key={index}>
            <div>{m.start?.toFormat('t')}</div>
            <div>
              {m.slug === slug ? <Link meeting={m} /> : <Link meeting={m} />}
            </div>
            <div>
              {m.isInPerson && (
                <small css={tableChicletCss('in-person')}>
                  <Icon icon="geo" size={13} />
                </small>
              )}
              {m.isOnline && (
                <small css={tableChicletCss('online')}>
                  {m.conference_provider && <Icon icon="camera" size={13} />}
                  {m.conference_phone && <Icon icon="phone" size={13} />}
                </small>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  ));
}

// add or remove an "edit meeting" link on WordPress
function wordPressEditLink(url?: string) {
  const adminBar = document.getElementById('wp-admin-bar-root-default');
  if (!adminBar) return;
  const editButton = document.getElementById('wp-admin-bar-edit-meeting');
  if (url) {
    // create link
    const link = document.createElement('a');
    link.setAttribute('class', 'ab-item');
    link.setAttribute('href', url);
    link.appendChild(document.createTextNode('Edit Meeting'));

    // create button
    const button = document.createElement('li');
    button.setAttribute('id', 'wp-admin-bar-edit-meeting');
    button.appendChild(link);

    // add button to menu bar
    adminBar.appendChild(button);
  } else if (editButton) {
    editButton.parentNode?.removeChild(editButton);
  }
}
