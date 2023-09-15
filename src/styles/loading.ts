import { css, keyframes } from '@emotion/react';

import { medium } from './variables';

const loadingAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const size = '4rem';
const borderSize = '0.4rem';

export const loadingCss = css`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;

  > div {
    height: ${size};
    position: relative;
    width: ${size};
    div {
      animation: ${loadingAnimation} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: ${medium} transparent transparent transparent;
      border-radius: 50%;
      border-style: solid;
      border-width: ${borderSize};
      box-sizing: border-box;
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
