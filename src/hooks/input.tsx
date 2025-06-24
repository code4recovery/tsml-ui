import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { defaults, useSettings } from './settings';

type Coordinates = {
  latitude?: number;
  longitude?: number;
  waiting: boolean;
};

const InputContext = createContext<
  {
    input: TSMLReactConfig['defaults'];
    latitude?: number;
    longitude?: number;
    setInput: React.Dispatch<React.SetStateAction<TSMLReactConfig['defaults']>>;
  } & Coordinates
>({ input: defaults.defaults, setInput: () => {}, waiting: false });

export const InputProvider = ({ children }: PropsWithChildren) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [input, setInput] = useState<TSMLReactConfig['defaults']>(
    defaults.defaults
  );

  const [coordinates, setCoordinates] = useState<Coordinates>({
    waiting: input.mode !== 'search',
  });

  const { settings } = useSettings();

  // detect initial input from URL search params
  useEffect(() => {
    const mode =
      searchParams.get('mode') === 'location'
        ? 'location'
        : searchParams.get('mode') === 'me'
        ? 'me'
        : 'search';
    const view = searchParams.get('view') === 'map' ? 'map' : 'table';
    const search = searchParams.get('search')?.toString() ?? '';
    const region = searchParams.has('region')
      ? `${searchParams.get('region')}`.split('/')
      : [];
    const time = searchParams.has('time')
      ? (`${searchParams.get('time')}`.split('/') as Array<
          'morning' | 'midday' | 'evening' | 'night' | 'appointment'
        >)
      : [];
    const weekday = searchParams.has('weekday')
      ? `${searchParams.get('weekday')}`.split('/')
      : [];
    const type = searchParams.has('type')
      ? `${searchParams.get('type')}`.split('/')
      : [];
    const meeting = searchParams.get('meeting') ?? undefined;
    const distance = searchParams.has('distance')
      ? parseInt(searchParams.get('distance') ?? '')
      : mode !== 'search'
      ? settings.distance_default
      : undefined;

    setInput(input => ({
      ...input,
      distance,
      meeting,
      mode,
      region,
      search,
      time,
      type,
      view,
      weekday,
    }));
  }, []);

  // update URL search params when input changes
  useEffect(() => {
    if (input === defaults.defaults) return;
    const params = {
      distance: input.distance,
      meeting: input.meeting,
      mode: input.mode == defaults.defaults.mode ? '' : input.mode,
      region: input.region.join('/'),
      search: input.search,
      time: input.time.join('/'),
      type: input.type.join('/'),
      view: input.view === defaults.defaults.view ? '' : input.view,
      weekday: input.weekday.join('/'),
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value)
    ) as { [key: string]: string };
    setSearchParams(filteredParams);
  }, [input]);

  // handle geocoding or geolocation requests
  useEffect(() => {
    if (coordinates.waiting) {
      console.debug('TSML UI coordinates request already in progress');
      return;
    }
    if (input.mode === 'location' && input.search) {
      console.debug('TSML UI geocoding request');
      setCoordinates({ waiting: true });
      const url =
        window.location.host === 'tsml-ui.test'
          ? 'geo.test'
          : 'geo.code4recovery.org';
      fetch(
        `https:// ${url}/api/geocode?${new URLSearchParams({
          application: 'tsml-ui',
          language: settings.language,
          referrer: window.location.href,
          search: input.search,
        })}`
      )
        .then(result => result.json())
        .then(({ results }) => {
          if (results?.length) {
            const { latitude, longitude } = results[0];
            console.debug(
              `TSML UI geocoding success: ${latitude}, ${longitude}`
            );
            setCoordinates({
              latitude,
              longitude,
              waiting: false,
            });
          } else {
            setCoordinates({
              waiting: false,
            });
            console.warn(
              `TSML UI geocoding error: no results for "${input.search}"`
            );
          }
        });
    } else if (input.mode === 'me') {
      console.debug('TSML UI geolocation request');
      setCoordinates({ waiting: true });
      navigator.geolocation.getCurrentPosition(
        position => {
          console.debug(
            `TSML UI geolocation success: ${position.coords.latitude}, ${position.coords.longitude}`
          );
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            waiting: false,
          });
        },
        error => {
          console.warn(`TSML UI geolocation error: ${error.message}`);
          // setState(state => ({
          //   ...state,
          //   error: strings.errors.geolocation,
          //   filtering: false,
          // }));
        },
        { timeout: 5000 }
      );
    } else {
      console.debug('TSML UI no geocoding or geolocation request');
      setCoordinates({ waiting: false });
    }
  }, [input.mode, input.search]);

  return (
    <InputContext.Provider value={{ input, setInput, ...coordinates }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInput = () => useContext(InputContext);
