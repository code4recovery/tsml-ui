import { css } from '@emotion/react';

import { buttonCss, formControlCss } from './button';
import { color, media, size } from './variables';

export const controlsCss = css`
  display: grid;
  gap: ${size.gutter}px;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  form,
  fieldset {
    border: 0;
    margin: 0 !important;
    padding: 0;
  }

  fieldset {
    button {
      padding: ${size.gutter / 2}px !important;
      width: 40px !important;
    }
  }

  [role='group'] {
    display: flex;
  }

  /* position right-edge dropdown menus so they dont go off-screen */
  & > div:nth-of-type(2) > div > div {
    right: 0;
  }

  @media ${media.lgAndUp} {
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;

    & > div:nth-of-type(2) > div > div {
      right: auto;
    }

    & > div:last-child > div > div {
      right: 0 !important;
    }
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
  margin-left: -1px !important;
`;

export const controlsInputCss = css`
  &[type='search'] {
    ${formControlCss}
    border: 1px solid ${color.medium};
    &:focus {
      border: 1px solid ${color.dark};
      outline: none;
    }
  }
`;

export const controlsInputFirstCss = css`
  ${controlsInputCss}
  &[type='search'] {
    border-bottom-right-radius: 0 !important;
    border-top-right-radius: 0 !important;
  }
`;

export const controlsSearchDropdownCss = css`
  min-width: 0 !important;
  right: 0;
`;

export const controlsInputSearchSubmitCss = css`
  display: none !important;
`;
