import { useEffect } from 'react';

import { Global } from '@emotion/react';

import {
  DataProvider,
  ErrorProvider,
  FilterProvider,
  InputProvider,
  SettingsProvider,
  useData,
  useFilter,
  useInput,
} from '../hooks';
import { globalCss } from '../styles';

import {
  Alert,
  Controls,
  DynamicHeight,
  Loading,
  Map,
  Meeting,
  Table,
  Title,
} from './';

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
    <ErrorProvider>
      <SettingsProvider userSettings={userSettings}>
        <InputProvider>
          <DataProvider google={google} src={src} timezone={timezone}>
            <FilterProvider>
              <Global styles={globalCss} />
              <DynamicHeight>
                <Content />
              </DynamicHeight>
            </FilterProvider>
          </DataProvider>
        </InputProvider>
      </SettingsProvider>
    </ErrorProvider>
  );
}

const Content = () => {
  const { waitingForData } = useData();
  const { meeting } = useFilter();
  const { input, waitingForInput } = useInput();
  return waitingForData ? (
    <Loading />
  ) : meeting ? (
    <Meeting meeting={meeting} />
  ) : (
    <>
      <Title />
      <Controls />
      {waitingForInput ? (
        <Loading />
      ) : (
        <>
          <Alert />
          {input.view === 'map' ? <Map /> : <Table />}
        </>
      )}
    </>
  );
};
