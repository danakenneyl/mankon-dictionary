'use client';

import { createContext, useState, useContext } from 'react';

const SearchContext = createContext({
  searchEng: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSearchEng: (value: boolean) => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchEng, setSearchEng] = useState(false);

  return (
    <SearchContext.Provider value={{ searchEng, setSearchEng }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);