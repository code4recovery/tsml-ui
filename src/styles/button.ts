import { css } from '@emotion/react';

import { color, size } from './variables';

export const formControlCss = css`
  align-items: center;
  background-color: transparent !important;
  border-radius: var(--border-radius) !important;
  border: 1px solid ${color.dark} !important;
  color: var(--text) !important;
  cursor: pointer;
  display: flex;
  font-family: var(--font-family) !important;
  font-size: var(--font-size) !important;
  gap: ${size.gutter / 2}px;
  height: auto !important;
  justify-content: center;
  line-height: 1.5 !important;
  margin: 0 !important;
  min-height: auto;
  padding: ${size.gutter / 2.66666}px ${size.gutter / 2}px !important;
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
    background-color: ${color.dark} !important;
    color: var(--background) !important;
  }
`;

export const buttonDirectionsCss = css`
  ${buttonCss}
  background-color: color-mix(in srgb, var(--in-person), var(--background) 82%) !important;
  border-color: color-mix(
    in srgb,
    var(--in-person),
    var(--background) 70%
  ) !important;
  color: var(--in-person) !important;
  &:hover {
    background-color: var(--in-person) !important;
    color: var(--background) !important;
  }
`;

export const buttonHelpCss = css`
  color: ${color.dark};
  display: grid;
  font-size: var(--font-size);
  gap: ${size.gutter / 3}px;
`;

export const buttonJoinCss = css`
  ${buttonCss}
  background-color: color-mix(in srgb, var(--online), var(--background) 82%) !important;
  border-color: color-mix(
    in srgb,
    var(--online),
    var(--background) 70%
  ) !important;
  color: var(--online) !important;
  &:hover {
    background-color: var(--online) !important;
    color: var(--background) !important;
  }
`;

export const calendarMenuCss = css`
  position: relative;
  display: inline-block;
  width: 100%;
`;

export const dropdownItemCss = css`
  align-items: center;
  background-color: transparent;
  border-radius: 0;
  border: 0;
  color: var(--text) !important;
  cursor: pointer !important;
  display: flex;
  flex: auto;
  font-size: var(--font-size);
  gap: 16px;
  justify-content: space-between;
  line-height: 1.5;
  margin: 0;
  padding: ${size.gutter / 2}px ${size.gutter}px;
  text-align: left;
  text-decoration: none !important;
  width: 100%;
`;

export const calendarDropdownCss = css`
  background: var(--background);
  border-radius: var(--border-radius);
  border: 1px solid ${color.medium};
  display: none;
  left: 0;
  min-width: 100%;
  position: absolute;
  top: calc(100% + 2px);
  z-index: 10;

  &[data-open='true'] {
    display: block;
  }

  a,
  button {
    ${dropdownItemCss}
    &:hover {
      background-color: ${color.medium} !important;
    }
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
  &[disabled] {
    color: var(--background) !important;
    cursor: not-allowed;
    pointer-events: none;
  }
`;
