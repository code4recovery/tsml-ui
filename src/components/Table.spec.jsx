import { render } from '@testing-library/react';
import moment from 'moment-timezone';

import Table from './Table';

describe('<Table />', () => {
  const mockState = {
    capabilities: {
      region: true,
    },
    meetings: {
      foo: {
        name: 'Foo',
        location: 'Bar',
        formatted_address: '123 Main St, Anytown, NY 12345, USA',
        regions: ['Anytown'],
        start: moment(),
      },
    },
  };

  const filteredSlugs = Object.keys(mockState.meetings);

  it('renders', () => {
    const { container } = render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={filteredSlugs}
        listButtons={false}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders with listButtons', () => {
    const { container } = render(
      <Table
        state={mockState}
        setState={jest.fn()}
        filteredSlugs={filteredSlugs}
        inProgress={filteredSlugs}
        listButtons={true}
      />
    );
    expect(container).toBeTruthy();
  });
});
