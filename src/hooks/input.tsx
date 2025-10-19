import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import { validateInput } from '../helpers';
import { defaults } from './settings';

const InputContext = createContext<{
  input: TSMLReactConfig['defaults'];
}>({ input: defaults.defaults });

export const InputProvider = ({ children }: PropsWithChildren) => {
  const [searchParams] = useSearchParams();

  const [input, setInput] = useState<TSMLReactConfig['defaults']>(
    validateInput(searchParams)
  );

  // detect input from URL search params
  useEffect(() => {
    setInput(validateInput(searchParams));
  }, [searchParams]);

  return (
    <InputContext.Provider value={{ input }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInput = () => useContext(InputContext);
