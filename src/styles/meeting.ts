import { css } from '@emotion/react';

import { color, media, size } from './variables';

export const meetingBackCss = css`
  align-items: center;
  display: flex;
  margin-bottom: ${size.gutter}px;
`;

export const meetingColumnsCss = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: ${size.gutter * 1.5}px;

  @media ${media.mdAndUp} {
    flex-direction: row;
  }

  * {
    margin: 0;
  }

  ul {
    padding: 0 0 0 ${size.gutter * 1.5}px;
    button {
      background-color: transparent !important;
      background-image: none !important;
      border: none;
      color: var(--text) !important;
      cursor: pointer;
      font-size: var(--font-size);
      line-height: 1;
      padding: 0 !important;
      text-align: left;
      text-shadow: none;
      vertical-align: text-top;
      white-space: normal;

      > div {
        align-items: center;
        display: flex;
        gap: ${size.gutter / 2}px;
      }

      small {
        display: block;
        line-height: 1.5;
        margin: ${size.gutter / 2}px 0;
      }
    }
  }

  header {
    text-align: center;
    display: grid;
    gap: ${size.gutter / 2}px;
  }

  h3 {
    font-size: var(--font-size);
    font-weight: 500;
  }

  ol {
    color: ${color.dark};
    list-style: none;
    padding: 0 !important;
    li {
      display: flex;
      gap: ${size.gutter / 2}px;
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
    gap: ${size.gutter}px;
    width: 100%;
    @media ${media.mdAndUp} {
      width: 33%;
    }
    > div {
      border: 1px solid ${color.medium};
      border-radius: var(--border-radius);
      > div {
        border-bottom: 1px solid ${color.medium};
        display: flex;
        flex-direction: column;
        gap: ${size.gutter}px;
        padding: ${size.gutter}px;
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
      color: ${color.dark};
      margin-left: 8px;
    }
  }
`;

export const paragraphsCss = css`
  display: grid;
  gap: ${size.gutter}px;
`;
