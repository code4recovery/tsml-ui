import { useSearchParams } from 'react-router-dom';

import { filterMeetingData, getQueryString, useSettings } from '../helpers';

import Controls from './Controls';
import Map from './Map';
import Table from './Table';
import Title from './Title';

export default function Index() {
  const { capabilities, indexes, meetings, settings, strings } = useSettings();
  const [searchParams] = useSearchParams();
  const input = getQueryString(searchParams, settings);

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
      {settings.show.title && <Title />}
      {settings.show.controls && <Controls />}
      {alert && <Alert />}
      {view === 'table' ? (
        <Table />
      ) : (
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <Map />
        </div>
      )}
    </>
  );
}
