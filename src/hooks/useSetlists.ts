// hooks/useSetlists.ts

import { useState, useEffect, useCallback } from 'react';
import { Setlist } from '../types/models';
import { storageService } from '../services/storageService';

export interface UseSetlistsReturn {
  setlists: Setlist[];
  loading: boolean;
  error: string | null;
  saveSetlist: (setlist: Setlist) => Promise<void>;
  deleteSetlist: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useSetlists(): UseSetlistsReturn {
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSetlists = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSetlists = await storageService.loadSetlists();
      setSetlists(loadedSetlists);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się załadować setlist.';
      setError(errorMessage);
      console.error('Error loading setlists:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSetlist = useCallback(async (setlist: Setlist) => {
    try {
      setError(null);
      await storageService.saveSetlist(setlist);
      // Reload setlists to update the list
      await loadSetlists();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się zapisać setlisty.';
      setError(errorMessage);
      throw err;
    }
  }, [loadSetlists]);

  const deleteSetlist = useCallback(async (id: string) => {
    try {
      setError(null);
      await storageService.deleteSetlist(id);
      // Update local state immediately
      setSetlists(prevSetlists => prevSetlists.filter(setlist => setlist.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nie udało się usunąć setlisty.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadSetlists();
  }, [loadSetlists]);

  return {
    setlists,
    loading,
    error,
    saveSetlist,
    deleteSetlist,
    reload: loadSetlists,
  };
}
