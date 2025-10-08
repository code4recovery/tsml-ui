import { FormEvent, MouseEvent, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { analyticsEvent, formatSearch, formatUrl } from '../helpers';
import { useData, useInput, useSettings } from '../hooks';
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
  const { capabilities, meetings, slugs } = useData();
  const navigate = useNavigate();
  const { settings, strings } = useSettings();
  const [dropdown, setDropdown] = useState<string>();
  const { input } = useInput();
  const [search, setSearch] = useState(input.search);
  const searchInput = useRef<HTMLInputElement>(null);

  // get available search options based on capabilities
  const modes = settings.modes
    .filter(mode => mode !== 'location' || capabilities.coordinates)
    .filter(
      mode =>
        mode !== 'me' || (capabilities.coordinates && capabilities.geolocation)
    );

  // get available dropdowns
  const dropdowns = settings.filters
    .filter(filter => capabilities[filter])
    .filter(filter => filter !== 'region' || input.mode === 'search');

  // get available views
  const views = settings.views.filter(
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

  // update global state when search changes
  useEffect(() => {
    if (!searchInput.current) return;

    if (input.mode !== 'search') return;

    const { value } = searchInput.current;

    if (value === input.search) return;

    navigate(formatUrl({ ...input, search: value }, settings));
  }, [searchInput.current?.value]);

  // update search when global state changes
  useEffect(() => {
    if (!searchInput.current || searchInput.current.value === input.search)
      return;

    setSearch(input.search);
  }, [input.search]);

  // close current dropdown (on body click)
  const closeDropdown = () => {
    setDropdown(undefined);
  };

  // near location search
  const locationSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.mode !== 'location') return;

    if (!search) {
      slugs.forEach(slug => {
        meetings[slug].distance = undefined;
      });
    }

    navigate(formatUrl({ ...input, search }, settings));
  };

  // set search mode dropdown and reset distances
  const setMode = (e: MouseEvent, mode: 'search' | 'location' | 'me') => {
    e.preventDefault();

    slugs.forEach(slug => {
      meetings[slug].distance = undefined;
    });

    if (mode === 'me') {
      setSearch('');
    } else if (mode === 'location') {
      // sync local with state
      setSearch(input.search);
    }

    // focus after waiting for disabled to clear
    setTimeout(() => searchInput.current?.focus(), 100);

    const newInput = {
      ...input,
      distance:
        mode === 'search'
          ? undefined
          : input.distance ?? settings.distance_default,
      mode,
      region: mode === 'search' ? input.region : [],
      search,
    };

    navigate(formatUrl(newInput, settings));
  };

  return !slugs.length ? null : (
    <div css={controlsCss}>
      <form onSubmit={locationSearch} css={dropdownCss}>
        <fieldset role="group">
          <input
            aria-label={strings.modes[input.mode]}
            css={modes.length > 1 ? controlsInputFirstCss : controlsInputCss}
            disabled={input.mode === 'me'}
            onChange={e => setSearch(formatSearch(e.target.value))}
            placeholder={strings.modes[input.mode]}
            ref={searchInput}
            spellCheck="false"
            type="search"
            value={search}
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
                data-active={input.mode === mode}
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
      {input.mode !== 'search' && (
        <Dropdown
          defaultValue={strings.distance_any}
          filter="distance"
          open={dropdown === 'distance'}
          setDropdown={setDropdown}
        />
      )}
      {dropdowns.map(filter => (
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
              data-active={input.view === view}
              key={view}
              onClick={() => navigate(formatUrl({ ...input, view }, settings))}
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
