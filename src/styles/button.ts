import { css } from '@emotion/react';

import { color, size } from './variables';

export const formControlCss = css`
  align-items: center;
  background-color: transparent;
  border-radius: var(--border-radius);
  border: 1px solid ${color.dark};
  box-sizing: border-box;
  color: var(--text) !important;
  cursor: pointer;
  display: flex;
  font-size: var(--font-size);
  gap: ${size.gutter / 2}px;
  justify-content: center;
  line-height: var(--line-height);
  padding: ${size.gutter / 2.66666}px ${size.gutter}px !important;
  text-decoration: none !important;
  transition: all 0.15s ease-in-out;
  width: 100%;
  &:focus {
    box-shadow: 0 0 0 4px var(--focus);
  }
`;

export const buttonCss = css`
  ${formControlCss}
  color: ${color.dark} !important;
  overflow: hidden;
  user-select: none;
  white-space: nowrap;

  svg {
    display: block;
  }

  :hover,
  &[data-active='true'] {
    background-color: ${color.dark};
    color: var(--background) !important;
  }
`;

export const buttonDirectionsCss = css`
  ${buttonCss}
  background-color: color-mix(in srgb, var(--in-person), var(--background) 82%);
  border-color: color-mix(in srgb, var(--in-person), var(--background) 70%);
  color: var(--in-person) !important;
  &:hover {
    background-color: var(--in-person) !important;
    color: var(--background) !important;
  }
`;

export const buttonJoinCss = css`
  ${buttonCss}
  background-color: color-mix(in srgb, var(--online), var(--background) 82%);
  border-color: color-mix(in srgb, var(--online), var(--background) 70%);
  color: var(--online) !important;
  &:hover {
    background-color: var(--online) !important;
    color: var(--background) !important;
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
    vertical-align: 0.255em;
  }
`;
