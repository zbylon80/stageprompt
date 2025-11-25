// context/SettingsContext.tsx

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSettings, UseSettingsReturn } from '../hooks/useSettings';
import { useKeyMapping, UseKeyMappingReturn } from '../hooks/useKeyMapping';

interface SettingsContextValue {
  settings: UseSettingsReturn;
  keyMapping: UseKeyMappingReturn;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const settings = useSettings();
  const keyMapping = useKeyMapping();

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      settings,
      keyMapping,
    }),
    [settings, keyMapping]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
}
