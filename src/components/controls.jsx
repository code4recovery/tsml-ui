import React, { Component } from 'react';
import qs from 'query-string';
import cx from 'classnames/bind';

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
          console.log(result.features[0].center.join(','));
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
            <div className="dropdown">
              <button
                className="btn btn-outline-secondary w-100 dropdown-toggle"
                onClick={e => this.setDropdown(filter)}
              >
                {this.props.state.input[filter].length &&
                this.props.state.indexes[filter].length
                  ? this.props.state.input[filter]
                      .map(x => {
                        const value = this.props.state.indexes[filter].find(
                          y => y.key == x
                        );
                        return value ? value.name : '';
                      })
                      .join(' + ')
                  : strings[filter + '_any']}
              </button>
              <div
                className={cx('dropdown-menu', {
                  show: this.state.dropdown == filter,
                  'dropdown-menu-right':
                    filter == 'type' && !this.props.state.capabilities.map,
                })}
              >
                <a
                  className={cx('dropdown-item', {
                    'active bg-secondary': !this.props.state.input[filter]
                      .length,
                  })}
                  onClick={e => this.setFilter(e, filter, null)}
                  href="#"
                >
                  {strings[filter + '_any']}
                </a>
                <div className="dropdown-divider" />
                {this.props.state.indexes[filter].map(x => (
                  <a
                    key={x.key}
                    className={cx(
                      'dropdown-item d-flex justify-content-between align-items-center',
                      {
                        'active bg-secondary':
                          this.props.state.input[filter].indexOf(x.key) !== -1,
                      }
                    )}
                    href="#"
                    onClick={e => this.setFilter(e, filter, x.key)}
                  >
                    <span>{x.name}</span>
                    <span className="badge badge-light ml-3">
                      {x.slugs.length}
                    </span>
                  </a>
                ))}
              </div>
            </div>
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
