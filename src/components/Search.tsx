import { useEffect, useRef, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { analyticsEvent, useData, useSettings } from '../helpers';
import {
  controlsInputCss,
  controlsInputFirstCss,
  controlsInputSearchSubmitCss,
  controlsSearchDropdownCss,
  dropdownButtonLastCss,
  dropdownCss,
} from '../styles';

type Mode = 'search' | 'location' | 'me';

export default function Search({
  dropdown,
  setDropdown,
}: {
  dropdown?: string;
  setDropdown: (_value?: string) => void;
}) {
  const { capabilities, input } = useData();
  const { settings, strings } = useSettings();
  const searchInput = useRef<HTMLInputElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(input.search);

  const setSearchParam = () => {
    if (search) {
      searchParams.set('search', search);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  // keyword search
  useEffect(() => {
    if (input.mode !== 'search') return;
    setSearchParam();
  }, [search]);

  // track analytics event (debounce 2s)
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

  // get available search options based on capabilities
  const modes = ['search', 'location', 'me']
    .filter(
      mode =>
        mode !== 'location' || (capabilities.coordinates && settings.mapbox)
    )
    .filter(
      mode =>
        mode !== 'me' || (capabilities.coordinates && capabilities.geolocation)
    ) as Mode[];

  //set search mode dropdown and clear all distances
  const setMode = (mode: Mode) => {
    if (mode !== 'search') {
      searchParams.set('mode', mode);
    } else {
      searchParams.delete('mode');
    }
    setSearch('');

    //focus after waiting for disabled to clear
    setTimeout(() => searchInput.current?.focus(), 100);

    setSearchParams(searchParams);
  };

  const locationSearch = () => {
    if (input.mode !== 'location') return;
    setSearchParam();
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        locationSearch();
      }}
      css={dropdownCss}
    >
      <fieldset role="group">
        <input
          aria-label={strings.modes[input.mode]}
          css={modes.length > 1 ? controlsInputFirstCss : controlsInputCss}
          disabled={input.mode === 'me'}
          onChange={e => setSearch(e.target.value)}
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
              e.stopPropagation();
              setDropdown(dropdown === 'search' ? undefined : 'search');
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
              onClick={() => setMode(mode)}
            >
              {strings.modes[mode]}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
