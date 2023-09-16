import { css } from '@emotion/react';

import { dark, medium } from './variables';
import { dropdownButtonCss } from './button';

export const dropdownCss = css`
  position: relative;
  > div {
    background-color: var(--background);
    border-radius: var(--border-radius);
    border: 1px solid ${medium};
    margin-top: 0.25rem;
    min-width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 1;

    hr {
      background-color: ${medium};
      border: 0;
      height: 1px;
      margin: 0;
    }

    button {
      align-items: center;
      background-color: transparent;
      border-radius: 0;
      border: 0;
      color: var(--text);
      cursor: pointer;
      display: flex;
      font-size: var(--font-size);
      gap: 1rem;
      justify-content: space-between;
      padding: calc(var(--gutter) / 2) var(--gutter);
      text-align: left;
      width: 100%;

      span {
        background-color: ${medium};
        border-radius: var(--border-radius);
        color: var(--text);
        font-weight: bold;
        font-size: 75%;
        padding: 0.125rem 0.25rem;
      }

      &[data-active='true'] {
        background-color: ${dark};
        color: var(--background);
      }

      &[data-active='false']:hover {
        background-color: ${medium};
        color: var(--text);
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

export const dropdownButtonLastCss = css`
  ${dropdownButtonCss}
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: -1px;
`;
