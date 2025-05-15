import { css } from '@emotion/react';

import { color } from './variables';

export const mapCss = css`
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
    background: var(--background);
    border-color: ${color.medium};
    color: var(--text) !important;
    line-height: 26px !important;
    text-decoration: none !important;
  }

  .leaflet-container {
    background-color: ${color.medium};
  }

  .leaflet-control-zoom {
    border-width: 1px;
  }

  .leaflet-popup {
    margin-bottom: 20px !important;

    a.leaflet-popup-close-button {
      align-items: center;
      background: var(--background);
      border: 1px solid ${color.medium};
      color: ${color.dark} !important;
      font-family: var(--font-family);
      font-size: 24px !important;
      justify-content: center;
      text-decoration: none !important;
      span {
        margin-top: -3px;
      }
      :hover {
        background-color: ${color.medium};
      }
    }

    a.leaflet-popup-close-button,
    ::after {
      border-radius: 50%;
      display: flex;
      height: 30px !important;
      position: absolute;
      right: -15px !important;
      top: -15px !important;
      width: 30px !important;
    }

    ::after,
    .leaflet-popup-content-wrapper {
      box-shadow: rgba(0, 0, 0, 0.2) 3px 3px 5px !important;
    }

    ::after {
      content: '';
      z-index: -1;
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
