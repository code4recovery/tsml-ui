import { css } from '@emotion/react';

import { buttonCss, formControlCss } from './button';
import { lgAndUp, medium, dark } from './variables';

export const controlsCss = css`
  display: grid;
  gap: var(--gutter);
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: var(--gutter) 0;

  form {
    display: flex;
    fieldset {
      border: 0;
      padding: 0;
      button {
        padding: calc(var(--gutter) / 2) !important;
        width: 40px !important;
      }
    }
  }

  [role='group'] {
    display: flex;
  }

  @media ${lgAndUp} {
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
  }
`;

export const controlsGroupFirstCss = css`
  ${buttonCss}
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
`;

export const controlsGroupLastCss = css`
  ${buttonCss}
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  margin-left: -1px;
`;

export const controlsInputCss = css`
  ${formControlCss}
  border: 1px solid ${medium};
  &:focus {
    border: 1px solid ${dark};
    outline: none;
  }
`;

export const controlsInputFirstCss = css`
  ${controlsInputCss}
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
`;

export const controlsSearchDropdownCss = css`
  min-width: 0 !important;
  right: 0;
`;
