import { Suspense, useEffect } from 'react';

import { Global } from '@emotion/react';
import { Outlet, useLoaderData } from 'react-router-dom';

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
  const data = useLoaderData() as {
    capabilities: State['capabilities'];
    indexes: State['indexes'];
    meetings: State['meetings'];
  };

  // manage classes
  useEffect(() => {
    document.body.classList.add('tsml-ui');
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ ...data, settings, strings }}>
      <Global styles={globalCss} />
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </SettingsContext.Provider>
  );
}
