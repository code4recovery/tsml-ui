import { describe, expect, it, vi } from 'vitest';

import { formatFeedbackEmail } from '../../src/helpers/format-feedback-email';
import { defaults } from '../../src/hooks';
import { Meeting } from '../../src/types';

vi.mock('../../src/helpers/format-url', () => ({
  formatUrl: vi.fn().mockReturnValue('https://foo.com'),
}));

const mockedGetQueryString = vi.fn();

//can't use mock factories with outside scoped variables
mockedGetQueryString.mockReturnValue(defaults.defaults);

//TODO: Only requiring the parts needed for this test, should
//probably integrate fixtures.
const mockMeeting = {
  name: 'Foo',
  edit_url: 'row 1',
} as unknown as Meeting;

const mockEmails = ['foo@bar.com', 'baz@qux.com'];

describe('formatFeedbackEmail', () => {
  it('works with one or more emails', () => {
    expect(
      formatFeedbackEmail({
        feedback_emails: [mockEmails[0]],
        meeting: mockMeeting,
        settings: defaults,
        strings: defaults.strings[defaults.language],
      })
    ).toStrictEqual(
      'mailto:foo@bar.com?subject=Meeting Feedback%3A Foo&body=%0A%0A%0A-----%0APublic URL%3A https%3A%2F%2Ffoo.com%0AEdit URL%3A row 1'
    );
    expect(
      formatFeedbackEmail({
        feedback_emails: mockEmails,
        meeting: mockMeeting,
        settings: defaults,
        strings: defaults.strings[defaults.language],
      })
    ).toStrictEqual(
      'mailto:foo@bar.com,baz@qux.com?subject=Meeting Feedback%3A Foo&body=%0A%0A%0A-----%0APublic URL%3A https%3A%2F%2Ffoo.com%0AEdit URL%3A row 1'
    );
  });
});
