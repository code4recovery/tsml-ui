import { filterMeetingData, useData, useSettings } from '../helpers';

import Alert from './Alert';
import Controls from './Controls';
import List from './List';
import Map from './Map';
import Title from './Title';

export default function Index() {
  const { capabilities, indexes, input, meetings } = useData();
  const { settings, strings } = useSettings();

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
      <Alert alert={alert} />
      {input.view === 'map' ? (
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <Map filteredSlugs={filteredSlugs} />
        </div>
      ) : (
        <List filteredSlugs={filteredSlugs} inProgress={inProgress} />
      )}
    </>
  );
}
