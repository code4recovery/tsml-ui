import { render, screen } from '@testing-library/react';

import Title from '../../src/components/Title';

function assertHeadingAndTitleHas(title: string) {
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toHaveTextContent(title);
  expect(document.title).toStrictEqual(title);
}

describe('<Title />', () => {
  it('works with meeting key', () => {
    render(<Title />);
    assertHeadingAndTitleHas('Meetings');
  });

  it('works with search mode and search term', () => {
    render(<Title />);
    assertHeadingAndTitleHas('Meetings with ‘foo’');
  });

  it('works with location mode and search term', () => {
    render(<Title />);
    assertHeadingAndTitleHas('Meetings near ‘foo’');
  });

  it('works with one key', () => {
    render(<Title />);
    assertHeadingAndTitleHas('foo Meetings');
  });

  it('works with different keys', () => {
    render(<Title />);
    assertHeadingAndTitleHas('foo Meetings in bar');
  });

  it('works with more different keys', () => {
    render(<Title />);
    assertHeadingAndTitleHas('foo baz Meetings in bar');
  });

  it('works with multiple of the same key', () => {
    render(<Title />);
    assertHeadingAndTitleHas('foo + bar Meetings');
  });
});
