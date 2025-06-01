import { useEffect } from 'react';

import { Global } from '@emotion/react';

import {
  DataProvider,
  FilterProvider,
  InputProvider,
  SettingsProvider,
} from '../hooks';
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

    // add body class to help people style their pages
    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  return (
    <SettingsProvider userSettings={userSettings}>
      <InputProvider>
        <DataProvider google={google} src={src} timezone={timezone}>
          <FilterProvider>
            <Global styles={globalCss} />
            <DynamicHeight>
              <Meeting />
              <Title />
              <Controls />
              <Alert />
              <Table />
              <Map />
            </DynamicHeight>
          </FilterProvider>
        </DataProvider>
      </InputProvider>
    </SettingsProvider>
  );
}
