import { screen, render } from '@testing-library/react';
import Title from './Title';

function assertHeadingAndTitleHas(title: string) {
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toHaveTextContent(title);
  expect(document.title).toStrictEqual(title);
}

describe('<Title />', () => {
  it('returns null without indices or input', () => {
    const { container } = render(<Title state={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('works with meeting key', () => {
    render(<Title state={{ indexes: {}, input: {} }} />);
    assertHeadingAndTitleHas('Meetings');
  });

  it('works with search mode and search term', () => {
    render(
      <Title
        state={{ indexes: {}, input: { mode: 'search', search: 'foo' } }}
      />
    );
    assertHeadingAndTitleHas('Meetings with ‘foo’');
  });

  it('works with location mode and search term', () => {
    render(
      <Title
        state={{ indexes: {}, input: { mode: 'location', search: 'foo' } }}
      />
    );
    assertHeadingAndTitleHas('Meetings near ‘foo’');
  });

  it('works with one key', () => {
    render(
      <Title
        state={{
          indexes: { weekday: [{ key: 0, name: 'foo' }] },
          input: { weekday: [0] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo Meetings');
  });

  it('works with different keys', () => {
    render(
      <Title
        state={{
          indexes: {
            weekday: [{ key: 0, name: 'foo' }],
            region: [{ key: 0, name: 'bar' }],
          },
          input: { weekday: [0], region: [0] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo Meetings in bar');
  });

  it('works with more different keys', () => {
    render(
      <Title
        state={{
          indexes: {
            weekday: [{ key: 0, name: 'foo' }],
            region: [{ key: 0, name: 'bar' }],
            time: [{ key: 0, name: 'baz' }],
          },
          input: { weekday: [0], region: [0], time: [0] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo baz Meetings in bar');
  });

  it('works with multiple of the same key', () => {
    render(
      <Title
        state={{
          indexes: {
            weekday: [
              { key: 0, name: 'foo' },
              { key: 1, name: 'bar' },
            ],
          },
          input: { weekday: [0, 1] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo + bar Meetings');
  });
});
