import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { analyticsEvent } from '../helpers';
import { useData, useFilter, useInput, useSettings } from '../hooks';
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
  const { capabilities, meetings } = useData();
  const { latitude } = useFilter();
  const { settings, strings } = useSettings();
  const [dropdown, setDropdown] = useState<string>();
  const [searchParams, setSearchParams] = useSearchParams();
  const input = useInput();
  const [search, setSearch] = useState(
    input.mode === 'location' ? input.search : ''
  );
  const searchInput = useRef<HTMLInputElement>(null);

  // get available search options based on capabilities
  const allModes = ['search', 'location', 'me'] as const;
  const modes = allModes
    .filter(mode => mode !== 'location' || capabilities.coordinates)
    .filter(
      mode =>
        mode !== 'me' || (capabilities.coordinates && capabilities.geolocation)
    );

  // get available filters
  const filters = settings.filters
    .filter(filter => capabilities[filter])
    .filter(filter => filter !== 'region' || input.mode === 'search')
    .filter(
      filter => filter !== 'distance' || (input.mode !== 'search' && latitude)
    );

  // get available views
  const allViews = ['table', 'map'] as const;
  const views = allViews.filter(
    view => view !== 'map' || capabilities.coordinates
  );

  // whether to show the views segmented button
  const canShowViews = views.length > 1;

  // add click listener for dropdowns (in lieu of including bootstrap js + jquery)
  useEffect(() => {
    document.body.addEventListener('click', closeDropdown);
    return () => {
      document.body.removeEventListener('click', closeDropdown);
    };
  }, [document]);

  // search effect
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
    if (input.search === value) return;
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }

    setSearchParams(searchParams);
  }, [searchInput.current?.value]);

  // close current dropdown (on body click)
  const closeDropdown = () => {
    setDropdown(undefined);
  };

  // near location search
  const locationSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.mode !== 'location') return;

    if (search) {
      searchParams.set('search', search);
    } else {
      searchParams.delete('search');
      Object.keys(meetings).forEach(slug => {
        meetings[slug].distance = undefined;
      });
    }

    setSearchParams(searchParams);
  };

  // set search mode dropdown and reset distances
  const setMode = (e: MouseEvent, mode: 'search' | 'location' | 'me') => {
    e.preventDefault();

    Object.keys(meetings).forEach(slug => {
      meetings[slug].distance = undefined;
    });

    if (mode === 'me') {
      setSearch('');
      searchParams.delete('search');
    } else if (mode === 'location') {
      // sync local with state
      setSearch(input.search);
    }

    if (mode !== settings.defaults.mode) {
      searchParams.set('mode', mode);
    } else {
      searchParams.delete('mode');
    }

    // focus after waiting for disabled to clear
    setTimeout(() => searchInput.current?.focus(), 100);

    searchParams.set('distance', settings.default_distance.join('/'));

    setSearchParams(searchParams);
  };

  //toggle list/map view
  const setView = (e: MouseEvent, view: 'table' | 'map') => {
    e.preventDefault();

    if (view !== 'table') {
      searchParams.set('view', view);
    } else {
      searchParams.delete('view');
    }

    // setState({ ...state, input: { ...state.input, view } });

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
                // setState(state => ({
                //   ...state,
                //   input: { ...state.input, search: e.target.value },
                // }));
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
              <div
                className="tsml-dropdown__item"
                data-active={mode === input.mode}
                key={mode}
              >
                <button
                  className="tsml-dropdown__button"
                  onClick={e => setMode(e, mode)}
                >
                  {strings.modes[mode]}
                </button>
              </div>
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
          />
        </div>
      ))}
      {canShowViews && (
        <div role="group">
          {views.map((view, index) => (
            <button
              css={index ? controlsGroupLastCss : controlsGroupFirstCss}
              data-active={view === input.view}
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
