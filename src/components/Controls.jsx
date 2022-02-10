import React, { useEffect, useRef, useState } from 'react';

import Dropdown from './Dropdown';
import Icon from './Icon';
import {
  analyticsEvent,
  formatClasses as cx,
  formatUrl,
  settings,
  strings,
} from '../helpers';

export default function Controls({ state, setState, mapbox }) {
  const [dropdown, setDropdown] = useState(null);
  const [search, setSearch] = useState(
    state.input.mode === 'location' ? state.input.search : ''
  );
  const searchInput = useRef();

  //get available search options based on capabilities
  const modes = ['search', 'location', 'me']
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
    .filter(filter => filter !== 'region' || state.input.mode !== 'me')
    .filter(filter => filter !== 'distance' || state.input.mode !== 'search');

  //get available views
  const views = ['table', 'map'].filter(
    view => view !== 'map' || (state.capabilities.coordinates && mapbox)
  );

  //whether to show the views segmented button
  const canShowViews = views.length > 1;

  //document effect
  useEffect(() => {
    //add click listener for dropdowns (in lieu of including bootstrap js + jquery)
    document.body.addEventListener('click', closeDropdown);
    return () => {
      //remove click listener for dropdowns (in lieu of including bootstrap js + jquery)
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
  const closeDropdown = e => {
    if (e.srcElement.classList.contains('dropdown-toggle')) return;
    setDropdown(null);
  };

  //near location search
  const locationSearch = e => {
    e.preventDefault();

    if (state.input.mode === 'location') {
      setState({
        ...state,
        input: {
          ...state.input,
          latitude: null,
          longitude: null,
          search: search,
        },
      });
    }
  };

  //set search mode dropdown and clear all distances
  const setMode = (e, mode) => {
    e.preventDefault();

    Object.keys(state.meetings).forEach(slug => {
      state.meetings[slug].distance = null;
    });

    setSearch('');

    //focus after waiting for disabled to clear
    setTimeout(() => searchInput.current.focus(), 100);

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
        search: '',
        mode: mode,
        latitude: null,
        longitude: null,
      },
    });
  };

  //toggle list/map view
  const setView = (e, view) => {
    e.preventDefault();
    state.input.view = view;
    setState({ ...state });
  };

  return (
    !!Object.keys(state.meetings).length && (
      <div className="row d-print-none controls">
        <div className="col-sm-6 col-lg mb-3">
          <div className="position-relative">
            <form className="input-group" onSubmit={locationSearch}>
              <input
                className="form-control"
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
                  className="btn btn-outline-secondary dropdown-toggle"
                  onClick={() =>
                    setDropdown(dropdown === 'search' ? null : 'search')
                  }
                  type="button"
                />
              )}
            </form>
            {modes.length > 1 && (
              <div
                className={cx('dropdown-menu dropdown-menu-end my-1', {
                  show: dropdown === 'search',
                })}
              >
                {modes.map(mode => (
                  <a
                    className={cx(
                      'align-items-center dropdown-item d-flex justify-content-between',
                      {
                        'active bg-secondary text-white':
                          state.input.mode === mode,
                      }
                    )}
                    href={formatUrl({ ...state.input, mode: mode })}
                    key={mode}
                    onClick={e => setMode(e, mode)}
                  >
                    {strings.modes[mode]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {filters.map((filter, index) => (
          <div className="col-sm-6 col-lg mb-3" key={filter}>
            <Dropdown
              defaultValue={strings[filter + '_any']}
              end={!canShowViews && !filters[index + 1]}
              filter={filter}
              open={dropdown === filter}
              setDropdown={setDropdown}
              state={state}
              setState={setState}
            />
          </div>
        ))}
        {canShowViews && (
          <div aria-hidden="true" className="col-sm-6 col-lg mb-3">
            <div className="btn-group h-100 w-100" role="group">
              {views.map(view => (
                <button
                  className={cx(
                    'btn btn-outline-secondary d-flex align-items-center justify-content-center w-100',
                    {
                      active: state.input.view === view,
                    }
                  )}
                  key={view}
                  onClick={e => setView(e, view)}
                  type="button"
                >
                  <Icon icon={view} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  );
}
