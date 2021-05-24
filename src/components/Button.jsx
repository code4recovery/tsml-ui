import React from 'react';
import cx from 'classnames/bind';

import Icon from './Icon';

export default function Button({
  href,
  icon,
  text,
  className = [],
  block = true,
}) {
  return (
    <a
      className={cx(
        'align-items-center btn btn-outline-secondary d-flex justify-content-center',
        { 'btn-block': block },
        className
      )}
      href={href}
      target="_blank"
    >
      {icon && <Icon icon={icon} className="me-2" />}
      {text}
    </a>
  );
}
