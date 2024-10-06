import { formatArray } from './format-array';
import { formatString as i18n } from './format-string';
import { formatUrl } from './format-url';
import { getQueryString } from './query-string';

// send back a mailto link to a feedback email
export function formatFeedbackEmail({
  feedback_emails,
  edit_url,
  name,
  settings,
  strings,
}: {
  feedback_emails: string[];
  edit_url?: string;
  name?: string;
  settings: TSMLReactConfig;
  strings: Translation;
}) {
  // remove extra query params from meeting URL
  const input = getQueryString(settings);
  const meetingUrl = formatUrl({ meeting: input.meeting }, settings);

  // build message
  const lines = [
    ``,
    '',
    '',
    '-----',
    i18n(strings.email_public_url, { url: meetingUrl }),
  ];
  if (edit_url) {
    lines.push(i18n(strings.email_edit_url, { url: edit_url }));
  }

  // build mailto link
  return `mailto:${formatArray(feedback_emails).join()}?${new URLSearchParams({
    subject: i18n(strings.email_subject, { name }),
    body: lines.join('\n'),
  })
    .toString()
    .split('+')
    .join(' ')}`;
}
