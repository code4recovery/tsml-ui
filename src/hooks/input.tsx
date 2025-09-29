import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { formatSearch, formatString } from '../helpers';
import { useError } from './error';
import { defaults, useSettings } from './settings';

type Coordinates = {
  latitude?: number;
  longitude?: number;
  waitingForInput: boolean;
};

const InputContext = createContext<
  {
    input: TSMLReactConfig['defaults'];
    latitude?: number;
    longitude?: number;
    setBounds: (bounds: {
      north: string;
      south: string;
      east: string;
      west: string;
    }) => void;
  } & Coordinates
>({ input: defaults.defaults, waitingForInput: false, setBounds: () => {} });

export const InputProvider = ({ children }: PropsWithChildren) => {
  const { setError } = useError();
  const [searchParams] = useSearchParams();
  const { settings, strings } = useSettings();
  const [bounds, setBounds] = useState({
    north: '',
    south: '',
    east: '',
    west: '',
  });

  const [input, setInput] = useState<TSMLReactConfig['defaults']>(
    defaults.defaults
  );

  const [coordinates, setCoordinates] = useState<Coordinates>({
    waitingForInput: input.mode !== 'search',
  });

  // detect input from URL search params
  useEffect(() => {
    const mode =
      searchParams.get('mode') === 'location'
        ? 'location'
        : searchParams.get('mode') === 'me'
        ? 'me'
        : 'search';
    const view = searchParams.get('view') === 'map' ? 'map' : 'table';
    const search = formatSearch(searchParams.get('search')?.toString() ?? '');
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
  }, [searchParams]);

  // handle geocoding or geolocation requests
  useEffect(() => {
    if (coordinates.waitingForInput || !bounds.north) return;
    setError();
    if (input.mode === 'location' && input.search) {
      setCoordinates({ waitingForInput: true });
      const url = window.location.hostname.endsWith('.test')
        ? 'geo.test'
        : 'geo.code4recovery.org';
      fetch(
        `https://${url}/api/geocode?${new URLSearchParams({
          application: 'tsml-ui',
          language: settings.language,
          referrer: window.location.href,
          search: input.search,
          ...bounds,
        })}`
      )
        .then(result => result.json())
        .then(({ results }) => {
          if (!results?.length) {
            throw new Error(
              formatString(strings.errors.geocoding, { address: input.search })
            );
          }
          const { geometry } = results[0];
          setCoordinates({
            latitude: geometry.location.lat,
            longitude: geometry.location.lng,
            waitingForInput: false,
          });
        })
        .catch(e => {
          setError(String(e));
          setCoordinates({
            latitude: undefined,
            longitude: undefined,
            waitingForInput: false,
          });
        });
    } else if (input.mode === 'me') {
      setCoordinates({ waitingForInput: true });
      setError();
      navigator.geolocation.getCurrentPosition(
        position => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            waitingForInput: false,
          });
        },
        () => {
          setError(strings.errors.geolocation);
          setCoordinates({
            waitingForInput: false,
          });
        },
        { timeout: 5000 }
      );
    } else {
      setCoordinates({ waitingForInput: false });
    }
  }, [input.mode, input.search, bounds.north]);

  return (
    <InputContext.Provider value={{ input, setBounds, ...coordinates }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInput = () => useContext(InputContext);
