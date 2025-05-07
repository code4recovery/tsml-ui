import { css } from '@emotion/react';

import { color, media, size } from './variables';

export const tableChicletsCss = css`
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
`;

export const tableChicletCss = (
  type: 'in-person' | 'online' | 'inactive'
) => css`
    align-items: center;
    background-color: ${type === 'in-person'
            ? 'color-mix(in srgb, var(--in-person), var(--background) 82%);'
            : type === 'online'
                    ? 'color-mix(in srgb, var(--online), var(--background) 82%);'
                    : 'color-mix(in srgb, var(--inactive), var(--background) 82%);'};
    border-radius: var(--border-radius);
    color: ${type === 'in-person'
            ? 'var(--in-person)'
            : type === 'online'
                    ? 'var(--online)'
                    : 'var(--inactive)'};
    display: inline-flex;
    font-size: calc(var(--font-size) * 0.875);
    gap: 4px;
    justify-content: center;
    padding: 4px 8px;
`;

export const tableCss = css`
    border: 0 !important;
    border-spacing: 0;
    table-layout: auto;
    width: 100%;

    small {
        margin-left: 6px;
        color: ${color.dark};
    }

    td,
    th {
        background-color: transparent;
        border: 0;
        font-size: var(--font-size);
        margin: 0;
        text-align: left;
        vertical-align: middle;
    }

    td {
        cursor: pointer;
        display: block;
        padding: 0 ${size.gutter / 2}px 0 103px !important;
        &.tsml-time,
        &.tsml-distance {
            padding-left: ${size.gutter / 2}px !important;
            position: absolute;
        }
        &.tsml-distance {
            font-size: calc(var(--font-size) * 1.25);
            top: 56px;
        }
        &[colspan] {
            padding-left: ${size.gutter / 2}px !important;
        }
        @media ${media.mdAndUp} {
            border-bottom: 1px solid ${color.medium};
            display: table-cell;
            padding: ${size.gutter / 2}px !important;
            position: static !important;
            &.tsml-time,
            &.tsml-distance {
                padding-left: ${size.gutter}px !important;
            }
            &:last-of-type {
                padding-right: ${size.gutter}px !important;
            }
        }
    }

    th {
        border-bottom: 1px solid ${color.medium};
        font-size: var(--font-size);
        font-weight: 600;
        padding: 0 ${size.gutter / 2}px ${size.gutter / 2}px;
        text-transform: none;
        &:first-of-type {
            padding-left: ${size.gutter}px;
        }
        &:last-of-type {
            padding-right: ${size.gutter}px;
        }
    }

    thead {
        display: none;
        @media ${media.mdAndUp} {
            display: table-header-group;
        }
    }

    tr {
        border: 0;
        display: block;
        padding: ${size.gutter / 2}px ${size.gutter / 2}px;
        position: relative;
        @media ${media.mdAndUp} {
            display: table-row;
            padding: 0;
        }
    }

    tbody tr {
        border-top: 1px solid ${color.medium};
        :nth-of-type(2n + 1) {
            background-color: color-mix(in srgb, var(--text) 3%, transparent);
            a {
                color: color-mix(in srgb, var(--text) 10%, var(--link));
            }
            small {
                color: var(--text);
            }
        }
    }

    time {
        display: flex;
        flex-direction: column;
        span {
            white-space: nowrap;
            &:first-of-type {
                text-transform: lowercase;
            }
        }
        @media ${media.lgAndUp} {
            flex-direction: row;
            gap: 8px;
        }
    }
`;

export const tableInProgressCss = css`
    tr {
        background-color: var(--alert-background) !important;
    }

    button {
        background-color: transparent;
        border-radius: 0;
        border: 0;
        color: var(--alert-text);
        cursor: pointer;
        font-size: var(--font-size);
        margin: 0;
        padding: ${size.gutter}px;
        width: 100%;
        &:focus {
            box-shadow: none;
        }
        &:hover {
            background-color: transparent;
            color: color-mix(in srgb, var(--text) 40%, var(--alert-text));
            text-decoration: underline;
        }
    }
`;

export const tableWrapperCss = css`
    margin: 0 ${size.gutter * -1}px ${size.gutter * -1}px;
    width: calc(100% + ${size.gutter * 2}px);
`;

export const tableChevronCss = css`
  display: inline-block;
  width: 0;
  height: 0;
  margin-left: 4px;
  vertical-align: middle;
  border-left: 0.4em solid transparent;
  border-right: 0.4em solid transparent;
  border-top: 0.4em solid ${color.dark};
  transition: transform 0.2s;
  &.down {
    transform: rotate(180deg);
  }
`;