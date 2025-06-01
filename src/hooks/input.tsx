import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { defaults } from './settings';

const InputContext = createContext<TSMLReactConfig['defaults']>(
  defaults.defaults
);

export const InputProvider = ({ children }: PropsWithChildren) => {
  const [searchParams] = useSearchParams();

  const [input, setInput] = useState<TSMLReactConfig['defaults']>(
    defaults.defaults
  );

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
    setInput(input => ({
      ...input,
      mode,
      region,
      search,
      time,
      type,
      view,
      weekday,
    }));
  }, [searchParams]);

  return (
    <InputContext.Provider value={input}>{children}</InputContext.Provider>
  );
};

export const useInput = () => useContext(InputContext);
