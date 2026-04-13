import { cleanup, render, screen } from '@testing-library/react';
import { DateTime } from 'luxon';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Table from '../../src/components/Table';
import { SettingsProvider } from '../../src/hooks';

const mockMeetings: Record<string, any> = {
  'meeting-1': {
    slug: 'meeting-1',
    name: 'Alpha Group',
    isInPerson: true,
    isOnline: false,
    isActive: true,
    address: '123 Main St',
    location: 'Community Center',
    group: 'Alpha Group',
    start: DateTime.fromObject({ hour: 10, minute: 0 }),
    regions: ['Downtown'],
  },
  'meeting-2': {
    slug: 'meeting-2',
    name: 'Beta Group',
    isInPerson: false,
    isOnline: true,
    isActive: true,
    conference_provider: 'Zoom',
    location: 'Online',
    group: 'Beta Group',
    start: DateTime.fromObject({ hour: 18, minute: 30 }),
    regions: ['Uptown'],
  },
};

const mockFilterState = {
  filteredSlugs: Object.keys(mockMeetings),
  inProgress: [] as string[],
  waitingForFilter: false,
};

const mockErrorState = { error: null as string | null };

vi.mock('../../src/hooks', async () => {
  const originalModule = await vi.importActual('../../src/hooks');
  return {
    ...originalModule,
    useData: () => ({
      capabilities: { distance: false, location: true, region: true },
      meetings: mockMeetings,
      waitingForData: false,
    }),
    useError: () => mockErrorState,
    useFilter: () => mockFilterState,
    useInput: () => ({ input: {} }),
    useLocation: () => ({ latitude: null, longitude: null }),
  };
});

// Mock @tanstack/react-virtual using vi.fn() so tests can override with mockImplementationOnce.
const defaultVirtualizer = ({
  count,
  scrollMargin,
}: {
  count: number;
  scrollMargin: number;
}) => {
  const items = Array.from({ length: count }, (_, i) => ({
    index: i,
    start: i * 48,
    end: (i + 1) * 48,
    key: i,
    size: 48,
    lane: 0,
  }));
  return {
    getVirtualItems: () => items,
    getTotalSize: () => count * 48,
    options: { scrollMargin: scrollMargin ?? 0 },
  };
};

const renderTable = () =>
  render(
    <MemoryRouter>
      <SettingsProvider>
        <Table />
      </SettingsProvider>
    </MemoryRouter>
  );

let lastObserverOptions: IntersectionObserverInit | undefined;

// @ts-ignore
global.IntersectionObserver = class IntersectionObserver {
  constructor(_cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    lastObserverOptions = options;
  }
  disconnect() {
    return null;
  }
  observe() {
    return null;
  }
  takeRecords() {
    return [];
  }
  unobserve() {
    return null;
  }
};

describe('<Table />', () => {
  afterEach(() => {
    cleanup();
    mockFilterState.filteredSlugs = Object.keys(mockMeetings);
    mockFilterState.inProgress = [];
    mockErrorState.error = null;
  });

  it('renders null when filteredSlugs is empty', () => {
    mockFilterState.filteredSlugs = [];
    const { container } = renderTable();
    expect(container.firstChild).toBeNull();
  });

  it('renders null when there is an error', () => {
    mockErrorState.error = 'Network error';
    const { container } = renderTable();
    expect(container.firstChild).toBeNull();
  });

  it('renders a table element with thead and tbody', () => {
    renderTable();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(document.querySelector('thead')).toBeInTheDocument();
    expect(document.querySelector('tbody')).toBeInTheDocument();
  });

  it('renders column header cells', () => {
    renderTable();
    const ths = document.querySelectorAll('thead th');
    expect(ths.length).toBeGreaterThan(0);
  });

  it('renders all virtual rows from filteredSlugs', () => {
    renderTable();
    expect(screen.getAllByText('Alpha Group').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Beta Group').length).toBeGreaterThan(0);
  });

  it('renders one row per filtered slug', () => {
    renderTable();
    // The main tbody rows equal filteredSlugs.length (no padding because start===0)
    const rows = document.querySelectorAll('tbody tr');
    expect(rows.length).toBe(mockFilterState.filteredSlugs.length);
  });

  it('renders in-progress tbody when inProgress is non-empty', () => {
    mockFilterState.inProgress = ['meeting-2'];
    renderTable();
    // Two tbodies: one in-progress, one main virtual
    const tbodies = document.querySelectorAll('tbody');
    expect(tbodies.length).toBe(2);
  });

  it('renders an in-progress toggle button for multiple in-progress meetings', () => {
    mockFilterState.inProgress = ['meeting-1', 'meeting-2'];
    renderTable();
    const button = document.querySelector('tbody button');
    expect(button).toBeInTheDocument();
  });

  it('passes a valid rootMargin to IntersectionObserver (all tokens must have units)', () => {
    renderTable();
    const rootMargin = lastObserverOptions?.rootMargin ?? '';
    const tokens = rootMargin.trim().split(/\s+/);
    const validToken = /^-?\d+(\.\d+)?(px|%)$/;
    tokens.forEach(token => {
      expect(token).toMatch(validToken);
    });
  });
});
