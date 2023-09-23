import { css } from '@emotion/react';

import { gutter, mdAndUp } from './variables';

export const globalCss = css`
  html,
  body {
    min-height: 100vh;
    min-height: -webkit-fill-available;
  }

  :root {
    --background: #fff;
    --border-radius: 4px;
    --focus: #0d6efd40;
    --font-family: system-ui, -apple-system, sans-serif;
    --font-size: 16px;
    --in-person: #146c43;
    --in-progress-background: #faf4e0;
    --in-progress-text: #998a5e;
    --inactive: #b02a37;
    --link: #0d6efd;
    --online: #0a58ca;
    --online-background-image: url(https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=1440&ixid=MnwxfDB8MXxhbGx8fHx8fHx8fHwxNjIyMTIzODkw&ixlib=rb-1.2.1&q=80&utm_campaign=api-credit&utm_medium=referral&utm_source=unsplash_source&w=1920);
    --text: #212529;
  }

  #tsml-ui {
    background-color: var(--background);
    box-sizing: border-box;
    color: var(--text);
    display: flex;
    flex-direction: column;
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: 1.5;
    padding: ${gutter}px;

    a {
      color: var(--link);
      text-decoration: underline;
    }

    a:hover,
    tr:hover a {
      color: color-mix(in srgb, var(--text) 40%, var(--link));
      text-decoration: underline;
    }

    button,
    input {
      background-image: none !important;
      text-shadow: none !important;
    }

    h1,
    h2 {
      line-height: 1.2;
      margin: 0;
    }

    h1 {
      font-size: calc(var(--font-size) * 2);
      font-weight: 300;
      @media ${mdAndUp} {
        font-size: calc(var(--font-size) * 2.5);
      }
    }

    h2 {
      font-weight: 500;
      font-size: calc(var(--font-size) * 1.25);
    }
  }
`;
