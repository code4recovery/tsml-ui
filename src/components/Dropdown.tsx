import React, { Fragment } from 'react';

import type { Index, State } from '../types';
import {
  formatClasses as cx,
  formatString as i18n,
  getIndexByKey,
  strings,
} from '../helpers';

type DropdownProps = {
  defaultValue: string;
  end: boolean;
  filter: keyof State['indexes'];
  open: boolean;
  setDropdown: (dropdown?: string) => void;
  setState: (state: State) => void;
  state: State;
};

export default function Dropdown({
  defaultValue,
  end,
  filter,
  open,
  setDropdown,
  setState,
  state,
}: DropdownProps) {
  const options = state.indexes[filter];
  const values = state.input[filter];

  //set filter: pass it up to parent
  const setFilter = (
    e: React.MouseEvent<HTMLButtonElement>,
    filter: keyof typeof state.indexes,
    value?: string
  ) => {
    e.preventDefault();

    //add or remove from filters
    if (value) {
      if (e.metaKey) {
        // @ts-expect-error TODO
        const index = state.input[filter].indexOf(value);
        if (index === -1) {
          // @ts-expect-error TODO
          state.input[filter].push(value);
        } else {
          state.input[filter].splice(index, 1);
        }
      } else {
        // @ts-expect-error TODO
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

  const renderDropdownItem = ({ key, name, slugs, children }: Index) => (
    <Fragment key={key}>
      <button
        className={cx(
          'align-items-center d-flex dropdown-item justify-content-between',
          {
            // @ts-expect-error TODO
            'bg-secondary text-white': values.includes(key),
          }
        )}
        onClick={e => setFilter(e, filter, key)}
      >
        <span>{name}</span>
        <span
          aria-label={
            slugs.length === 1
              ? strings.match_single
              : i18n(strings.match_multiple, {
                  count: slugs.length,
                })
          }
          className="badge bg-light border ms-3 text-dark"
        >
          {slugs.length}
        </span>
      </button>
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
        aria-expanded={open}
        className="btn btn-outline-secondary dropdown-toggle w-100"
        id={filter}
        onClick={() => setDropdown(open ? undefined : filter)}
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
        <button
          className={cx('dropdown-item', {
            'active bg-secondary text-white': !values.length,
          })}
          onClick={e => setFilter(e, filter, undefined)}
        >
          {defaultValue}
        </button>
        {[
          options
            ?.filter(option =>
              special[filter as keyof typeof special]?.includes(option.key)
            )
            .sort(
              (a, b) =>
                special[filter as keyof typeof special]?.indexOf(a.key) -
                special[filter as keyof typeof special]?.indexOf(b.key)
            ),
          options?.filter(
            option =>
              !special[filter as keyof typeof special]?.includes(option.key)
          ),
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
