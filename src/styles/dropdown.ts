import { css } from '@emotion/react';

import { dropdownButtonCss } from './button';
import { color, size } from './variables';

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
    z-index: 1000;

    // scroll
    max-height: 80vh;
    overflow-y: auto;

    hr {
      background-color: ${color.medium};
      border: 0;
      height: 1px;
      margin: 0;
    }
  }
  .tsml-dropdown {

    &__item {
      display: flex;
      flex-direction: row;
      flex-wrap: none;

      .tsml-dropdown__button {
        flex: auto;
        align-items: center;
        background-color: transparent;
        border-radius: 0;
        border: 0;
        //display: flex;
        color: var(--text);
        cursor: pointer;
        font-size: var(--font-size);
        gap: 16px;
        justify-content: space-between;
        margin: 0;
        padding: ${size.gutter / 2}px ${size.gutter}px;
        text-align: left;
        white-space: normal;

        span {
          //background-color: ${color.medium};
          border-radius: var(--border-radius);
          color: ${color.dark};
          //font-weight: bold;
          font-size: 0.75em;
          margin-left: 0.5rem;

        }

        &[data-active='false']:hover {
          background-color: ${color.medium};
          color: var(--text);
        }
      }

      &[data-active='true'] {
        background-color: ${color.dark};
        button {
          background: transparent;
          color: var(--background);
        }
      }
    }

    &__expand {
      background-color: ${color.light};
      padding: 0.25rem 1rem;
      border: 0;
      svg {
        vertical-align: middle;
      }
      &::after {
        border-bottom: 0;
        border-left: 0.3em solid transparent;
        border-right: 0.3em solid transparent;
        border-top: 0.3em solid;
        content: '';
        display: inline-block;
        vertical-align: 0.255em;      
      }
      &[data-expanded="true"]::after {
        transform: rotate(180deg);
      }
    }

    &__children {
      padding-left: 1rem;
      max-height: 0;
      transition: max-height 0.3s;
      overflow: hidden;      
      
      &[data-expanded="true"] {
        max-height: 2000px
      }
    }

  }
`;

export const dropdownButtonLastCss = css`
  ${dropdownButtonCss}
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: -1px !important;
`;
