import { css } from '@emotion/react';

import { color } from './variables';

export const mapCss = css`
  background-color: ${color.medium};
  border-radius: var(--border-radius);
  display: flex;
  flex-grow: 1;
  min-height: 500px;
  overflow: hidden !important;
  position: relative;

  button {
    background-image: none !important;
  }

  a[class^='leaflet-control-zoom-'] {
    color: ${color.dark} !important;
    line-height: 26px !important;
    text-decoration: none !important;
  }

  .leaflet-popup {
    margin-bottom: 20px !important;

    a.leaflet-popup-close-button {
      align-items: center;
      background: var(--background);
      border-radius: 50%;
      border: 1px solid ${color.medium} !important;
      color: ${color.dark} !important;
      display: flex;
      font-family: var(--font-family);
      font-size: 24px !important;
      height: 30px !important;
      justify-content: center;
      position: absolute;
      right: -15px !important;
      text-decoration: none !important;
      top: -15px !important;
      width: 30px !important;
      span {
        margin-top: -3px;
      }
    }

    .leaflet-popup-content-wrapper {
      border-radius: calc(var(--border-radius) * 2) !important;
      background: var(--background);
      color: var(--text);

      .leaflet-popup-content {
        display: grid;
        font-family: var(--font-family);
        font-size: var(--font-size);
        gap: 12px;
        margin: 0 !important;
        padding: 16px !important;
      }
    }

    .leaflet-popup-tip-container {
      margin-left: -20px !important;
      margin-top: -1px !important;
      .leaflet-popup-tip {
        background: var(--background);
        margin: -10px auto 0 !important;
      }
    }
  }
`;

export const mapPopupMeetingsCss = css`
  margin-bottom: 4px;
  max-height: 250px;
  overflow-y: auto;
  > div {
    border: 1px solid ${color.medium};
    font-size: 90%;
    margin-top: -1px;
    padding: 4px 8px;
    :first-of-type {
      border-top-left-radius: var(--border-radius);
      border-top-right-radius: var(--border-radius);
      margin-top: 0;
    }
    :last-of-type {
      border-bottom-left-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);
    }
    time {
      display: flex;
      gap: 0 4px;
    }
    a {
      margin-right: 6px;
    }
    small {
      color: ${color.dark};
    }
  }
`;
