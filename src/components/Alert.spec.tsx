import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Alert from './Alert';
import { strings } from '../helpers';

//TODO: These types can be much better once AppState types are defined.

describe('<Alert />', () => {
  it('renders null with no alerts or errors', () => {
    const { container } = render(<Alert state={{}} setState={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('works with error state', () => {
    render(
      <Alert
        state={{ error: 'an error was encountered loading the data' }}
        setState={jest.fn()}
      />
    );

    const text = /an error was encountered loading the data/i;

    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('works with clearing filters with no results', async () => {
    const mockState = {
      alert: strings.no_results,
      input: {
        distance: [],
        region: ['foo'],
        search: 'bar',
        time: ['baz'],
        type: ['qux'],
        weekday: ['0'],
      },
      indexes: {
        region: [{ key: 'foo', name: 'Foo' }],
        time: [{ key: 'baz', name: 'Baz' }],
        type: [{ key: 'qux', name: 'Qux' }],
        weekday: [{ key: '0', name: 'Monday' }],
      },
    };

    const mockSetState = jest.fn();

    render(<Alert state={mockState} setState={mockSetState} />);

    const text = /No meetings were found matching the selected criteria./i;
    expect(screen.getByText(text)).toBeInTheDocument();

    const removeSearchButton = screen.getByText(/remove ‘bar’/i);
    const removeRegionButton = screen.getByText(/remove foo/i);
    const removeTimeButton = screen.getByText(/remove baz/i);
    const removeTypeButton = screen.getByText(/remove qux/i);
    const removeWeekdayButton = screen.getByText(/remove monday/i);

    function modify<
      K extends keyof typeof mockState['input'],
      T extends typeof mockState['input'][K]
    >(key: K, value: T) {
      return {
        ...mockState,
        input: { ...mockState.input, [key]: value },
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
