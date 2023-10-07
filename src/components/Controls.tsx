import { useEffect, useRef, useState } from 'react';

import Dropdown from './Dropdown';
import Icon from './Icon';
import { analyticsEvent, formatUrl, useSettings } from '../helpers';
import {
  controlsCss,
  controlsGroupFirstCss,
  controlsGroupLastCss,
  controlsInputCss,
  controlsInputFirstCss,
  controlsSearchDropdownCss,
  dropdownButtonLastCss,
  dropdownCss,
} from '../styles';
import type { State } from '../types';

type ControlsProps = {
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
  mapbox?: string;
};

export default function Controls({ state, setState, mapbox }: ControlsProps) {
  const { settings, strings } = useSettings();
  const [dropdown, setDropdown] = useState<string>();
  const [search, setSearch] = useState(
    state.input.mode === 'location' ? state.input.search : ''
  );
  const searchInput = useRef<HTMLInputElement>(null);

  //get available search options based on capabilities
  const allModes = ['search', 'location', 'me'] as const;
  const modes = allModes
    .filter(
      mode => mode !== 'location' || (state.capabilities.coordinates && mapbox)
    )
    .filter(
      mode =>
        mode !== 'me' ||
        (state.capabilities.coordinates && state.capabilities.geolocation)
    );

  //get available filters
  const filters = settings.filters
    .filter(filter => state.capabilities[filter])
    .filter(filter => filter !== 'region' || state.input.mode === 'search')
    .filter(filter => filter !== 'distance' || state.input.mode !== 'search');

  //get available views
  const allViews = ['table', 'map'] as const;
  const views = allViews.filter(
    view => view !== 'map' || (state.capabilities.coordinates && mapbox)
  );

  //whether to show the views segmented button
  const canShowViews = views.length > 1;

  //add click listener for dropdowns (in lieu of including bootstrap js + jquery)
  useEffect(() => {
    document.body.addEventListener('click', closeDropdown);
    return () => {
      document.body.removeEventListener('click', closeDropdown);
    };
  }, [document]);

  //search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!state.input.search) return;
      analyticsEvent({
        category: 'search',
        action: state.input.mode,
        label: state.input.search,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [state.input.search]);

  //close current dropdown (on body click)
  const closeDropdown = (e: MouseEvent) => {
    setDropdown(undefined);
  };

  //near location search
  const locationSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (state.input.mode === 'location') {
      setState({
        ...state,
        input: {
          ...state.input,
          latitude: undefined,
          longitude: undefined,
          search: search,
        },
      });
    }
  };

  //set search mode dropdown and clear all distances
  const setMode = (e: React.MouseEvent, mode: 'search' | 'location' | 'me') => {
    e.preventDefault();

    Object.keys(state.meetings).forEach(slug => {
      state.meetings[slug].distance = undefined;
    });

    setSearch('');

    //focus after waiting for disabled to clear
    setTimeout(() => searchInput.current?.focus(), 100);

    setState({
      ...state,
      capabilities: {
        ...state.capabilities,
        distance: false,
      },
      indexes: {
        ...state.indexes,
        distance: [],
      },
      input: {
        ...state.input,
        distance: [],
        latitude: undefined,
        longitude: undefined,
        mode: mode,
        search: '',
      },
    });
  };

  //toggle list/map view
  const setView = (e: React.MouseEvent, view: 'table' | 'map') => {
    e.preventDefault();
    state.input.view = view;
    setState({ ...state });
  };

  return !Object.keys(state.meetings).length ? null : (
    <div css={controlsCss}>
      <form onSubmit={locationSearch} css={dropdownCss}>
        <fieldset role="group">
          <input
            aria-label={strings.modes[state.input.mode]}
            css={modes.length > 1 ? controlsInputFirstCss : controlsInputCss}
            disabled={state.input.mode === 'me'}
            onChange={e => {
              if (state.input.mode === 'search') {
                state.input.search = e.target.value;
                setState({ ...state });
              } else {
                setSearch(e.target.value);
              }
            }}
            placeholder={strings.modes[state.input.mode]}
            ref={searchInput}
            spellCheck="false"
            type="search"
            value={
              state.input.mode === 'location' ? search : state.input.search
            }
          />
          {modes.length > 1 && (
            <button
              aria-label={strings.modes[state.input.mode]}
              css={dropdownButtonLastCss}
              onClick={e => {
                setDropdown(dropdown === 'search' ? undefined : 'search');
                e.stopPropagation();
              }}
              type="button"
            />
          )}
        </fieldset>
        {modes.length > 1 && (
          <div
            css={controlsSearchDropdownCss}
            style={{
              display: dropdown === 'search' ? 'block' : 'none',
            }}
          >
            {modes.map(mode => (
              <button
                data-active={state.input.mode === mode}
                key={mode}
                onClick={e => setMode(e, mode)}
              >
                {strings.modes[mode]}
              </button>
            ))}
          </div>
        )}
      </form>
      {filters.map((filter, index) => (
        <div key={filter}>
          <Dropdown
            defaultValue={
              strings[`${filter}_any` as keyof typeof strings] as string
            }
            end={!canShowViews && index === filters.length - 1}
            filter={filter}
            open={dropdown === filter}
            setDropdown={setDropdown}
            state={state}
            setState={setState}
          />
        </div>
      ))}
      {canShowViews && (
        <div role="group">
          {views.map((view, index) => (
            <button
              aria-label={strings.views[view]}
              css={index ? controlsGroupLastCss : controlsGroupFirstCss}
              data-active={state.input.view === view}
              key={view}
              onClick={e => setView(e, view)}
              type="button"
            >
              <Icon icon={view} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
