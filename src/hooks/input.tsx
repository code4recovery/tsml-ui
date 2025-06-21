import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { defaults } from './settings';

const InputContext = createContext<{
  input: TSMLReactConfig['defaults'];
  setInput: React.Dispatch<React.SetStateAction<TSMLReactConfig['defaults']>>;
}>({ input: defaults.defaults, setInput: () => {} });

export const InputProvider = ({ children }: PropsWithChildren) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [input, setInput] = useState<TSMLReactConfig['defaults']>(
    defaults.defaults
  );

  // detect initial input from URL search params
  useEffect(() => {
    const mode =
      searchParams.get('mode') === 'location'
        ? 'location'
        : searchParams.get('me')
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
      ? `${searchParams.get('distance')}`.split('/')
      : [];

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
      distance: input.distance.join('/'),
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

  return (
    <InputContext.Provider value={{ input, setInput }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInput = () => useContext(InputContext);
