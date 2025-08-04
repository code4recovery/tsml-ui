import {
  Dispatch,
  Fragment,
  MouseEvent,
  SetStateAction,
  useState,
} from 'react';

import { getIndexByKey, formatString as i18n } from '../helpers';
import { type Data, useData, useInput, useSettings } from '../hooks';
import { dropdownButtonCss, dropdownCss } from '../styles';
import type { Index } from '../types';

export default function Dropdown({
  defaultValue,
  filter,
  open,
  setDropdown,
}: {
  defaultValue: string;
  filter: keyof Data['indexes'];
  open: boolean;
  setDropdown: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { indexes } = useData();
  const { strings } = useSettings();
  const { input, setInput } = useInput();
  const options = indexes[filter];
  const values =
    filter === 'distance'
      ? [`${input.distance}`]
      : (input[filter as keyof typeof input] as string[]);
  const [expanded, setExpanded] = useState<string[]>([]);

  console.debug('Dropdown', { filter, open, values, options });

  // handle expand toggle
  const toggleExpanded = (e: MouseEvent<HTMLButtonElement>, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!expanded.includes(key)) {
      setExpanded(expanded.concat(key));
    } else {
      setExpanded(expanded.filter(item => item !== key));
    }
  };

  //set filter: pass it up to parent
  const setFilter = (
    e: MouseEvent<HTMLButtonElement>,
    filter: keyof typeof indexes,
    value?: string
  ) => {
    e.preventDefault();

    // add or remove from filters
    let currentValues = input[filter] as string[];

    if (value) {
      const index = currentValues.indexOf(value);
      if (e.metaKey || e.ctrlKey) {
        if (index === -1) {
          currentValues.push(value);
          currentValues.sort();
        } else {
          // Remove the value
          currentValues.splice(index, 1);
        }
      } else {
        // Single value, directly set the value
        currentValues = [value];
      }
    } else {
      // Remove the filter from search params if no value is provided
      currentValues = [];
    }

    setInput(input => ({ ...input, [filter]: currentValues }));
  };

  const renderDropdownItem = (
    { key, name, slugs, children }: Index,
    parentExpanded: boolean = true
  ) => (
    <Fragment key={key}>
      <div className="tsml-dropdown__item" data-active={values.includes(key)}>
        <button
          className="tsml-dropdown__button"
          onClick={e => setFilter(e, filter, key)}
          tabIndex={parentExpanded ? 0 : -1}
        >
          <span>{name}</span>
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
          <button
            className="tsml-dropdown__expand"
            data-expanded={expanded.includes(key)}
            onClick={e => toggleExpanded(e, key)}
            aria-label={
              expanded.includes(key) ? strings.collapse : strings.expand
            }
          />
        )}
      </div>
      {!!children?.length && (
        <div
          className="tsml-dropdown__children"
          data-expanded={expanded.includes(key)}
        >
          {children.map(child =>
            renderDropdownItem(child, expanded.includes(key))
          )}
        </div>
      )}
    </Fragment>
  );

  // separate section above the other items
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
        className="tsml-dropdown"
        style={{ display: open ? 'block' : 'none' }}
      >
        <div data-active={!values.length} className="tsml-dropdown__item">
          <button
            className="tsml-dropdown__button"
            onClick={e => setFilter(e, filter, undefined)}
          >
            {defaultValue}
          </button>
        </div>
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
