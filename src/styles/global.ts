import { css } from '@emotion/react';

import { dark, medium } from './variables';

export const globalCss = css`
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
    --in-progress-text: #664d03;
    --in-progress-background: #fffcf0;
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

    h1 {
      font-weight: 300;
      font-size: 2.5rem;
      line-height: 1.2;
      margin: 0;
      padding: var(--gutter);
    }
  }
`;
