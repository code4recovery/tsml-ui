import { formatUrl } from '../../src/helpers/format-url';
import { defaults } from '../../src/helpers/settings';

describe('formatUrl', () => {
  it('works with no params', () => {
    expect(formatUrl({ input: {}, settings: defaults })).toStrictEqual(
      'https://test.com/'
    );
  });

  it('works with filters', () => {
    expect(
      formatUrl({
        input: {
          distance: ['1'],
          region: ['foo'],
          time: ['night'],
          type: ['online'],
          weekday: ['monday'],
        },
        settings: defaults,
      })
    ).toStrictEqual(
      'https://test.com/?region=foo&distance=1&weekday=monday&time=night&type=online'
    );
  });

  it('works with params', () => {
    expect(
      formatUrl({
        input: {
          meeting: 'foo',
          mode: 'location',
          search: 'bar',
          view: 'map',
        },
        settings: defaults,
      })
    ).toStrictEqual(
      'https://test.com/?search=bar&mode=location&view=map&meeting=foo'
    );
  });
});
