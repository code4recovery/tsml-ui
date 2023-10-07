import { css } from '@emotion/react';
import { size } from './variables';

const messageCss = css`
  border-radius: var(--border-radius);
  padding: ${size.gutter}px;
  text-align: center;
`;

export const alertCss = css`
  ${messageCss};
  background-color: var(--alert-background);
  color: var(--alert-text);
`;

export const errorCss = css`
  ${messageCss};
  background-color: color-mix(in srgb, var(--inactive), var(--background) 82%);
  color: var(--inactive);
`;
