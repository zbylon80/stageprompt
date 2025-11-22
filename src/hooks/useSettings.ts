// hooks/useSettings.ts

import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '../types/models';
import { storageService } from '../services/storageService';

export interface UseSettingsReturn {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  saveSettings: (settings: AppSettings) => Promise<void>;
  reload: () => Promise<void>;
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSettings = await storageService.loadSettings();
      setSettings(loadedSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się załadować ustawień.';
      setError(errorMessage);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: AppSettings) => {
    try {
      setError(null);
      await storageService.saveSettings(newSettings);
      // Update local state immediately
      setSettings(newSettings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zapisać ustawień.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    reload: loadSettings,
  };
}
