import { fireEvent, render, screen } from '@testing-library/react';
import { DateTime } from 'luxon';

import { strings } from '../helpers';
import Table from './Table';

describe('<Table />', () => {
  const mockState = {
    capabilities: {
      region: true,
      location: true,
      distance: true,
    },
    meetings: {
      foo: {
        slug: 'foo',
        name: 'Foo',
        location: 'Bar',
        address: '123 Main St',
        distance: 1,
        types: ['M'],
        isInPerson: true,
        isOnline: true,
        formatted_address: '123 Main St, Anytown, NY 12345, USA',
        conference_url: 'https://zoom.us/d/12356789',
        conference_provider: 'Zoom',
        conference_phone: '+12121234123',
        regions: ['Anytown'],
        start: DateTime.now(),
      },
      bar: {
        slug: 'bar',
        name: 'Bar',
        location: 'Baz',
        types: ['M'],
        isInPerson: false,
        isOnline: false,
        formatted_address: 'Anytown, NY 12345, USA',
        regions: ['Anytown'],
      },
    },
  };

  const filteredSlugs = Object.keys(mockState.meetings);

  it('renders with clickable rows', () => {
    const mockSetState = jest.fn();
    render(
      <Table
        state={mockState}
        setState={mockSetState}
        filteredSlugs={filteredSlugs}
      />
    );

    //clickable rows
    const rows = screen.getAllByRole('row');
    rows.forEach(row => fireEvent.click(row));
    expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length);
  });

  it('renders with clickable listButtons', () => {
    const mockSetState = jest.fn();
    render(
      <Table
        state={mockState}
        setState={mockSetState}
        filteredSlugs={filteredSlugs}
        listButtons={true}
      />
    );

    //clickable links
    const anchors = screen.getAllByRole('link');
    anchors.forEach(anchor => fireEvent.click(anchor));
    expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length);

    //unclickable rows
    const rows = screen.getAllByRole('row');
    rows.forEach(row => fireEvent.click(row));
    expect(mockSetState).toHaveBeenCalledTimes(filteredSlugs.length);
  });

  it('displays single meeting in progress', () => {
    const inProgress = [filteredSlugs[0]];

    render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={inProgress}
      />
    );

    //count rows (data rows + header + show in progress)
    expect(screen.getAllByRole('row')).toHaveLength(filteredSlugs.length + 2);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(strings.in_progress_single);

    fireEvent.click(button);
    expect(button).not.toBeVisible();

    //recount rows
    expect(screen.getAllByRole('row')).toHaveLength(
      filteredSlugs.length + inProgress.length + 1
    );
  });

  it('displays multiple meetings in progress', () => {
    const inProgress = [...filteredSlugs];
    render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={inProgress}
      />
    );

    //count rows (data rows + header + show in progress)
    expect(screen.getAllByRole('row')).toHaveLength(filteredSlugs.length + 2);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent(
      strings.in_progress_multiple.replace('%count%', inProgress.length)
    );

    fireEvent.click(button);
    expect(button).not.toBeVisible();

    //recount rows
    expect(screen.getAllByRole('row')).toHaveLength(
      filteredSlugs.length + inProgress.length + 1
    );
  });
});
