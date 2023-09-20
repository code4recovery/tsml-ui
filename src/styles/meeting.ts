import { css } from '@emotion/react';

import { dark, gutter, mdAndUp, medium } from './variables';

export const meetingBackCss = css`
  align-items: center;
  display: flex;
  margin-bottom: ${gutter}px;
`;

export const meetingColumnsCss = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${gutter * 1.5}px;

  @media ${mdAndUp} {
    flex-direction: row;
  }

  * {
    margin: 0;
  }

  ul {
    padding: 0 0 ${gutter / 2}px ${gutter};
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
        gap: ${gutter / 2}px;
      }

      small {
        display: block;
        margin: ${gutter / 2}px 0;
      }
    }
  }

  h3 {
    font-size: var(--font-size);
    font-weight: 500;
    margin: ${gutter}px 0 0;
  }

  ol {
    color: ${dark};
    list-style: none;
    padding: 0;
    li {
      display: flex;
      justify-content: space-between;
      div {
        align-items: baseline;
        display: flex;
        flex-grow: 1;
        flex-wrap: wrap;
        gap: 0 8px;
        :first-of-type {
          flex-grow: 0;
          text-transform: lowercase;
          white-space: nowrap;
          width: 85px;
        }
        :last-of-type {
          flex-grow: 0;
          flex-wrap: nowrap;
          gap: 4px;
          justify-content: flex-end;
          padding-top: 2px;
        }
      }
    }
  }

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    gap: ${gutter}px;
    width: 100%;
    @media ${mdAndUp} {
      width: 33%;
    }
    > div {
      border: 1px solid ${medium};
      border-radius: var(--border-radius);
      > div {
        padding: ${gutter}px;
        border-bottom: 1px solid ${medium};
        display: flex;
        flex-direction: column;
        gap: ${gutter / 2}px;
        > div {
          display: flex;
          flex-direction: column;
          gap: ${gutter}px;
          > div {
            display: flex;
            flex-direction: column;
            gap: ${gutter / 3}px;
          }
        }
        &:last-of-type {
          border-bottom: none;
        }
      }
    }
  }

  > div:last-of-type {
    border-radius: var(--border-radius);
    display: flex;
    flex-grow: 1;
    max-height: 1000px;
    overflow: hidden;
  }
`;

export const meetingOnlineCss = css`
  position: relative;
  &::after {
    background-image: var(--online-background-image);
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    bottom: 0;
    content: '';
    left: 0;
    opacity: 0.25;
    position: absolute;
    right: 0;
    top: 0;
  }
`;

export const meetingCss = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  h1 {
    /* for focusing, can remove with react router */
    outline: none;
    small {
      color: ${dark};
      margin-left: 8px;
    }
  }
`;
