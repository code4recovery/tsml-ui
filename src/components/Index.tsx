import { useSearchParams } from 'react-router-dom';

import { filterMeetingData, getQueryString, useSettings } from '../helpers';

import Alert from './Alert';
import Controls from './Controls';
import List from './List';
import Map from './Map';
import Title from './Title';

export default function Index() {
  const { capabilities, indexes, meetings, settings, strings } = useSettings();
  const [searchParams] = useSearchParams();
  const input = getQueryString(searchParams, settings);
  const { title, controls } = settings.show;

  const { view } = getQueryString(searchParams, settings);

  // filter data
  const [filteredSlugs, inProgress] = filterMeetingData({
    capabilities,
    indexes,
    input,
    meetings,
    settings,
    strings,
  });

  // show alert?
  const alert = !filteredSlugs.length ? strings.no_results : undefined;

  return (
    <>
      {title && <Title />}
      {controls && <Controls />}
      <Alert alert={alert} />
      {view === 'map' ? (
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <Map filteredSlugs={filteredSlugs} />
        </div>
      ) : (
        <List filteredSlugs={filteredSlugs} inProgress={inProgress} />
      )}
    </>
  );
}
