import { Suspense, useEffect } from 'react';

import { Global } from '@emotion/react';
import {
  Await,
  Outlet,
  ScrollRestoration,
  useLoaderData,
} from 'react-router-dom';

import { DataProvider, SettingsProvider } from '../helpers';
import { globalCss } from '../styles';

import { default as Loading } from './Loading';

import type { State } from '../types';

export default function TsmlUI({
  settings,
  strings,
}: {
  settings: TSMLReactConfig;
  strings: Translation;
}) {
  const data = useLoaderData() as { fetcher: Promise<State> };

  // manage classes
  useEffect(() => {
    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  /* clean up any unsightly empty hashes added by react router
  useEffect(() => {
    if (window.location.hash === '#' || window.location.hash === '#/') {
      window.history.replaceState('', document.title, window.location.pathname);
    }
  }, [window.location.hash]);
*/

  return (
    <SettingsProvider value={{ settings, strings }}>
      <Global styles={globalCss} />
      <Suspense fallback={<Loading />}>
        <Await resolve={data.fetcher}>
          {state => (
            <DataProvider {...state}>
              <Outlet />
            </DataProvider>
          )}
        </Await>
      </Suspense>
      <ScrollRestoration />
    </SettingsProvider>
  );
}
