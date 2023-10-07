import { css, keyframes } from '@emotion/react';

import { color, size } from './variables';

const animation = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const loadingCss = css`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  min-height: 500px;

  > div {
    height: ${size.loading}px;
    position: relative;
    width: ${size.loading}px;
    div {
      animation: ${animation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: ${color.medium} transparent transparent transparent;
      border-radius: 50%;
      border-style: solid;
      border-width: ${size.loading / 10}px;
      height: 100%;
      position: absolute;
      width: 100%;
      &:nth-of-type(1) {
        animation-delay: -0.45s;
      }
      &:nth-of-type(2) {
        animation-delay: -0.3s;
      }
      &:nth-of-type(3) {
        animation-delay: -0.15s;
      }
    }
  }
`;
