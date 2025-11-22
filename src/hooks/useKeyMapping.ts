// hooks/useKeyMapping.ts

import { useState, useEffect, useCallback } from 'react';
import { KeyMapping } from '../types/models';
import { storageService } from '../services/storageService';

export interface UseKeyMappingReturn {
  keyMapping: KeyMapping | null;
  loading: boolean;
  error: string | null;
  saveKeyMapping: (mapping: KeyMapping) => Promise<void>;
  reload: () => Promise<void>;
}

export function useKeyMapping(): UseKeyMappingReturn {
  const [keyMapping, setKeyMapping] = useState<KeyMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadKeyMapping = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedMapping = await storageService.loadKeyMapping();
      setKeyMapping(loadedMapping);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się załadować mapowania klawiszy.';
      setError(errorMessage);
      console.error('Error loading key mapping:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveKeyMapping = useCallback(async (mapping: KeyMapping) => {
    try {
      setError(null);
      await storageService.saveKeyMapping(mapping);
      // Update local state immediately
      setKeyMapping(mapping);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zapisać mapowania klawiszy.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadKeyMapping();
  }, [loadKeyMapping]);

  return {
    keyMapping,
    loading,
    error,
    saveKeyMapping,
    reload: loadKeyMapping,
  };
}
