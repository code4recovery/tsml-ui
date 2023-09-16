import { css } from '@emotion/react';

import { dark, medium } from './variables';

export const mapCss = css`
  background-color: ${medium};
  border-radius: var(--border-radius);
  flex-grow: 1;
  min-height: 500px;
  overflow: hidden !important;

  .mapboxgl-popup {
    max-width: 85%;
    width: 320px;
    z-index: 100;

    .mapboxgl-popup-tip {
      border-top-color: var(--background);
    }

    .mapboxgl-popup-content {
      background: var(--background);
      padding: 12px;
      position: relative;

      h2 {
        font-size: 1.25rem;
        margin: 0;
        line-height: 1.2;
      }

      .list-group {
        max-height: 250px;
        .list-group-item {
          font-size: 14.4px;
          padding: 8px;
        }
      }

      .mapboxgl-popup-close-button {
        background: var(--background);
        border-radius: 100%;
        border: 1px solid ${medium};
        color: ${dark};
        font-size: 24px;
        height: 30px;
        line-height: 1;
        padding: 0 4px 4px 4px;
        position: absolute;
        right: -10px;
        top: -10px;
        width: 30px;

        &:hover {
          background: var(--background);
          color: ${medium};
        }
      }
    }
  }
`;
