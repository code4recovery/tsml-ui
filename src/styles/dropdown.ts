import { css } from '@emotion/react';

import { medium, light } from './variables';

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
