import { useData } from '../hooks';
import { formatArray } from './format-array';
import { formatString as i18n } from './format-string';
import { formatUrl } from './format-url';

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
  const { meeting } = useData();
  const meetingUrl = formatUrl({ meeting: meeting?.slug }, settings);

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
    .replaceAll('+', ' ')}`;
}
