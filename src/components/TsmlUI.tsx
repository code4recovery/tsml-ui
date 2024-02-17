import { Suspense, useEffect } from 'react';

import { Global } from '@emotion/react';
import {
  Await,
  Outlet,
  ScrollRestoration,
  useLoaderData,
} from 'react-router-dom';

import { SettingsContext } from '../helpers';
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
  const { data } = useLoaderData() as {
    data: {
      capabilities: State['capabilities'];
      indexes: State['indexes'];
      meetings: State['meetings'];
    };
  };

  // manage classes
  useEffect(() => {
    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  // clean up any unsightly empty hashes added by react router
  useEffect(() => {
    if (window.location.hash === '#' || window.location.hash === '#/') {
      window.history.replaceState('', document.title, window.location.pathname);
    }
  }, [window.location.hash]);

  return (
    <>
      <Global styles={globalCss} />
      <Suspense fallback={<Loading />}>
        <Await resolve={data}>
          {data => (
            <SettingsContext.Provider value={{ ...data, settings, strings }}>
              <Outlet />
            </SettingsContext.Provider>
          )}
        </Await>
      </Suspense>
      <ScrollRestoration />
    </>
  );
}
