import React from 'react';
import cx from 'classnames/bind';

import Icon from './Icon';

export default function Button({
  href,
  icon,
  small = false,
  text,
  className,
  onClick,
}) {
  return (
    <a
      className={cx(
        'align-items-center btn btn-outline-secondary justify-content-center',
        {
          'd-flex overflow-hidden': !small,
          'btn-sm d-inline-flex': small,
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
