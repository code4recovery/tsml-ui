import { useEffect, useState } from 'react';

import { useSearchParams } from 'react-router-dom';

import { useData, useSettings } from '../helpers';
import {
  controlsCss,
  controlsGroupFirstCss,
  controlsGroupLastCss,
} from '../styles';

import Dropdown from './Dropdown';
import Search from './Search';

type View = 'list' | 'map';

export default function Controls() {
  const { capabilities, input, meetings } = useData();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, strings } = useSettings();
  const [dropdown, setDropdown] = useState<string>();

  // get available filters
  const filters = settings.filters
    .filter(filter => capabilities[filter])
    .filter(filter => filter !== 'region' || input.mode === 'search')
    .filter(filter => filter !== 'distance' || input.mode !== 'search');

  // get available views
  const views = ['list', 'map'].filter(
    view => view !== 'map' || (capabilities.coordinates && settings.mapbox)
  ) as View[];

  // add click listener for dropdowns
  useEffect(() => {
    const closeDropdown = () => setDropdown(undefined);
    document.body.addEventListener('click', closeDropdown);
    return () => {
      document.body.removeEventListener('click', closeDropdown);
    };
  }, [document]);

  // toggle list/map view
  const setView = (view: View) => {
    if (view === settings.defaults.view) {
      searchParams.delete('view');
    } else {
      searchParams.set('view', view);
    }

    setSearchParams(searchParams);
  };

  return !Object.keys(meetings).length ? null : (
    <div css={controlsCss}>
      <Search dropdown={dropdown} setDropdown={setDropdown} />
      {filters.map(filter => (
        <div key={filter}>
          <Dropdown
            defaultValue={
              strings[`${filter}_any` as keyof typeof strings] as string
            }
            filter={filter}
            open={dropdown === filter}
            setDropdown={setDropdown}
          />
        </div>
      ))}
      {views.length > 1 && (
        <div role="group">
          {views.map((view, index) => (
            <button
              css={index ? controlsGroupLastCss : controlsGroupFirstCss}
              data-active={input.view === view}
              key={view}
              onClick={() => setView(view)}
              type="button"
            >
              {strings.views[view]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
