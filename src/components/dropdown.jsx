import React from 'react';
import cx from 'classnames/bind';

export default function Dropdown(props) {
  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary w-100 dropdown-toggle"
        onClick={e => props.setDropdown(props.filter)}
      >
        {props.values.length && props.options.length
          ? props.values
              .map(x => {
                const value = props.options.find(y => y.key == x);
                return value ? value.name : '';
              })
              .join(' + ')
          : props.default}
      </button>
      <div
        className={cx('dropdown-menu', {
          show: props.open,
          'dropdown-menu-right': props.right,
        })}
      >
        <a
          className={cx('dropdown-item', {
            'active bg-secondary': !props.values.length,
          })}
          onClick={e => props.setFilter(e, props.filter, null)}
          href="#"
        >
          {props.default}
        </a>
        <div className="dropdown-divider" />
        {props.options.map(x => (
          <a
            key={x.key}
            className={cx(
              'dropdown-item d-flex justify-content-between align-items-center',
              {
                'active bg-secondary': props.values.indexOf(x.key) !== -1,
              }
            )}
            href="#"
            onClick={e => props.setFilter(e, props.filter, x.key)}
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
