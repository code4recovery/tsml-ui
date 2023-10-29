import { useContext, useEffect } from 'react';
import { Global } from '@emotion/react';
import { IStateContext } from './StateContext';

import { globalCss } from '../styles';
import { Alert, Controls, Loading, Map, Meeting, Table, Title } from './';

import { setQueryString, SettingsContext, getQueryString } from '../helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import { StateContext } from './StateContext';
import { formatUrl } from '../helpers';

export default function TsmlUI() {
  const {
    state,
    setState,
    settings,
    mapbox,
    strings,
    inProgress,
    filteredSlugs,
    loadData,
  } = useContext(StateContext) as IStateContext;
  const location = useLocation();
  const navigate = useNavigate();

  // manage classes
  useEffect(() => {
    document.body.classList.add('tsml-ui');
    loadData();
    return () => {
      document.body.classList.remove('tsml-ui');
    };
  }, []);

  useEffect(() => {
    // apply input changes to query string
    if (!state.loading) {
      setQueryString(state.input, settings!, navigate, location);
    }
  }, [state.loading]);

  useEffect(() => {
    // if location has changed, update state
    if (state.input !== getQueryString(settings, location)) {
      setState({ ...state, input: getQueryString(settings, location) });
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.getElementsByTagName('head')[0]?.appendChild(canonical);
    }
    canonical.setAttribute(
      'href',
      formatUrl(
        state.input.meeting ? { meeting: state.input.meeting } : state.input,
        settings
      )
    );
  }, [location]);

  // useEffect(() => {
  //   // if state has changed update location
  //   navigate(formatRelativeUrl(state.input, settings, location));
  // }, [state]);

  return (
    <SettingsContext.Provider value={{ settings, strings }}>
      <Global styles={globalCss} />
      {!state.ready ? (
        <Loading />
      ) : state.input.meeting && state.input.meeting in state.meetings ? (
        <Meeting
          feedback_emails={settings.feedback_emails}
          mapbox={mapbox}
          setState={setState}
          state={state}
        />
      ) : (
        <>
          {settings.show.title && <Title state={state} />}
          {settings.show.controls && (
            <Controls state={state} setState={setState} mapbox={mapbox} />
          )}
          {(state.alert || state.error) && (
            <Alert state={state} setState={setState} />
          )}
          {state.input.view === 'table' ? (
            <Table
              filteredSlugs={filteredSlugs}
              inProgress={inProgress}
              setState={setState}
              state={state}
            />
          ) : (
            <div style={{ display: 'flex', flexGrow: 1 }}>
              <Map
                filteredSlugs={filteredSlugs}
                listMeetingsInPopup={true}
                mapbox={mapbox}
                setState={setState}
                state={state}
              />
            </div>
          )}
        </>
      )}
    </SettingsContext.Provider>
  );
}
