import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Alert from '../../src/components/Alert';
import { en } from '../../src/i18n';
import { mockState } from '../__fixtures__';

describe('<Alert />', () => {
  it('renders null with no alerts or errors', () => {
    const { container } = render(
      <Alert state={mockState} setState={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('works with error state', () => {
    render(
      <Alert
        state={{
          ...mockState,
          error: 'an error was encountered loading the data',
        }}
        setState={jest.fn()}
      />
    );

    const text = /an error was encountered loading the data/i;

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('works with clearing filters with no results', async () => {
    const mockSetState = jest.fn();

    const mockStateWithFilters = {
      ...mockState,
      alert: en.no_results,
      input: {
        ...mockState.input,
        region: ['foo'],
        search: 'bar',
        time: ['baz'],
        type: ['qux'],
        weekday: ['0'],
      },
      indexes: {
        ...mockState.indexes,
        region: [{ key: 'foo', name: 'Foo', slugs: ['test'] }],
        time: [{ key: 'baz', name: 'Baz', slugs: [] }],
        type: [{ key: 'qux', name: 'Qux', slugs: [] }],
        weekday: [{ key: '0', name: 'Monday', slugs: [] }],
      },
    };

    render(<Alert state={mockStateWithFilters} setState={mockSetState} />);

    expect(screen.getByText(en.no_results)).toBeInTheDocument();

    const removeSearchButton = screen.getByText(/remove ‘bar’/i);
    const removeRegionButton = screen.getByText(/remove foo/i);
    const removeTimeButton = screen.getByText(/remove baz/i);
    const removeTypeButton = screen.getByText(/remove qux/i);
    const removeWeekdayButton = screen.getByText(/remove monday/i);

    function modify<
      K extends keyof (typeof mockStateWithFilters)['input'],
      T extends (typeof mockStateWithFilters)['input'][K]
    >(key: K, value: T) {
      return {
        ...mockStateWithFilters,
        input: { ...mockStateWithFilters.input, [key]: value },
      };
    }

    fireEvent.click(removeSearchButton);
    expect(mockSetState).toHaveBeenLastCalledWith(modify('search', ''));

    fireEvent.click(removeRegionButton);
    expect(mockSetState).toHaveBeenLastCalledWith(modify('region', []));

    fireEvent.click(removeTimeButton);
    expect(mockSetState).toHaveBeenLastCalledWith(modify('time', []));

    fireEvent.click(removeTypeButton);
    expect(mockSetState).toHaveBeenLastCalledWith(modify('type', []));

    fireEvent.click(removeWeekdayButton);
    expect(mockSetState).toHaveBeenLastCalledWith(modify('weekday', []));
  });
});
