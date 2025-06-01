import { createContext, PropsWithChildren, useContext } from 'react';

const FilterContext = createContext<{
  latitude?: number;
  longitude?: number;
  filteredSlugs?: string[];
}>({});

export const FilterProvider = ({ children }: PropsWithChildren) => {
  return <FilterContext.Provider value={{}}>{children}</FilterContext.Provider>;
};

export const useFilter = () => useContext(FilterContext);
