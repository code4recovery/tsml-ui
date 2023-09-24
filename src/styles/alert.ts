import { css } from '@emotion/react';
import { gutter } from './variables';

const baseCss = css`
  border-radius: var(--border-radius);
  padding: ${gutter}px;
  text-align: center;
`;

export const alertCss = css`
  ${baseCss};
  background-color: var(--alert-background);
  color: var(--alert-text);
`;

export const errorCss = css`
  ${baseCss};
  background-color: color-mix(in srgb, var(--inactive), var(--background) 82%);
  color: var(--inactive);
`;
