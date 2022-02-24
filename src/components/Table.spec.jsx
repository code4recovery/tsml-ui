import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment-timezone';

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
        start: moment(),
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

  it('renders', () => {
    render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={[]}
        listButtons={false}
      />
    );
    const anchors = screen.getAllByRole('link');
    expect(anchors).toHaveLength(2);
    anchors.forEach(anchor => fireEvent.click(anchor));
  });

  it('renders with listButtons and single meeting in progress', () => {
    render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={['foo']}
        listButtons={true}
      />
    );
    const anchors = screen.getAllByRole('link');
    expect(anchors).toHaveLength(5);
    anchors.forEach(anchor => fireEvent.click(anchor));
  });

  it('renders with multiple meetings in progress', () => {
    render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={['foo', 'bar']}
        listButtons={true}
      />
    );
    const anchors = screen.getAllByRole('link');
    expect(anchors).toHaveLength(5);

    const button = screen.getByRole('button');
    fireEvent.click(button);
  });
});
