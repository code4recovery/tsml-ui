import { css } from '@emotion/react';

import { mdAndUp, medium } from './variables';

export const meetingBackCss = css`
  align-items: center;
  display: flex;
  margin: calc(var(--gutter) * -1.75) 0 var(--gutter);
  padding: var(--gutter);
`;

export const meetingColumnsCss = css`
  display: flex;
  flex-direction: column;
  gap: var(--gutter);
  padding: 0 var(--gutter);

  @media ${mdAndUp} {
    flex-direction: row;
  }

  h2 {
    margin: 0;
    font-weight: 400;
  }

  p,
  ul {
    margin: var(--gutter) 0;
  }

  ul button {
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
        &:last-of-type {
          border-bottom: none;
        }
      }
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
  }
`;
