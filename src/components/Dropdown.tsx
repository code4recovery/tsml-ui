import { Fragment } from 'react';

import { formatString as i18n, getIndexByKey, useSettings } from '../helpers';
import { dropdownButtonCss, dropdownCss } from '../styles';
import type { Index, State } from '../types';
import { useSearchParams } from 'react-router-dom';

type DropdownProps = {
  defaultValue: string;
  end: boolean;
  filter: keyof State['indexes'];
  open: boolean;
  setDropdown: (dropdown?: string) => void;
  state: State;
};

export default function Dropdown({
  defaultValue,
  end,
  filter,
  open,
  setDropdown,
  state,
}: DropdownProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { strings } = useSettings();
  const options = state.indexes[filter];
  const values = state.input[filter];

  //set filter: pass it up to parent
  const setFilter = (
    e: React.MouseEvent<HTMLButtonElement>,
    filter: keyof typeof state.indexes,
    value?: string
  ) => {
    e.preventDefault();

    // add or remove from filters
    let currentValues = searchParams.get(filter)?.split('/') ?? [];

    if (value) {
      const index = currentValues.indexOf(value);
      if (e.metaKey) {
        if (index === -1) {
          currentValues.push(value);
        } else {
          // Remove the value
          currentValues.splice(index, 1);
        }
        // sort values
        if (currentValues.length > 1) {
          currentValues.sort();

          // TODO: this is a hack to get around unable to use %2F in search params
          // currently this will break if filter values are seperated by escaping / with  %2F
          const newValues = currentValues.join('/');
          searchParams.set(filter, newValues);
        } else if (currentValues.length === 1) {
          // Handle the case where there's only one value left
          searchParams.set(filter, currentValues[0]);
        } else {
          searchParams.delete(filter);
        }
      } else {
        // Single value, directly set the value
        searchParams.set(filter, value);
      }
    } else {
      // Remove the filter from search params if no value is provided
      searchParams.delete(filter);
    }

    // Update search params state
    setSearchParams(searchParams);
  };

  const renderDropdownItem = ({ key, name, slugs, children }: Index) => (
    <Fragment key={key}>
      <button
        // @ts-expect-error TODO
        data-active={values.includes(key)}
        onClick={e => setFilter(e, filter, key)}
      >
        {name}
        <span
          aria-label={
            slugs.length === 1
              ? strings.match_single
              : i18n(strings.match_multiple, {
                  count: slugs.length,
                })
          }
        >
          {slugs.length}
        </span>
      </button>
      {!!children?.length && (
        <div>{children.map(child => renderDropdownItem(child))}</div>
      )}
    </Fragment>
  );

  //separate section above the other items
  const special = {
    type: ['active', 'in-person', 'online'],
  };

  return (
    <div css={dropdownCss}>
      <button
        aria-expanded={open}
        css={dropdownButtonCss}
        id={filter}
        onClick={e => {
          setDropdown(open ? undefined : filter);
          e.stopPropagation();
        }}
      >
        {values?.length && options?.length
          ? values.map(value => getIndexByKey(options, value)?.name).join(' + ')
          : defaultValue}
      </button>
      <div
        aria-labelledby={filter}
        style={{
          display: open ? 'block' : 'none',
          [end ? 'right' : 'left']: 0,
        }}
      >
        <button
          data-active={!values.length}
          onClick={e => setFilter(e, filter, undefined)}
        >
          {defaultValue}
        </button>
        {[
          options
            ?.filter(option =>
              special[filter as keyof typeof special]?.includes(option.key)
            )
            .sort(
              (a, b) =>
                special[filter as keyof typeof special]?.indexOf(a.key) -
                special[filter as keyof typeof special]?.indexOf(b.key)
            ),
          options?.filter(
            option =>
              !special[filter as keyof typeof special]?.includes(option.key)
          ),
        ]
          .filter(e => e.length)
          .map((group, index) => (
            <Fragment key={index}>
              <hr />
              {group.map(option => renderDropdownItem(option))}
            </Fragment>
          ))}
      </div>
    </div>
  );
}
