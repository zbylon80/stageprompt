// context/DataContext.tsx

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSongs, UseSongsReturn } from '../hooks/useSongs';
import { useSetlists, UseSetlistsReturn } from '../hooks/useSetlists';

interface DataContextValue {
  songs: UseSongsReturn;
  setlists: UseSetlistsReturn;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const songs = useSongs();
  const setlists = useSetlists();

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      songs,
      setlists,
    }),
    [songs, setlists]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
