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
  margin: 0 ${gutter * -1}px ${gutter * -1}px;
  table-layout: auto;
  width: calc(100% + ${gutter * 2}px);

  small {
    margin-left: 6px;
    color: ${dark};
  }

  td,
  th {
    border: 0;
    margin: 0;
    text-align: left;
    vertical-align: middle;
  }

  td {
    cursor: pointer;
    display: block;
    padding: 0 ${gutter / 2}px 0 96px;
    &.tsml-time,
    &.tsml-distance {
      padding-left: ${gutter / 2}px;
      position: absolute;
    }
    &.tsml-distance {
      font-size: calc(var(--font-size) * 1.25);
      top: 56px;
    }
    @media ${mdAndUp} {
      border-bottom: 1px solid ${medium};
      display: table-cell;
      padding: ${gutter / 2}px;
      position: static !important;
      &.tsml-time,
      &.tsml-distance {
        padding-left: ${gutter}px;
      }
      &:last-of-type {
        padding-right: ${gutter}px;
      }
    }
  }

  th {
    border-bottom: 1px solid ${medium};
    font-size: var(--font-size);
    font-weight: 600;
    padding: 0 ${gutter / 2}px ${gutter / 2}px;
    text-transform: none;
    &:first-of-type {
      padding-left: ${gutter}px;
    }
    &:last-of-type {
      padding-right: ${gutter}px;
    }
  }

  thead {
    display: none;
    @media ${mdAndUp} {
      display: table-header-group;
    }
  }

  tr {
    border: 0;
    border-top: 1px solid ${medium};
    display: block;
    padding: ${gutter / 2}px ${gutter / 2}px;
    position: relative;
    @media ${mdAndUp} {
      display: table-row;
      padding: 0;
    }
  }

  tbody tr:nth-of-type(2n + 1) {
    background-color: color-mix(in srgb, currentColor 3%, transparent);
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
  tr {
    background-color: var(--alert-background) !important;
    padding: 0 !important;
  }

  td[colspan] {
    padding: 0 !important;
    position: static;
  }

  button {
    background-color: transparent;
    border-radius: 0;
    border: 0;
    color: var(--alert-text);
    cursor: pointer;
    font-size: var(--font-size);
    padding: ${gutter * 1.25}px;
    width: 100%;
    &:focus {
      box-shadow: none;
    }
    &:hover {
      background-color: transparent;
      color: color-mix(in srgb, var(--text) 40%, var(--alert-text));
      text-decoration: underline;
    }
  }
`;
