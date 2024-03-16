import { FormEvent, useEffect, useRef, useState, MouseEvent } from 'react';

import { useSearchParams } from 'react-router-dom';

import { analyticsEvent, getQueryString, useSettings } from '../helpers';
import {
  controlsCss,
  controlsGroupFirstCss,
  controlsGroupLastCss,
  controlsInputCss,
  controlsInputFirstCss,
  controlsInputSearchSubmitCss,
  controlsSearchDropdownCss,
  dropdownButtonLastCss,
  dropdownCss,
} from '../styles';

import Dropdown from './Dropdown';

export default function Controls() {
  const { capabilities, meetings, settings, strings } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const input = getQueryString(searchParams, settings);
  const [dropdown, setDropdown] = useState<string>();
  const [search, setSearch] = useState(
    input.mode === 'location' ? input.search : ''
  );
  const searchInput = useRef<HTMLInputElement>(null);

  //get available search options based on capabilities
  const allModes = ['search', 'location', 'me'] as const;
  const modes = allModes
    .filter(
      mode =>
        mode !== 'location' || (capabilities.coordinates && settings.mapbox)
    )
    .filter(
      mode =>
        mode !== 'me' || (capabilities.coordinates && capabilities.geolocation)
    );

  //get available filters
  const filters = settings.filters
    .filter(filter => capabilities[filter])
    .filter(filter => filter !== 'region' || input.mode === 'search')
    .filter(filter => filter !== 'distance' || input.mode !== 'search');

  //get available views
  const views = ['list', 'map'].filter(
    view => view !== 'map' || (capabilities.coordinates && settings.mapbox)
  ) as ('list' | 'map')[];

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
      if (!input.search) return;
      analyticsEvent({
        category: 'search',
        action: input.mode,
        label: input.search,
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [input.search]);

  // update url params when search changes
  useEffect(() => {
    if (!searchInput.current) return;

    const { value } = searchInput.current;

    if (value === search) return;
    if (searchParams.get('search') === value) return;
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }

    setSearchParams(searchParams);
  }, [searchInput.current?.value]);

  //close current dropdown (on body click)
  const closeDropdown = () => {
    setDropdown(undefined);
  };

  //near location search
  const locationSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.mode !== 'location') return;

    /*
    setState({
      ...state,
      input: {
        ...state.input,
        latitude: undefined,
        longitude: undefined,
        search,
      },
    });
    */
  };

  //set search mode dropdown and clear all distances
  const setMode = (e: MouseEvent, mode: 'search' | 'location' | 'me') => {
    e.preventDefault();

    Object.keys(meetings).forEach(slug => {
      meetings[slug].distance = undefined;
    });

    setSearch('');
    if (mode !== 'search') {
      searchParams.delete('search');
      searchParams.set('mode', mode);
    } else {
      searchParams.delete('mode');
    }

    //focus after waiting for disabled to clear
    setTimeout(() => searchInput.current?.focus(), 100);

    /*
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
    */

    setSearchParams(searchParams);
  };

  //toggle list/map view
  const setView = (e: MouseEvent, view: 'list' | 'map') => {
    e.preventDefault();

    if (view !== 'list') {
      searchParams.set('view', view);
    } else {
      searchParams.delete('view');
    }

    /*
    setState({ ...state, input: { ...state.input, view } });
    */

    setSearchParams(searchParams);
  };

  return !Object.keys(meetings).length ? null : (
    <div css={controlsCss}>
      <form onSubmit={locationSearch} css={dropdownCss}>
        <fieldset role="group">
          <input
            aria-label={strings.modes[input.mode]}
            css={modes.length > 1 ? controlsInputFirstCss : controlsInputCss}
            disabled={input.mode === 'me'}
            onChange={e => {
              if (input.mode === 'search') {
                input.search = e.target.value;
                // setState({ ...state });
              } else {
                setSearch(e.target.value);
              }
            }}
            placeholder={strings.modes[input.mode]}
            ref={searchInput}
            spellCheck="false"
            type="search"
            value={input.mode === 'location' ? search : input.search}
          />
          <input type="submit" hidden css={controlsInputSearchSubmitCss} />
          {modes.length > 1 && (
            <button
              aria-label={strings.modes[input.mode]}
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
                data-active={input.mode === mode}
                key={mode}
                onClick={e => setMode(e, mode)}
              >
                {strings.modes[mode]}
              </button>
            ))}
          </div>
        )}
      </form>
      {filters.map(filter => (
        <div key={filter}>
          <Dropdown
            defaultValue={
              strings[`${filter}_any` as keyof typeof strings] as string
            }
            filter={filter}
            open={dropdown === filter}
            setDropdown={setDropdown}
            // state={state}
          />
        </div>
      ))}
      {canShowViews && (
        <div role="group">
          {views.map((view, index) => (
            <button
              css={index ? controlsGroupLastCss : controlsGroupFirstCss}
              data-active={input.view === view}
              key={view}
              onClick={e => setView(e, view)}
              type="button"
            >
              {strings.views[view]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
