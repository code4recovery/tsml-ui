import React from 'react';
import cx from 'classnames/bind';

import Icon from './Icon';

export default function Button({
  block = true,
  href,
  icon,
  small = false,
  text,
  className,
}) {
  return (
    <a
      className={cx(
        'align-items-center btn btn-outline-secondary d-flex justify-content-center',
        { 'btn-block overflow-hidden': block, 'btn-sm': small },
        className
      )}
      href={href}
      target="_blank"
    >
      {icon && <Icon icon={icon} className="me-2" />}
      <div className="text-truncate">{text}</div>
    </a>
  );
}
