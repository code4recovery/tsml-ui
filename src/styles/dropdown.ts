import { css } from '@emotion/react';

import { color, size } from './variables';
import { dropdownButtonCss } from './button';

export const dropdownCss = css`
  position: relative;
  > div {
    background-color: var(--background);
    border-radius: var(--border-radius);
    border: 1px solid ${color.medium};
    margin-top: 4px;
    min-width: 100%;
    overflow: hidden;
    position: absolute;
    z-index: 1;

    hr {
      background-color: ${color.medium};
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
      gap: 16px;
      justify-content: space-between;
      margin: 0;
      padding: ${size.gutter / 2}px ${size.gutter}px;
      text-align: left;
      width: 100%;

      span {
        background-color: ${color.medium};
        border-radius: var(--border-radius);
        color: var(--text);
        font-weight: bold;
        font-size: 75%;
        padding: 2px 4px;
      }

      &[data-active='true'] {
        background-color: ${color.dark};
        color: var(--background);
      }

      &[data-active='false']:hover {
        background-color: ${color.medium};
        color: var(--text);
      }
    }

    div button {
      padding-left: 32px !important;
    }

    div div button {
      padding-left: 48px !important;
    }

    div div div button {
      padding-left: 64px !important;
    }
  }
`;

export const dropdownButtonLastCss = css`
  ${dropdownButtonCss}
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: -1px !important;
`;
