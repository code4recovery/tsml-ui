import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames/bind';

import Dropdown from './dropdown';
import { settings, strings } from '../helpers/settings';

export default function Controls({ state, setAppState }) {
  const [dropdown, setDropdown] = useState(null);
  //const [geocoding, setGeocoding] = useState(false);
  const [search, setSearch] = useState(state.input.search);

  const searchInput = useRef();

  useEffect(() => {
    //add click listener for dropdowns (in lieu of including bootstrap js + jquery)
    document.body.addEventListener('click', closeDropdown);
    return () => {
      //remove click listener for dropdowns (in lieu of including bootstrap js + jquery)
      document.body.removeEventListener('click', closeDropdown);
    };
  }, [document]);

  //close current dropdown (on body click)
  const closeDropdown = e => {
    if (e.srcElement.classList.contains('dropdown-toggle')) return;
    setDropdown(null);
  };

  //keyword search
  const keywordSearch = e => {
    setSearch(e.target.value);
    if (state.input.mode == 'search') {
      setAppState('input', {
        ...state.input,
        search: e.target.value,
      });
    }
  };

  //near location search
  const locationSearch = e => {
    e.preventDefault();

    if (state.input.mode == 'location') {
      setAppState('input', {
        ...state.input,
        search: search,
      });
    }
  };

  //set filter: pass it up to parent
  const setFilter = (e, filter, value) => {
    e.preventDefault();
    e.stopPropagation();

    //add or remove from filters
    if (value) {
      if (e.metaKey) {
        const index = state.input[filter].indexOf(value);
        if (index == -1) {
          state.input[filter].push(value);
        } else {
          state.input[filter].splice(index, 1);
        }
      } else {
        state.input[filter] = [value];
      }
    } else {
      state.input[filter] = [];
    }

    //sort filters
    state.input[filter].sort((a, b) => {
      return (
        state.indexes[filter].findIndex(x => a == x.key) -
        state.indexes[filter].findIndex(x => b == x.key)
      );
    });

    //pass it up to app controller
    setAppState('input', state.input);
  };

  //set search mode dropdown
  const setMode = (e, mode) => {
    e.preventDefault();
    if (mode == 'me') {
      //clear search value
      state.input.search = '';
    } else {
      //focus after waiting for disabled to clear
      setTimeout(() => {
        searchInput.current.focus();
      }, 100);
    }
    state.input.mode = mode;
    setAppState('input', state.input);
  };

  //toggle list/map view
  const setView = (e, view) => {
    e.preventDefault();
    state.input.view = view;
    setAppState('input', state.input);
  };

  //decide whether to show filter
  const canShowFilter = filter => {
    if (!state.capabilities[filter]) return false;
    if (filter == 'region' && state.input.mode == 'me') return false;
    if (filter == 'distance' && state.input.mode == 'search') return false;
    return true;
  };

  return (
    <div className="row d-print-none controls">
      <div className="col-sm-6 col-lg mb-3">
        <form className="input-group" onSubmit={locationSearch}>
          <input
            type="search"
            className="form-control"
            onChange={keywordSearch}
            value={search}
            ref={searchInput}
            placeholder={strings.modes[state.input.mode]}
            disabled={state.input.mode == 'me'}
            spellCheck="false"
          />
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            onClick={e => setDropdown('search')}
            type="button"
          />
          <div
            className={cx('dropdown-menu dropdown-menu-right', {
              show: dropdown == 'search',
            })}
          >
            {settings.modes.map(x => (
              <a
                key={x}
                className={cx(
                  'dropdown-item d-flex justify-content-between align-items-center',
                  {
                    'active bg-secondary': state.input.mode == x,
                  }
                )}
                href="#"
                onClick={e => setMode(e, x)}
              >
                {strings.modes[x]}
              </a>
            ))}
          </div>
        </form>
      </div>
      {settings.filters.map(
        filter =>
          canShowFilter(filter) && (
            <div className="col-sm-6 col-lg mb-3" key={filter}>
              <Dropdown
                setDropdown={setDropdown}
                filter={filter}
                options={state.indexes[filter]}
                values={state.input[filter]}
                open={dropdown == filter}
                right={filter == 'type' && !state.capabilities.map}
                setFilter={setFilter}
                defaultValue={strings[filter + '_any']}
              />
            </div>
          )
      )}
      {state.capabilities.map && (
        <div className="col-sm-6 col-lg mb-3">
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={cx('btn btn-outline-secondary w-100', {
                active: state.input.view == 'list',
              })}
              onClick={e => setView(e, 'list')}
            >
              {strings.list}
            </button>
            <button
              type="button"
              className={cx('btn btn-outline-secondary w-100', {
                active: state.input.view == 'map',
              })}
              onClick={e => setView(e, 'map')}
            >
              {strings.map}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
