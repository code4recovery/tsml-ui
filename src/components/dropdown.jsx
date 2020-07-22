import React from 'react';
import cx from 'classnames/bind';

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
  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary w-100 dropdown-toggle"
        onClick={() => setDropdown(open ? null : filter)}
      >
        {values.length && options.length
          ? values
              .map(x => {
                const value = options.find(y => y.key == x);
                return value ? value.name : '';
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
        {options.map(x => (
          <a
            key={x.key}
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
            <span className="badge bg-light text-dark ml-3">
              {x.slugs.length}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
