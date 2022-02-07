import { formatUrl } from '.';

describe('formatUrl', () => {
  it('works with no params', () => {
    expect(formatUrl({})).toStrictEqual('https://test.com/');
  });

  it('works with filters', () => {
    expect(
      formatUrl({
        distance: [1],
        region: ['foo'],
        time: ['night'],
        type: ['online'],
        weekday: ['monday'],
      })
    ).toStrictEqual(
      'https://test.com/?region=foo&distance=1&weekday=monday&time=night&type=online'
    );
  });

  it('works with params', () => {
    expect(
      formatUrl({
        meeting: 'foo',
        mode: 'location',
        search: 'bar',
        view: 'map',
      })
    ).toStrictEqual(
      'https://test.com/?search=bar&mode=location&view=map&meeting=foo'
    );
  });
});
