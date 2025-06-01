import { useEffect } from 'react';

import { Global } from '@emotion/react';

import { DataProvider, FilterProvider, SettingsProvider } from '../hooks';
import { globalCss } from '../styles';

import { Alert, Controls, DynamicHeight, Map, Meeting, Table, Title } from './';

export default function TsmlUI({
  google,
  settings: userSettings,
  src,
  timezone,
}: {
  google?: string;
  settings?: TSMLReactConfig;
  src?: string;
  timezone?: string;
}) {
  useEffect(() => {
    console.log(
      'TSML UI meeting finder: https://github.com/code4recovery/tsml-ui'
    );

    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  return (
    <SettingsProvider userSettings={userSettings}>
      <Global styles={globalCss} />
      <DynamicHeight>
        <DataProvider google={google} src={src} timezone={timezone}>
          <FilterProvider>
            <Meeting />
            <Title />
            <Controls />
            <Alert />
            <Table />
            <Map />
          </FilterProvider>
        </DataProvider>
      </DynamicHeight>
    </SettingsProvider>
  );
}
