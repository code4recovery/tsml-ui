import React, { Fragment } from 'react';
import cx from 'classnames/bind';

import { getIndexByKey } from '../helpers';

export default function Dropdown({
  filter,
  options,
  open,
  right,
  values,
  defaultValue,
  setDropdown,
  setFilter,
}) {
  const renderDropdownItem = x => {
    return (
      <Fragment key={x.key}>
        <a
          className={cx(
            'dropdown-item d-flex justify-content-between align-items-center',
            {
              'active bg-secondary': values.indexOf(x.key) !== -1,
            }
          )}
          href="#"
          onClick={e => setFilter(e, filter, x.key)}
        >
          <span>{x.name}</span>
          <span className="badge bg-light border ml-3 text-dark">
            {x.slugs.length}
          </span>
        </a>
        {!!x.children?.length && (
          <div className="children">
            {x.children.map(child => renderDropdownItem(child))}
          </div>
        )}
      </Fragment>
    );
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary w-100 dropdown-toggle"
        onClick={() => setDropdown(open ? null : filter)}
      >
        {values.length && options.length
          ? values
              .map(x => {
                const value = getIndexByKey(options, x);
                return value?.name;
              })
              .join(' + ')
          : defaultValue}
      </button>
      <div
        className={cx('dropdown-menu', {
          show: open,
          'dropdown-menu-right': right,
        })}
      >
        <a
          className={cx('dropdown-item', {
            'active bg-secondary': !values.length,
          })}
          onClick={e => setFilter(e, filter, null)}
          href="#"
        >
          {defaultValue}
        </a>
        <div className="dropdown-divider" />
        {options.map(x => renderDropdownItem(x))}
      </div>
    </div>
  );
}
