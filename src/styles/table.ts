import { css } from '@emotion/react';

import { dark, gutter, mdAndUp, medium, lgAndUp } from './variables';

export const tableChicletsCss = css`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

export const tableChicletCss = (
  type: 'in-person' | 'online' | 'inactive'
) => css`
  align-items: center;
  background-color: ${type === 'in-person'
    ? 'color-mix(in srgb, var(--in-person), var(--background) 82%);'
    : type === 'online'
    ? 'color-mix(in srgb, var(--online), var(--background) 82%);'
    : 'color-mix(in srgb, var(--inactive), var(--background) 82%);'};
  border-radius: var(--border-radius);
  color: ${type === 'in-person'
    ? 'var(--in-person)'
    : type === 'online'
    ? 'var(--online)'
    : 'var(--inactive)'};
  display: inline-flex;
  font-size: calc(var(--font-size) * 0.875);
  gap: 4px;
  justify-content: center;
  padding: 4px 8px;
`;

export const tableCss = css`
  border: 0 !important;
  border-spacing: 0;
  margin: 0 ${gutter * -1}px !important;
  table-layout: auto;
  width: calc(100% + ${gutter * 2}px) !important;

  small {
    margin-left: 8px;
    color: ${dark};
  }

  td,
  th {
    border: 0 !important;
    border-bottom: 1px solid ${medium} !important;
    margin: 0;
    padding: ${gutter / 2}px !important;
    text-align: left;
    vertical-align: middle;
    &:first-of-type {
      padding-left: ${gutter}px !important;
    }
    &:last-of-type {
      padding-right: ${gutter}px !important;
    }
  }

  td {
    cursor: pointer;
    display: block;
    @media ${mdAndUp} {
      display: table-cell;
    }
  }

  th {
    font-size: var(--font-size) !important;
    font-weight: 500 !important;
    text-transform: none !important;
  }

  thead {
    display: none;
    @media ${mdAndUp} {
      display: table-header-group;
    }
  }

  tbody tr {
    &:nth-of-type(2n) {
      background-color: color-mix(in srgb, currentColor 3%, transparent);
    }
  }

  time {
    display: flex;
    flex-direction: column;
    span {
      white-space: nowrap;
      &:first-of-type {
        text-transform: lowercase;
      }
    }
    @media ${lgAndUp} {
      flex-direction: row;
      gap: 8px;
    }
  }
`;

export const tableInProgressCss = css`
  background-color: var(--in-progress-background);

  td[colspan] {
    padding: 0 !important;
  }

  button {
    background-color: transparent;
    border-radius: 0;
    border: 0;
    color: var(--in-progress-text);
    cursor: pointer;
    font-size: var(--font-size);
    padding: ${gutter}px;
    width: 100%;
    &:focus {
      box-shadow: none !important;
    }
    &:hover {
      background-color: transparent !important;
      color: color-mix(in srgb, var(--text) 40%, var(--in-progress-text));
      text-decoration: underline;
    }
  }
`;
