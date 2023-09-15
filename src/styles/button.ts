import { css } from '@emotion/react';

import { dark } from './variables';

export const formControlCss = css`
  background-color: transparent;
  border-radius: var(--border-radius);
  border: 1px solid ${dark};
  color: var(--text);
  cursor: pointer;
  font-size: var(--font-size);
  padding: calc(var(--gutter) / 2) var(--gutter);
  transition: all 0.15s ease-in-out;
  width: 100%;
  &:focus {
    box-shadow: 0 0 0 0.25rem var(--focus);
  }
`;

export const buttonCss = css`
  ${formControlCss}
  overflow: hidden;
  user-select: none;
  white-space: nowrap;

  :hover,
  &[data-active='true'] {
    background-color: ${dark};
    color: var(--background);
  }
`;

export const dropdownButtonCss = css`
  ${buttonCss}
  ::after {
    border-bottom: 0;
    border-left: 0.3em solid transparent;
    border-right: 0.3em solid transparent;
    border-top: 0.3em solid;
    content: '';
    display: inline-block;
    margin-left: 0.255em;
    vertical-align: 0.255em;
  }
  :empty::after {
    margin-left: 0;
  }
`;
