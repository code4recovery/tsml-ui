import { css } from '@emotion/react';

import { dark, mdAndUp, medium, lgAndUp } from './variables';

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
  margin: 0 calc(var(--gutter) * -1);
  table-layout: auto;
  width: calc(100% + var(--gutter) * 2);

  small {
    margin-left: 8px;
    color: ${dark};
  }

  td,
  th {
    border: 0 !important;
    border-bottom: 1px solid ${medium} !important;
    margin: 0;
    padding: calc(var(--gutter) / 2) !important;
    text-align: left;
    vertical-align: middle;
    &:first-of-type {
      padding-left: var(--gutter) !important;
    }
    &:last-of-type {
      padding-right: var(--gutter) !important;
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
    text-transform: none !important;
    font-size: calc(var(--font-size) * 0.875) !important;
    font-weight: normal !important;
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
    &:hover a {
      text-decoration: underline !important;
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
  button {
    background-color: transparent;
    border-radius: 0;
    border: 0;
    color: var(--in-progress-text);
    cursor: pointer;
    font-size: var(--font-size);
    padding: calc(var(--gutter) / 2);
    width: 100%;
    &:focus {
      box-shadow: none !important;
    }
    &:hover {
      text-decoration: underline;
    }
  }
`;
