// hooks/useSongs.ts

import { useState, useEffect, useCallback } from 'react';
import { Song } from '../types/models';
import { storageService } from '../services/storageService';

export interface UseSongsReturn {
  songs: Song[];
  loading: boolean;
  error: string | null;
  saveSong: (song: Song) => Promise<void>;
  deleteSong: (id: string) => Promise<void>;
  reload: () => Promise<void>;
}

export function useSongs(): UseSongsReturn {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSongs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedSongs = await storageService.loadSongs();
      setSongs(loadedSongs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load songs.';
      setError(errorMessage);
      console.error('Error loading songs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSong = useCallback(async (song: Song) => {
    try {
      setError(null);
      await storageService.saveSong(song);
      // Reload songs to update the list
      await loadSongs();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save song.';
      setError(errorMessage);
      throw err;
    }
  }, [loadSongs]);

  const deleteSong = useCallback(async (id: string) => {
    try {
      setError(null);
      await storageService.deleteSong(id);
      // Update local state immediately
      setSongs(prevSongs => prevSongs.filter(song => song.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete song.';
      setError(errorMessage);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  return {
    songs,
    loading,
    error,
    saveSong,
    deleteSong,
    reload: loadSongs,
  };
}
