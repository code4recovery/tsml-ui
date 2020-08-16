import React from 'react';

export default function Stack({ spacing = 2, className, children }) {
  //clear empty children
  children = children.filter(e => e);
  if (!children.length) return null;
  return (
    !!children.length && (
      <div className={className}>
        {children.map((child, index) => (
          <div
            key={index}
            className={'pb-'.concat(
              index == children.length - 1 ? '0' : spacing.toString()
            )}
          >
            {child}
          </div>
        ))}
      </div>
    )
  );
}
