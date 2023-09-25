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

  > div {
    height: 100% !important;
    width: 100% !important;
  }

  button {
    background-image: none !important;
  }

  .mapboxgl-ctrl-attrib {
    background: var(--background) !important;
    a {
      color: ${color.dark} !important;
    }
  }

  .mapboxgl-ctrl-group {
    button {
      background-color: var(--background);
      border-top-color: ${color.medium};
    }
  }

  .mapboxgl-ctrl-logo {
    opacity: 0.5;
  }

  .mapboxgl-popup {
    max-width: 85%;
    width: 320px;
    z-index: 100;

    .mapboxgl-popup-close-button {
      background: var(--background);
      border-radius: 100%;
      border: 1px solid ${color.medium};
      color: ${color.dark};
      font-size: 24px;
      height: 30px;
      line-height: 1;
      padding: 0 4px 4px 4px;
      position: absolute;
      right: -10px;
      top: -10px;
      width: 30px;

      &:hover {
        color: var(--text);
      }
    }

    .mapboxgl-popup-content {
      background: var(--background);
      padding: 12px;
      position: relative;

      h2 {
        font-size: 20px;
        margin: 0;
        line-height: 1.2;
      }

      > div {
        display: flex;
        flex-direction: column;
        gap: 8px;
        p {
          margin: 0;
        }
      }
    }

    .mapboxgl-popup-tip {
      border-top-color: var(--background);
    }
  }
`;

export const mapMeetingsCss = css`
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
