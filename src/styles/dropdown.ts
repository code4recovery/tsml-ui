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
    max-height: 50vh;
    min-width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    position: absolute;
    z-index: 1000;

    hr {
      background-color: ${color.medium};
      border: 0;
      height: 1px;
      margin: 0;
      width: 100%;
    }
  }
  .tsml-dropdown {
  
    &__expand {
      background-color: ${color.light};
      padding: 0.25rem 1rem;
      border: 0;
      cursor: pointer;
      svg {
        vertical-align: middle;
      }
      &::after {
        border-bottom: 0;
        border-left: 0.4em solid transparent;
        border-right: 0.4em solid transparent;
        border-top: 0.4em solid ${color.dark};
        content: '';
        display: inline-block;
        vertical-align: 0.2em;      
      }
      &[data-expanded="true"]::after {
        transform: rotate(180deg);
      }
      &:hover {
        background-color: ${color.medium};
      }
    }

    &__item {
      display: flex;
      flex-direction: row;
      flex-wrap: none;
      border-bottom: 1px solid ${color.light};

      .tsml-dropdown__button {
        align-items: center;
        background-color: transparent;
        border-radius: 0;
        border: 0;
        color: var(--text);
        cursor: pointer;
        flex: auto;
        font-size: var(--font-size);
        gap: 16px;
        justify-content: space-between;
        margin: 0;
        padding: ${size.gutter / 2}px ${size.gutter}px;
        text-align: left;
        white-space: normal;

        span {
          border-radius: var(--border-radius);
          color: ${color.dark};
          font-size: 0.75em;
          margin-left: 0.5rem;
          float: right;
        }
      }

      &[data-active='true'] {
        background-color: ${color.dark};
        button {
          background: transparent;
          color: var(--background);
        }
        span {
          color: ${color.light}
        }
        .tsml-dropdown__expand::after {
          border-top: 0.4em solid ${color.light};        
        }
      }

      &[data-active='false']:hover {
        background-color: ${color.medium};
        color: var(--text);
      }
    }

    &__children {
      //padding-left: 1rem;
      max-height: 0;
      transition: max-height 0.3s;
      overflow: hidden;      
      
      &[data-expanded="true"] {
        max-height: 2000px
      }

      // child nesting levels
      .tsml-dropdown__button {
        margin-left: 1rem;
      }
      .tsml-dropdown__children {
        .tsml-dropdown__button {
          margin-left: 2rem;
        }
        .tsml-dropdown__children {
          .tsml-dropdown__button {
            margin-left: 3rem;
          }
          .tsml-dropdown__children {
            .tsml-dropdown__button {
              margin-left: 4rem;
            }
          }
        }
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
