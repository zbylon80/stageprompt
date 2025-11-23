// services/storageService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, Setlist, AppSettings, KeyMapping } from '../types/models';
import { validateImportData } from '../utils/validation';

// Storage keys
const KEYS = {
  SONGS_INDEX: '@songs_index',
  SETLISTS_INDEX: '@setlists_index',
  SETTINGS: '@settings',
  KEY_MAPPING: '@keyMapping',
  SONG_PREFIX: '@songs:',
  SETLIST_PREFIX: '@setlists:',
};

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  fontSize: 48,
  anchorYPercent: 0.4,
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
  marginHorizontal: 40,
  lineHeight: 60,
};

// Default key mapping
const DEFAULT_KEY_MAPPING: KeyMapping = {};

// User-facing error messages (UTF-8 with correct Polish diacritics)
const ERROR_MESSAGES = {
  saveSong: 'Nie udało się zapisać utworu. Sprawdź dostępną pamięć.',
  loadSongs: 'Nie udało się załadować utworów.',
  deleteSong: 'Nie udało się usunąć utworu.',
  saveSetlist: 'Nie udało się zapisać setlisty. Sprawdź dostępną pamięć.',
  loadSetlists: 'Nie udało się załadować setlist.',
  deleteSetlist: 'Nie udało się usunąć setlisty.',
  saveSettings: 'Nie udało się zapisać ustawień.',
  loadSettings: 'Nie udało się załadować ustawień.',
  saveKeyMapping: 'Nie udało się zapisać mapowania klawiszy.',
  loadKeyMapping: 'Nie udało się załadować mapowania klawiszy.',
  exportData: 'Nie udało się wyeksportować danych.',
  importData: 'Nie udało się zaimportować danych.',
  clearAll: 'Nie udało się wyczyścić danych.',
};

export interface StorageService {
  // Songs
  saveSong(song: Song): Promise<void>;
  loadSongs(): Promise<Song[]>;
  loadSong(id: string): Promise<Song | null>;
  deleteSong(id: string): Promise<void>;

  // Setlists
  saveSetlist(setlist: Setlist): Promise<void>;
  loadSetlists(): Promise<Setlist[]>;
  loadSetlist(id: string): Promise<Setlist | null>;
  deleteSetlist(id: string): Promise<void>;

  // Settings
  saveSettings(settings: AppSettings): Promise<void>;
  loadSettings(): Promise<AppSettings>;

  // Key Mappings
  saveKeyMapping(mapping: KeyMapping): Promise<void>;
  loadKeyMapping(): Promise<KeyMapping>;

  // Export/Import
  exportData(): Promise<string>;
  importData(jsonString: string): Promise<void>;

  // Utility
  clearAll(): Promise<void>;
}

class StorageServiceImpl implements StorageService {
  // Songs
  async saveSong(song: Song): Promise<void> {
    try {
      const key = `${KEYS.SONG_PREFIX}${song.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(song));

      // Update index
      const index = await this.loadSongsIndex();
      if (!index.includes(song.id)) {
        index.push(song.id);
        await AsyncStorage.setItem(KEYS.SONGS_INDEX, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Error saving song:', error);
      throw new Error(ERROR_MESSAGES.saveSong);
    }
  }

  async loadSongs(): Promise<Song[]> {
    try {
      const index = await this.loadSongsIndex();
      const songs: Song[] = [];

      for (const id of index) {
        const song = await this.loadSong(id);
        if (song) {
          songs.push(song);
        }
      }

      return songs;
    } catch (error) {
      console.error('Error loading songs:', error);
      throw new Error(ERROR_MESSAGES.loadSongs);
    }
  }

  async loadSong(id: string): Promise<Song | null> {
    try {
      const key = `${KEYS.SONG_PREFIX}${id}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading song:', error);
      return null;
    }
  }

  async deleteSong(id: string): Promise<void> {
    try {
      const key = `${KEYS.SONG_PREFIX}${id}`;
      await AsyncStorage.removeItem(key);

      // Update index
      const index = await this.loadSongsIndex();
      const newIndex = index.filter((songId) => songId !== id);
      await AsyncStorage.setItem(KEYS.SONGS_INDEX, JSON.stringify(newIndex));
    } catch (error) {
      console.error('Error deleting song:', error);
      throw new Error(ERROR_MESSAGES.deleteSong);
    }
  }

  private async loadSongsIndex(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SONGS_INDEX);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Setlists
  async saveSetlist(setlist: Setlist): Promise<void> {
    try {
      const key = `${KEYS.SETLIST_PREFIX}${setlist.id}`;
      await AsyncStorage.setItem(key, JSON.stringify(setlist));

      // Update index
      const index = await this.loadSetlistsIndex();
      if (!index.includes(setlist.id)) {
        index.push(setlist.id);
        await AsyncStorage.setItem(KEYS.SETLISTS_INDEX, JSON.stringify(index));
      }
    } catch (error) {
      console.error('Error saving setlist:', error);
      throw new Error(ERROR_MESSAGES.saveSetlist);
    }
  }

  async loadSetlists(): Promise<Setlist[]> {
    try {
      const index = await this.loadSetlistsIndex();
      const setlists: Setlist[] = [];

      for (const id of index) {
        const setlist = await this.loadSetlist(id);
        if (setlist) {
          setlists.push(setlist);
        }
      }

      return setlists;
    } catch (error) {
      console.error('Error loading setlists:', error);
      throw new Error(ERROR_MESSAGES.loadSetlists);
    }
  }

  async loadSetlist(id: string): Promise<Setlist | null> {
    try {
      const key = `${KEYS.SETLIST_PREFIX}${id}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading setlist:', error);
      return null;
    }
  }

  async deleteSetlist(id: string): Promise<void> {
    try {
      const key = `${KEYS.SETLIST_PREFIX}${id}`;
      await AsyncStorage.removeItem(key);

      // Update index
      const index = await this.loadSetlistsIndex();
      const newIndex = index.filter((setlistId) => setlistId !== id);
      await AsyncStorage.setItem(KEYS.SETLISTS_INDEX, JSON.stringify(newIndex));
    } catch (error) {
      console.error('Error deleting setlist:', error);
      throw new Error(ERROR_MESSAGES.deleteSetlist);
    }
  }

  private async loadSetlistsIndex(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETLISTS_INDEX);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Settings
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error(ERROR_MESSAGES.saveSettings);
    }
  }

  async loadSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Key Mappings
  async saveKeyMapping(mapping: KeyMapping): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.KEY_MAPPING, JSON.stringify(mapping));
    } catch (error) {
      console.error('Error saving key mapping:', error);
      throw new Error(ERROR_MESSAGES.saveKeyMapping);
    }
  }

  async loadKeyMapping(): Promise<KeyMapping> {
    try {
      const data = await AsyncStorage.getItem(KEYS.KEY_MAPPING);
      return data ? JSON.parse(data) : DEFAULT_KEY_MAPPING;
    } catch (error) {
      console.error('Error loading key mapping:', error);
      return DEFAULT_KEY_MAPPING;
    }
  }

  // Export/Import
  async exportData(): Promise<string> {
    try {
      const songs = await this.loadSongs();
      const setlists = await this.loadSetlists();

      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs,
        setlists,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error(ERROR_MESSAGES.exportData);
    }
  }

  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);

      if (!validateImportData(data)) {
        throw new Error('Dane importu są nieprawidłowe.');
      }

      // Import songs
      for (const song of data.songs) {
        await this.saveSong(song);
      }

      // Import setlists
      for (const setlist of data.setlists) {
        await this.saveSetlist(setlist);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Plik jest uszkodzony lub ma niepoprawny format.');
      }
      throw new Error(ERROR_MESSAGES.importData);
    }
  }

  // Utility
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw new Error(ERROR_MESSAGES.clearAll);
    }
  }
}

// Export singleton instance
export const storageService = new StorageServiceImpl();
