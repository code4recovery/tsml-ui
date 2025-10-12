import { useEffect } from 'react';

import { Global } from '@emotion/react';
import { Outlet } from 'react-router-dom';

import {
  DataProvider,
  ErrorProvider,
  FilterProvider,
  InputProvider,
  SettingsProvider,
  useData,
  useInput,
} from '../hooks';
import { globalCss } from '../styles';

import { Alert, Controls, DynamicHeight, Loading, Map, Table, Title } from './';

export default function TsmlUI({
  google,
  hashRouting,
  settings: userSettings,
  src,
  timezone,
}: {
  google?: string;
  hashRouting: boolean;
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
      <SettingsProvider hashRouting={hashRouting} userSettings={userSettings}>
        <InputProvider>
          <DataProvider google={google} src={src} timezone={timezone}>
            <FilterProvider>
              <Global styles={globalCss} />
              <DynamicHeight>
                <Outlet />
              </DynamicHeight>
            </FilterProvider>
          </DataProvider>
        </InputProvider>
      </SettingsProvider>
    </ErrorProvider>
  );
}

export const Index = () => {
  const { waitingForData } = useData();
  const { input, waitingForInput } = useInput();
  return waitingForData ? (
    <Loading />
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
