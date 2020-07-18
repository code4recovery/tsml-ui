import React from 'react';
import cx from 'classnames/bind';

export default function Button({ href, icon, text, className = [] }) {
  return (
    <a
      className={cx(
        'btn btn-outline-secondary btn-block d-flex align-items-center justify-content-center',
        className
      )}
      href={href}
      target="_blank"
    >
      {svg(icon)}
      {text}
    </a>
  );
}

function svg(icon) {
  if (icon == 'directions') {
    return (
      <svg
        width={22}
        height={22}
        viewBox="0 0 16 16"
        className="bi bi-arrow-90deg-right mr-2"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M9.896 2.396a.5.5 0 0 0 0 .708l2.647 2.646-2.647 2.646a.5.5 0 1 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"
        />
        <path
          fillRule="evenodd"
          d="M13.25 5.75a.5.5 0 0 0-.5-.5h-6.5a2.5 2.5 0 0 0-2.5 2.5v5.5a.5.5 0 0 0 1 0v-5.5a1.5 1.5 0 0 1 1.5-1.5h6.5a.5.5 0 0 0 .5-.5z"
        />
      </svg>
    );
  }
}
