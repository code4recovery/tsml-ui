import { Meeting } from '../../types/Meeting';
import { getQueryString } from '../query-string';
import { strings } from '../settings';
import { formatArray } from './format-array';
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
    strings.email_public_url.replace('%url%', meetingUrl),
  ];
  if (meeting.edit_url) {
    lines.push(strings.email_edit_url.replace('%url%', meeting.edit_url));
  }

  //build mailto link
  return `mailto:${formatArray(feedback_emails).join()}?${new URLSearchParams({
    subject: strings.email_subject.replace('%name%', meeting.name),
    body: lines.join('\n'),
  })
    .toString()
    .replaceAll('+', ' ')}`;
}
