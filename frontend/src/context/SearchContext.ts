import { createContext } from 'react';

export interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  clearSearch: () => void;
}

export const SearchContext = createContext<SearchContextType | undefined>(undefined);
