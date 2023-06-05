import { Meeting } from '../types';
import { getQueryString } from './query-string';
import { strings } from './settings';
import { formatArray } from './format-array';
import { formatString as i18n } from './format-string';
import { formatUrl } from './format-url';

//send back a mailto link to a feedback email
export function formatFeedbackEmail(
  feedback_emails: TSMLReactConfig['feedback_emails'],
  meeting: Meeting
) {
  //remove extra query params from meeting URL
  const input = getQueryString();
  const meetingUrl = formatUrl({ meeting: input.meeting });

  //build message
  const lines = [
    ``,
    '',
    '',
    '-----',
    i18n(strings.email_public_url, { url: meetingUrl }),
  ];
  if (meeting.edit_url) {
    lines.push(i18n(strings.email_edit_url, { url: meeting.edit_url }));
  }

  //build mailto link
  return `mailto:${formatArray(feedback_emails).join()}?${new URLSearchParams({
    subject: i18n(strings.email_subject, { name: meeting.name }),
    body: lines.join('\n'),
  })
    .toString()
    .replaceAll('+', ' ')}`;
}
