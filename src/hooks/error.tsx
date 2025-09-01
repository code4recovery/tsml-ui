import { createContext, PropsWithChildren, useContext, useState } from 'react';

const ErrorContext = createContext<{
  error?: string;
  setError: (message?: string) => void;
}>({ setError: () => {} });

export const ErrorProvider = ({ children }: PropsWithChildren) => {
  const [error, setError] = useState<string | undefined>();
  return (
    <ErrorContext.Provider value={{ error, setError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => useContext(ErrorContext);
