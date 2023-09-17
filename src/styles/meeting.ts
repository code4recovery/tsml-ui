import { css } from '@emotion/react';

import { dark, mdAndUp, medium } from './variables';

export const meetingBackCss = css`
  align-items: center;
  display: flex;
  margin-bottom: var(--gutter);
`;

export const meetingColumnsCss = css`
  display: flex;
  flex-direction: column;
  gap: calc(var(--gutter) * 1.5);

  @media ${mdAndUp} {
    flex-direction: row;
  }

  * {
    margin: 0;
  }

  ul {
    padding-left: var(--gutter);
    padding-bottom: calc(var(--gutter) / 2);
    button {
      background-color: transparent;
      border: none;
      color: var(--text);
      cursor: pointer;
      padding: 0;
      font-size: var(--font-size);
      text-align: left;
      vertical-align: text-top;

      > div {
        align-items: center;
        display: flex;
        gap: calc(var(--gutter) / 2);
      }

      small {
        display: block;
        margin: calc(var(--gutter) / 2) 0;
      }
    }
  }

  h3 {
    font-size: var(--font-size);
    font-weight: 500;
    margin: var(--gutter) 0 0;
  }

  ol {
    list-style: none;
    padding: 0;
    li {
      display: flex;
      justify-content: space-between;
    }
  }

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    gap: var(--gutter);
    width: 33%;
    > div {
      border: 1px solid ${medium};
      border-radius: var(--border-radius);
      > div {
        padding: var(--gutter);
        border-bottom: 1px solid ${medium};
        display: flex;
        flex-direction: column;
        gap: calc(var(--gutter) / 2);
        &:last-of-type {
          border-bottom: none;
        }
      }
    }
  }

  > div:last-of-type {
    display: flex;
    flex-grow: 1;
    > div {
      max-height: 1000px;
    }
  }
`;

export const meetingCss = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  /* for focusing, can remove with react router */
  h1 {
    outline: none;
    small {
      color: ${dark};
      margin-left: 8px;
    }
  }
`;
