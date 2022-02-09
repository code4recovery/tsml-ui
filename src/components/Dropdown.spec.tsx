import { fireEvent, render, screen } from '@testing-library/react';
import Dropdown from './Dropdown';
import { settings, strings } from '../helpers';

//TODO: These types can be much better once AppState types are defined.

describe('<Dropdown />', () => {
  const filter = settings.filters[0];
  const defaultValue = strings[`${filter}_any`];

  it('renders', () => {
    const { container } = render(
      <Dropdown
        filter={filter}
        options={[]}
        open={false}
        end={false}
        values={[]}
        defaultValue={defaultValue}
        setDropdown={jest.fn()}
        state={{}}
        setState={jest.fn()}
      />
    );

    expect(screen.getAllByText(defaultValue)).toHaveLength(2);
  });

  it('opens', () => {
    const filter = settings.filters[0];
    const defaultValue = strings[`${filter}_any`];

    const { container } = render(
      <Dropdown
        filter={filter}
        options={[{ key: 'foo', name: 'Foo', slugs: ['foobar'], children: [] }]}
        open={false}
        end={false}
        values={[]}
        defaultValue={defaultValue}
        setDropdown={jest.fn()}
        state={{}}
        setState={jest.fn()}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const dropdown = screen.getByLabelText(defaultValue);
    expect(dropdown).toBeVisible();
  });

  /*
  it('works with error state', () => {
    render(<Dropdown state={{ error: 'bad_data' }} setState={jest.fn()} />);

    const reloadSpy = jest.spyOn(location, 'reload');

    const text = /an error was encountered loading the data/i;
    const button = screen.getByText(/reload/i);

    expect(screen.getByText(text)).toBeInTheDocument();
    fireEvent.click(button);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('works with clearing filters with no results', async () => {
    const mockState = {
      Dropdown: 'no_results',
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

    render(<Dropdown state={mockState} setState={mockSetState} />);

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
  */
});
