import { css } from '@emotion/react';

export const controls = css`
  display: flex;
  gap: var(--gutter);
`;

export const global = css`
  html,
  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  :root {
    --bg-color: 255, 255, 255;
    --color: 33, 37, 41;
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size: 1rem;
    --link-color: 0, 123, 255;
    --gutter: 1rem;
  }

  #tsml-ui {
    background-color: var(rgb(--bg-color));
    color: var(rgb(--color));
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: 1.5;
  }
`;

export const table = css`
  border-spacing: 0;
  table-layout: auto;
  width: 100%;

  td {
    border-bottom: 1px solid rgba(var(--color), 0.15);
    margin: 0;
    padding: calc(var(--gutter) / 2);
    &:first-of-type {
      padding-left: var(--gutter);
    }
  }

  tbody tr {
    &:nth-of-type(2n + 1) {
      background-color: rgba(var(--color), 0.05);
    }
  }
`;

export const title = css`
  font-weight: 300;
  font-size: 2.5rem;
  line-height: 1.2;
  margin: 0;
  padding: var(--gutter);
`;
