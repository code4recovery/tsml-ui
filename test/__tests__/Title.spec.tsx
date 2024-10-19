import React from 'react';

import '@testing-library/jest-dom';

import { screen, render } from '@testing-library/react';

import Title from '../../src/components/Title';
import { mockState } from '../__fixtures__';

function assertHeadingAndTitleHas(title: string) {
  const heading = screen.getByRole('heading', { level: 1 });
  expect(heading).toHaveTextContent(title);
  expect(document.title).toStrictEqual(title);
}

describe('<Title />', () => {
  it('works with meeting key', () => {
    render(<Title state={mockState} />);
    assertHeadingAndTitleHas('Meetings');
  });

  it('works with search mode and search term', () => {
    render(
      <Title
        state={{ ...mockState, input: { ...mockState.input, search: 'foo' } }}
      />
    );
    assertHeadingAndTitleHas('Meetings with ‘foo’');
  });

  it('works with location mode and search term', () => {
    render(
      <Title
        state={{
          ...mockState,
          input: { ...mockState.input, mode: 'location', search: 'foo' },
        }}
      />
    );
    assertHeadingAndTitleHas('Meetings near ‘foo’');
  });

  it('works with one key', () => {
    render(
      <Title
        state={{
          ...mockState,
          indexes: {
            ...mockState.indexes,
            weekday: [{ key: '0', name: 'foo', slugs: [] }],
          },
          input: { ...mockState.input, weekday: ['0'] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo Meetings');
  });

  it('works with different keys', () => {
    render(
      <Title
        state={{
          ...mockState,
          indexes: {
            ...mockState.indexes,
            weekday: [{ key: '0', name: 'foo', slugs: [] }],
            region: [{ key: '0', name: 'bar', slugs: [] }],
          },
          input: { ...mockState.input, weekday: ['0'], region: ['0'] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo Meetings in bar');
  });

  it('works with more different keys', () => {
    render(
      <Title
        state={{
          ...mockState,
          indexes: {
            ...mockState.indexes,
            weekday: [{ key: '0', name: 'foo', slugs: [] }],
            region: [{ key: '0', name: 'bar', slugs: [] }],
            time: [{ key: 'morning', name: 'baz', slugs: [] }],
          },
          input: {
            ...mockState.input,
            weekday: ['0'],
            region: ['0'],
            time: ['morning'],
          },
        }}
      />
    );
    assertHeadingAndTitleHas('foo baz Meetings in bar');
  });

  it('works with multiple of the same key', () => {
    render(
      <Title
        state={{
          ...mockState,
          indexes: {
            ...mockState.indexes,
            weekday: [
              { key: '0', name: 'foo', slugs: [] },
              { key: '1', name: 'bar', slugs: [] },
            ],
          },
          input: { ...mockState.input, weekday: ['0', '1'] },
        }}
      />
    );
    assertHeadingAndTitleHas('foo + bar Meetings');
  });
});
