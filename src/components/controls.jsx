import React, { Component } from 'react';
import qs from 'query-string';
import cx from 'classnames/bind';
import Dropdown from './dropdown';
import { settings, strings } from '../settings';

export default class Controls extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdown: null,
      geocoding: false,
      search: props.state.input.search,
    };
    this.searchInput = React.createRef();
    this.closeDropdown = this.closeDropdown.bind(this);
    this.keywordSearch = this.keywordSearch.bind(this);
    this.locationSearch = this.locationSearch.bind(this);
    this.setDropdown = this.setDropdown.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }

  //add click listener for dropdowns (in lieu of including bootstrap js + jquery)
  componentDidMount() {
    document.body.addEventListener('click', this.closeDropdown);
  }

  //remove click listener for dropdowns (in lieu of including bootstrap js + jquery)
  componentWillUnmount() {
    document.body.removeEventListener('click', this.closeDropdown);
  }

  //close current dropdown (on body click)
  closeDropdown(e) {
    if (e.srcElement.classList.contains('dropdown-toggle')) return;
    this.setDropdown(null);
  }

  //keyword search
  keywordSearch(e) {
    this.state.search = e.target.value;
    if (this.props.state.input.mode === 'search') {
      this.props.state.input.search = e.target.value;
      this.props.setAppState('input', this.props.state.input);
    } else {
      this.setState({ search: this.state.search });
    }
  }

  locationSearch(e) {
    e.preventDefault();

    //make mapbox API request https://docs.mapbox.com/api/search/
    const geocodingAPI =
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      encodeURIComponent(this.searchInput.current.value) +
      '.json?' +
      qs.stringify({
        access_token: settings.keys.mapbox,
        autocomplete: false,
        //bbox: ,
        language: settings.language,
      });

    fetch(geocodingAPI)
      .then(result => {
        return result.json();
      })
      .then(result => {
        if (result.features && result.features.length) {
          //re-render page with new params
          this.props.state.input.search = this.searchInput.current.value;
          this.props.state.input.center = result.features[0].center.join(',');
          this.props.setAppState('input', this.props.state.input);
        } else {
          //show error
        }
      });
  }

  //open or close dropdown
  setDropdown(which) {
    this.setState({
      dropdown: this.state.dropdown == which ? null : which,
    });
  }

  //set filter: pass it up to parent
  setFilter(e, filter, value) {
    e.preventDefault();
    e.stopPropagation();

    //add or remove from filters
    if (value) {
      if (e.metaKey) {
        const index = this.props.state.input[filter].indexOf(value);
        if (index == -1) {
          this.props.state.input[filter].push(value);
        } else {
          this.props.state.input[filter].splice(index, 1);
        }
      } else {
        this.props.state.input[filter] = [value];
      }
    } else {
      this.props.state.input[filter] = [];
    }

    //sort filters
    this.props.state.input[filter].sort((a, b) => {
      return (
        this.props.state.indexes[filter].findIndex(x => a == x.key) -
        this.props.state.indexes[filter].findIndex(x => b == x.key)
      );
    });

    //pass it up to app controller
    this.props.setAppState('input', this.props.state.input);
  }

  //set search mode dropdown
  setMode(e, mode) {
    e.preventDefault();
    if (mode == 'me') {
      //clear search value
      this.props.state.input.search = '';
    } else {
      //focus after waiting for disabled to clear
      setTimeout(
        function() {
          this.searchInput.current.focus();
        }.bind(this),
        100
      );
    }
    this.props.state.input.mode = mode;
    this.props.setAppState('input', this.props.state.input);
  }

  //toggle list/map view
  setView(e, view) {
    e.preventDefault();
    this.props.state.input.view = view;
    this.props.setAppState('input', this.props.state.input);
  }

  render() {
    return (
      <div className="row d-print-none">
        <div className="col-sm-6 col-lg">
          <form className="input-group mb-3" onSubmit={this.locationSearch}>
            <input
              type="search"
              className="form-control"
              onChange={this.keywordSearch}
              value={this.state.search}
              ref={this.searchInput}
              placeholder={strings.modes[this.props.state.input.mode]}
              disabled={this.props.state.input.mode === 'me'}
              spellCheck="false"
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                onClick={e => this.setDropdown('search')}
                type="button"
              />
              <div
                className={cx('dropdown-menu dropdown-menu-right', {
                  show: this.state.dropdown == 'search',
                })}
              >
                {settings.modes.map(x => (
                  <a
                    key={x}
                    className={cx(
                      'dropdown-item d-flex justify-content-between align-items-center',
                      {
                        'active bg-secondary': this.props.state.input.mode == x,
                      }
                    )}
                    href="#"
                    onClick={e => this.setMode(e, x)}
                  >
                    {strings.modes[x]}
                  </a>
                ))}
              </div>
            </div>
          </form>
        </div>
        {settings.filters.map(filter => (
          <div
            className={cx('col-sm-6 col-lg mb-3', {
              'd-none': !this.props.state.capabilities[filter],
            })}
            key={filter}
          >
            <Dropdown
              setDropdown={this.setDropdown}
              filter={filter}
              options={this.props.state.indexes[filter]}
              values={this.props.state.input[filter]}
              open={this.state.dropdown === filter}
              right={filter === 'type' && !this.props.state.capabilities.map}
              setFilter={this.setFilter}
              default={strings[filter + '_any']}
            ></Dropdown>
          </div>
        ))}
        <div
          className={cx('col-sm-6 col-lg mb-3', {
            'd-none': !this.props.state.capabilities.map,
          })}
        >
          <div className="btn-group w-100" role="group">
            <button
              type="button"
              className={cx('btn btn-outline-secondary w-100', {
                active: this.props.state.input.view == 'list',
              })}
              onClick={e => this.setView(e, 'list')}
            >
              {strings.list}
            </button>
            <button
              type="button"
              className={cx('btn btn-outline-secondary w-100', {
                active: this.props.state.input.view == 'map',
              })}
              onClick={e => this.setView(e, 'map')}
            >
              {strings.map}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
