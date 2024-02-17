import { Meeting } from '../types';

import { formatArray } from './format-array';
import { formatString as i18n } from './format-string';

// send back a mailto link to a feedback email
export function formatFeedbackEmail({
  feedback_emails,
  meeting,
  strings,
}: {
  feedback_emails: TSMLReactConfig['feedback_emails'];
  meeting: Meeting;
  searchParams: URLSearchParams;
  settings: TSMLReactConfig;
  strings: Translation;
}) {
  // build message
  const lines = [
    ``,
    '',
    '',
    '-----',
    i18n(strings.email_public_url, { url: window.location.href.split('?')[0] }),
  ];
  if (meeting.edit_url) {
    lines.push(i18n(strings.email_edit_url, { url: meeting.edit_url }));
  }

  // build mailto link
  return `mailto:${formatArray(feedback_emails).join()}?${new URLSearchParams({
    subject: i18n(strings.email_subject, { name: meeting.name }),
    body: lines.join('\n'),
  })
    .toString()
    .replaceAll('+', ' ')}`;
}
