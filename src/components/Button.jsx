import React from 'react';
import cx from 'classnames/bind';

import Icon from './Icon';

export default function Button({
  className,
  href,
  icon,
  onClick,
  small = false,
  text,
}) {
  return (
    <a
      className={cx(
        'align-items-center btn justify-content-center',
        {
          'd-flex overflow-hidden': !small,
          'btn-sm d-inline-flex': small,
          'btn-outline-secondary cursor-pointer': href || onClick,
        },
        className
      )}
      href={href}
      onClick={onClick}
      target="_blank"
    >
      {icon && (
        <Icon
          icon={icon}
          size={small ? 18 : undefined}
          className={small ? 'me-1' : 'me-2'}
        />
      )}
      {small ? text : <div className="text-truncate">{text}</div>}
    </a>
  );
}
