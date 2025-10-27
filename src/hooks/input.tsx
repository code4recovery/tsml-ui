import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { validateInput } from '../helpers';
import { defaults, useSettings } from './settings';

const InputContext = createContext<{
  input: TSMLReactConfig['defaults'];
}>({ input: defaults.defaults });

export const InputProvider = ({ children }: PropsWithChildren) => {
  const [searchParams] = useSearchParams();

  const { settings } = useSettings();

  const [input, setInput] = useState<TSMLReactConfig['defaults']>(
    validateInput(searchParams, settings)
  );

  // detect input from URL search params
  useEffect(() => {
    setInput(validateInput(searchParams, settings));
  }, [searchParams]);

  return (
    <InputContext.Provider value={{ input }}>{children}</InputContext.Provider>
  );
};

export const useInput = () => useContext(InputContext);
