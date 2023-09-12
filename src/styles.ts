import { css } from '@emotion/react';

const borderRadius = '0.25rem';
const lgAndUp = '(min-width: 992px)';

export const controls = css`
  display: grid;
  gap: var(--gutter);
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  padding: 0 var(--gutter);

  fieldset {
    border: 0;
    padding: 0;
  }

  [role='group'] {
    display: flex;
    > * {
      &:not(:first-child) {
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
        margin-left: -1px;
      }
      &:not(:last-child) {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
      }
    }
  }
`;

export const dropdown = css`
  position: relative;
  > div {
    background-color: rgb(var(--bg-color));
    border-radius: ${borderRadius};
    border: 1px solid rgba(var(--color), 0.15);
    left: 0;
    margin-top: 4px;
    min-width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 1;

    hr {
      background-color: rgba(var(--border-color), 0.5);
      height: 1px;
      border: 0;
      margin: 0.5rem 0;
    }

    button {
      align-items: center;
      border-radius: 0 !important;
      border: 0 !important;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      text-align: left;

      span {
        background-color: rgba(var(--border-color), 0.125);
        border-radius: ${borderRadius};
        font-weight: bold;
        font-size: 75%;
        padding: 0.125rem 0.25rem;
      }
    }

    .children button {
      padding-left: 2rem !important;
    }

    .children .children button {
      padding-left: 3rem !important;
    }

    .children .children .children button {
      padding-left: 4rem !important;
    }
  }
`;

export const global = css`
  html,
  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  :root {
    --bg-color: 255, 255, 255;
    --border-color: 108, 117, 125;
    --color: 33, 37, 41;
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size: 1rem;
    --link-color: 0, 123, 255;
    --gutter: 1rem;
  }

  #tsml-ui {
    background-color: rgb(var(--bg-color));
    color: rgb(var(--color));
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: 1.5;

    a {
      color: rgb(var(--link-color));
    }

    button,
    input {
      background-color: transparent;
      border-radius: ${borderRadius};
      border: 1px solid rgb(var(--border-color));
      color: rgb(var(--color));
      cursor: pointer;
      font-size: var(--font-size);
      padding: calc(var(--gutter) / 2) var(--gutter);
      white-space: nowrap;
      width: 100%;

      &:focus {
        box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
      }

      &:hover {
        background-color: rgba(var(--border-color), 0.15);
      }

      &.active {
        background-color: rgb(var(--border-color));
        color: rgb(var(--bg-color));
      }
    }

    button {
      overflow: hidden;
      user-select: none;
      &.dropdown-toggle::after {
        border-bottom: 0;
        border-left: 0.3em solid transparent;
        border-right: 0.3em solid transparent;
        border-top: 0.3em solid;
        content: '';
        display: inline-block;
        margin-left: 0.255em;
        vertical-align: 0.255em;
      }
    }

    h1 {
      font-weight: 300;
      font-size: 2.5rem;
      line-height: 1.2;
      margin: 0;
      padding: var(--gutter);
    }
  }
`;

export const table = css`
  border-spacing: 0;
  table-layout: auto;
  width: 100%;

  td,
  th {
    border-bottom: 1px solid rgba(var(--color), 0.15);
    margin: 0;
    padding: calc(var(--gutter) / 2);
    text-align: left;
    &:first-of-type {
      padding-left: var(--gutter);
    }
  }

  tbody tr {
    &:nth-of-type(2n + 1) {
      background-color: rgba(var(--color), 0.05);
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
