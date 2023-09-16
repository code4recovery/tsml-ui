import { css } from '@emotion/react';

import { mdAndUp, lgAndUp, medium } from './variables';

export const tableChicletsCss = css`
  display: flex;
  gap: 0.25rem;
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
  font-size: 0.875rem;
  gap: 0.25rem;
  justify-content: center;
  padding: 0.25rem 0.5rem;
`;

export const tableCss = css`
  border-spacing: 0;
  table-layout: auto;
  width: 100%;

  td {
    cursor: pointer;
    display: block;
    @media ${mdAndUp} {
      display: table-cell;
    }
  }

  td,
  th {
    border-bottom: 1px solid ${medium};
    margin: 0;
    padding: calc(var(--gutter) / 2);
    text-align: left;
    &:first-of-type {
      padding-left: var(--gutter);
    }
    &:last-of-type {
      padding-right: var(--gutter);
    }
  }

  thead {
    display: none;
    @media ${mdAndUp} {
      display: table-header-group;
    }
  }

  tbody tr {
    &:nth-of-type(2n + 1) {
      background-color: #00000009;
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
      gap: 0.5rem;
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
    text-decoration: underline;
    width: 100%;
    &:focus {
      box-shadow: none !important;
    }
  }
`;
