import { settings } from '../settings';
import { getQueryString } from '../query-string';
import { formatFeedbackEmail } from '.';
import { Meeting } from '../../types';

jest.mock('./format-url', () => ({
  formatUrl: jest.fn().mockReturnValue('https://foo.com'),
}));

jest.mock('../query-string');

const mockedGetQueryString = jest.mocked(getQueryString);

//can't use mock factories with outside scoped variables
mockedGetQueryString.mockReturnValue(settings.defaults);

//TODO: Only requiring the parts needed for this test, should
//probably integrate fixtures.
const mockMeeting = {
  name: 'Foo',
  edit_url: 'row 1',
} as unknown as Meeting;

const mockEmails = ['foo@bar.com', 'baz@qux.com'];

describe('formatFeedbackEmail', () => {
  it('works with one or more emails', () => {
    expect(formatFeedbackEmail([mockEmails[0]], mockMeeting)).toStrictEqual(
      'mailto:foo@bar.com?subject=Meeting Feedback%3A Foo&body=%0A%0A%0A-----%0APublic URL%3A https%3A%2F%2Ffoo.com%0AEdit URL%3A row 1'
    );
    expect(formatFeedbackEmail(mockEmails, mockMeeting)).toStrictEqual(
      'mailto:foo@bar.com,baz@qux.com?subject=Meeting Feedback%3A Foo&body=%0A%0A%0A-----%0APublic URL%3A https%3A%2F%2Ffoo.com%0AEdit URL%3A row 1'
    );
  });
});
