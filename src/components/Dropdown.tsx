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
  setState: (state: State) => void;
  state: State;
};

export default function Dropdown({
  defaultValue,
  end,
  filter,
  open,
  setDropdown,
  setState,
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

    //add or remove from filters
    if (value) {
      if (e.metaKey) {
        // @ts-expect-error TODO
        const index = state.input[filter].indexOf(value);
        if (index === -1) {
          // @ts-expect-error TODO
          state.input[filter].push(value);
          searchParams.set(filter, state.input[filter].join(','));
        } else {
          state.input[filter].splice(index, 1);
          if (state.input[filter].length > 0) {
            searchParams.set(filter, state.input[filter].join(','));
          } else {
            searchParams.delete(filter);
          }
        }
      } else {
        // @ts-expect-error TODO
        state.input[filter] = [value];
        searchParams.set(filter, value);
      }
    } else {
      state.input[filter] = [];
      // remove filter from search params
      searchParams.delete(filter);
    }

    // Update search params state
    setSearchParams(searchParams);

    //sort filters
    state.input[filter].sort(
      (a, b) =>
        state.indexes[filter].findIndex(x => a === x.key) -
        state.indexes[filter].findIndex(x => b === x.key)
    );

    //pass it up to app controller
    setState({ ...state });
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
