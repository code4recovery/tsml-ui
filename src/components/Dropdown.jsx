import React, { Fragment } from 'react';

import { formatClasses as cx, getIndexByKey, formatUrl } from '../helpers';

export default function Dropdown({
  defaultValue,
  end,
  filter,
  open,
  setDropdown,
  setState,
  state,
}) {
  const options = state.indexes[filter];
  const values = state.input[filter];

  //set filter: pass it up to parent
  const setFilter = (e, filter, value) => {
    e.preventDefault();

    //add or remove from filters
    if (value) {
      if (e.metaKey) {
        const index = state.input[filter].indexOf(value);
        if (index === -1) {
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
    state.input[filter].sort(
      (a, b) =>
        state.indexes[filter].findIndex(x => a === x.key) -
        state.indexes[filter].findIndex(x => b === x.key)
    );

    //pass it up to app controller
    setState({ ...state });
  };

  const renderDropdownItem = ({ key, name, slugs, children }) => (
    <Fragment key={key}>
      <a
        className={cx(
          'align-items-center d-flex dropdown-item justify-content-between',
          {
            'bg-secondary text-white': values.includes(key),
          }
        )}
        href={formatUrl({
          ...state.input,
          [filter]: values.includes(key) ? [key] : [],
        })}
        onClick={e => setFilter(e, filter, key)}
      >
        <span>{name}</span>
        <span className="badge bg-light border ms-3 text-dark">
          {slugs.length}
        </span>
      </a>
      {!!children?.length && (
        <div className="children">
          {children.map(child => renderDropdownItem(child))}
        </div>
      )}
    </Fragment>
  );

  //separate section above the other items
  const special = {
    type: ['active', 'in-person', 'online'],
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle w-100"
        onClick={() => setDropdown(open ? null : filter)}
        id={filter}
      >
        {values?.length && options?.length
          ? values.map(value => getIndexByKey(options, value)?.name).join(' + ')
          : defaultValue}
      </button>
      <div
        className={cx('dropdown-menu my-1', {
          show: open,
          'dropdown-menu-end': end,
        })}
        aria-labelledby={filter}
      >
        <a
          className={cx('dropdown-item', {
            'active bg-secondary text-white': !values.length,
          })}
          onClick={e => setFilter(e, filter, null)}
          href={formatUrl({
            ...state.input,
            [filter]: [],
          })}
        >
          {defaultValue}
        </a>
        {[
          options
            ?.filter(option => special[filter]?.includes(option.key))
            .sort(
              (a, b) =>
                special[filter]?.indexOf(a.key) -
                special[filter]?.indexOf(b.key)
            ),
          options?.filter(option => !special[filter]?.includes(option.key)),
        ]
          .filter(e => e.length)
          .map((group, index) => (
            <Fragment key={index}>
              <div className="dropdown-divider" />
              {group.map(option => renderDropdownItem(option))}
            </Fragment>
          ))}
      </div>
    </div>
  );
}
