import React, { useState, type ReactNode } from 'react';
import { SearchContext } from './SearchContext';

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const clearSearch = () => setSearchQuery('');

  return (
    <SearchContext.Provider 
      value={{ 
        searchQuery, 
        setSearchQuery, 
        isSearchFocused, 
        setIsSearchFocused,
        clearSearch 
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
