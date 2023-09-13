import { css, keyframes } from '@emotion/react';

const animateSpinner = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;
const light = `color-mix(in srgb, var(--background), var(--text) 5%)`;
const medium = `color-mix(in srgb, var(--background), var(--text) 15%)`;
const dark = `color-mix(in srgb, var(--background), var(--text) 55%)`;
const mdAndUp = '(min-width: 768px)';
const lgAndUp = '(min-width: 992px)';

export const chiclets = css`
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
`;

export const chiclet = (type: 'in-person' | 'online' | 'inactive') => css`
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

export const controls = css`
  display: grid;
  gap: var(--gutter);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 0 var(--gutter);

  @media ${lgAndUp} {
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
  }

  fieldset {
    border: 0;
    padding: 0;
  }

  [role='group'] {
    display: flex;
    > * {
      align-items: center;
      display: flex;
      justify-content: center;
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
    > button {
      padding: 0 !important;
    }
  }
`;

export const dropdown = css`
  position: relative;
  > div {
    background-color: var(--background);
    border-radius: var(--border-radius);
    border: 1px solid ${medium};
    left: 0;
    margin-top: 4px;
    min-width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 1;

    hr {
      background-color: ${medium};
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
        background-color: ${light};
        border-radius: var(--border-radius);
        color: var(--text) !important;
        font-weight: bold;
        font-size: 75%;
        padding: 0.125rem 0.25rem;
      }

      &:not(.active):hover {
        background-color: ${light} !important;
        color: var(--text) !important;
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
    --background: #fff;
    --border-radius: 0.25rem;
    --border: #6c757d;
    --focus: #0d6efd40;
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size: 1rem;
    --gutter: 1rem;
    --in-person: #146c43;
    --in-progress: #664d03;
    --inactive: #b02a37;
    --link: #0d6efd;
    --online: #0a58ca;
    --text-muted: #6c757d;
    --text: #212529;
  }

  #tsml-ui {
    background-color: var(--background);
    color: var(--text);
    display: flex;
    flex-direction: column;
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: 1.5;

    a {
      color: var(--link);
    }

    button,
    input {
      background-color: transparent;
      border-radius: var(--border-radius);
      border: 1px solid ${dark};
      color: var(--text);
      cursor: pointer;
      font-size: var(--font-size);
      padding: calc(var(--gutter) / 2) var(--gutter);
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
        border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
      white-space: nowrap;
      width: 100%;

      &:focus {
        box-shadow: 0 0 0 0.25rem var(--focus);
      }

      &:hover,
      &.active {
        background-color: ${dark};
        color: var(--background);
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

export const inProgressCss = css`
  button {
    color: var(--in-progress) !important;
    border: 0 !important;
    background-color: transparent !important;
    border-radius: 0 !important;
    text-decoration: underline;
    &:focus {
      box-shadow: none !important;
    }
  }
  tr {
    background-color: color-mix(
      in srgb,
      var(--in-progress),
      var(--background) 50%
    ) !important;
    &:nth-of-type(2n + 1) {
      background-color: color-mix(
        in srgb,
        var(--in-progress),
        var(--background) 75%
      ) !important;
    }
  }
`;

export const loading = css`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;

  > div {
    display: inline-block;
    height: 5rem;
    position: relative;
    width: 5rem;
    div {
      animation: ${animateSpinner} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: ${dark} transparent transparent transparent;
      border-radius: 50%;
      border-style: solid;
      border-width: 0.34rem;
      box-sizing: border-box;
      display: block;
      height: 4rem;
      margin: 0.66rem;
      position: absolute;
      width: 4rem;
      &:nth-child(1) {
        animation-delay: -0.45s;
      }
      &:nth-child(2) {
        animation-delay: -0.3s;
      }
      &:nth-child(3) {
        animation-delay: -0.15s;
      }
    }
  }
`;

export const table = css`
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
      background-color: ${light};
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
