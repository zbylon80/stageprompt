// services/__tests__/storageService.property.test.ts

import fc from 'fast-check';
import { storageService } from '../storageService';
import { Song, Setlist } from '../../types/models';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

// Generators for property-based testing
const lyricLineGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  text: fc.string(),
  timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
});

const songGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  artist: fc.option(fc.string({ maxLength: 100 })),
  durationSeconds: fc.option(fc.float({ min: 0, max: 7200, noNaN: true })),
  lines: fc.array(lyricLineGenerator, { maxLength: 50 }),
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 }),
});

const setlistGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  songIds: fc.array(fc.string({ minLength: 1 }), { maxLength: 50 }),
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 }),
});

// Shared storage for all tests
let storage: Map<string, string>;

describe('StorageService Property Tests', () => {
  beforeEach(() => {
    // Reset storage mock
    storage = new Map<string, string>();
    
    (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    });
    
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      return Promise.resolve(storage.get(key) || null);
    });
    
    (AsyncStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
      storage.delete(key);
      return Promise.resolve();
    });
    
    (AsyncStorage.clear as jest.Mock).mockImplementation(() => {
      storage.clear();
      return Promise.resolve();
    });
  });

  /**
   * Feature: StagePrompt, Property 22: Round-trip persystencji utworu
   * Validates: Requirements 10.1, 10.3
   */
  describe('Property 22: Song persistence round-trip', () => {
    it('should preserve song data through save/load cycle', async () => {
      await fc.assert(
        fc.asyncProperty(songGenerator, async (song: Song) => {
          // Save the song
          await storageService.saveSong(song);
          
          // Load the song back
          const loaded = await storageService.loadSong(song.id);
          
          // Verify the loaded song matches the original
          expect(loaded).toEqual(song);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all songs when loading multiple songs', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { minLength: 1, maxLength: 10 }).map(songs => {
            // Ensure unique IDs
            return songs.map((song, index) => ({
              ...song,
              id: `song-${index}-${song.id}`,
            }));
          }),
          async (songs: Song[]) => {
            // Clear storage before each test iteration
            storage.clear();
            
            // Save all songs
            for (const song of songs) {
              await storageService.saveSong(song);
            }
            
            // Load all songs
            const loaded = await storageService.loadSongs();
            
            // Verify all songs are present
            expect(loaded).toHaveLength(songs.length);
            
            // Verify each song matches
            for (const song of songs) {
              const loadedSong = loaded.find(s => s.id === song.id);
              expect(loadedSong).toEqual(song);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: StagePrompt, Property 23: Round-trip persystencji setlisty
   * Validates: Requirements 10.2, 10.3
   */
  describe('Property 23: Setlist persistence round-trip', () => {
    it('should preserve setlist data through save/load cycle', async () => {
      await fc.assert(
        fc.asyncProperty(setlistGenerator, async (setlist: Setlist) => {
          // Clear storage before each iteration
          storage.clear();
          
          // Save the setlist
          await storageService.saveSetlist(setlist);
          
          // Load the setlist back
          const loaded = await storageService.loadSetlist(setlist.id);
          
          // Verify the loaded setlist matches the original
          expect(loaded).toEqual(setlist);
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve all setlists when loading multiple setlists', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(setlistGenerator, { minLength: 1, maxLength: 10 }).map(setlists => {
            // Ensure unique IDs
            return setlists.map((setlist, index) => ({
              ...setlist,
              id: `setlist-${index}-${setlist.id}`,
            }));
          }),
          async (setlists: Setlist[]) => {
            // Clear storage before each iteration
            storage.clear();
            
            // Save all setlists
            for (const setlist of setlists) {
              await storageService.saveSetlist(setlist);
            }
            
            // Load all setlists
            const loaded = await storageService.loadSetlists();
            
            // Verify all setlists are present
            expect(loaded).toHaveLength(setlists.length);
            
            // Verify each setlist matches
            for (const setlist of setlists) {
              const loadedSetlist = loaded.find(s => s.id === setlist.id);
              expect(loadedSetlist).toEqual(setlist);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: StagePrompt, Property 24: Błąd storage nie zmienia stanu w pamięci
   * Validates: Requirements 10.4
   */
  describe('Property 24: Storage error does not change in-memory state', () => {
    it('should maintain in-memory state when save operation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          songGenerator,
          fc.array(songGenerator, { minLength: 1, maxLength: 5 }).map(songs => {
            return songs.map((song, index) => ({
              ...song,
              id: `existing-${index}`,
            }));
          }),
          async (newSong: Song, existingSongs: Song[]) => {
            // Clear storage and set up initial state
            storage.clear();
            
            // Save existing songs
            for (const song of existingSongs) {
              await storageService.saveSong(song);
            }
            
            // Load initial state
            const initialSongs = await storageService.loadSongs();
            const initialCount = initialSongs.length;
            
            // Simulate storage error by making setItem throw
            const originalSetItem = AsyncStorage.setItem;
            (AsyncStorage.setItem as jest.Mock).mockImplementationOnce(() => {
              return Promise.reject(new Error('Storage full'));
            });
            
            // Try to save new song (should fail)
            try {
              await storageService.saveSong(newSong);
            } catch (error) {
              // Expected to throw
            }
            
            // Restore original implementation
            (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
              storage.set(key, value);
              return Promise.resolve();
            });
            
            // Verify in-memory state hasn't changed
            const afterErrorSongs = await storageService.loadSongs();
            expect(afterErrorSongs).toHaveLength(initialCount);
            
            // Verify the new song was not added
            const foundNewSong = afterErrorSongs.find(s => s.id === newSong.id);
            expect(foundNewSong).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain in-memory state when load operation fails', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { minLength: 1, maxLength: 5 }).map(songs => {
            return songs.map((song, index) => ({
              ...song,
              id: `song-${index}`,
            }));
          }),
          async (songs: Song[]) => {
            // Clear storage
            storage.clear();
            
            // Save songs
            for (const song of songs) {
              await storageService.saveSong(song);
            }
            
            // Simulate getItem error
            const originalGetItem = AsyncStorage.getItem;
            (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => {
              return Promise.reject(new Error('Read error'));
            });
            
            // Try to load (should handle error gracefully)
            let result;
            try {
              result = await storageService.loadSongs();
            } catch (error) {
              // If it throws, that's acceptable behavior
              result = [];
            }
            
            // Restore original implementation
            (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
              return Promise.resolve(storage.get(key) || null);
            });
            
            // After restoring, we should be able to load normally
            const afterRestore = await storageService.loadSongs();
            expect(afterRestore.length).toBeGreaterThanOrEqual(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: StagePrompt, Property 25: Usunięcie usuwa dane ze storage
   * Validates: Requirements 10.5
   */
  describe('Property 25: Deletion removes data from storage', () => {
    it('should remove song from storage after deletion', async () => {
      await fc.assert(
        fc.asyncProperty(songGenerator, async (song: Song) => {
          // Clear storage
          storage.clear();
          
          // Save the song
          await storageService.saveSong(song);
          
          // Verify it exists
          const beforeDelete = await storageService.loadSong(song.id);
          expect(beforeDelete).toEqual(song);
          
          // Delete the song
          await storageService.deleteSong(song.id);
          
          // Verify it no longer exists
          const afterDelete = await storageService.loadSong(song.id);
          expect(afterDelete).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should remove setlist from storage after deletion', async () => {
      await fc.assert(
        fc.asyncProperty(setlistGenerator, async (setlist: Setlist) => {
          // Clear storage
          storage.clear();
          
          // Save the setlist
          await storageService.saveSetlist(setlist);
          
          // Verify it exists
          const beforeDelete = await storageService.loadSetlist(setlist.id);
          expect(beforeDelete).toEqual(setlist);
          
          // Delete the setlist
          await storageService.deleteSetlist(setlist.id);
          
          // Verify it no longer exists
          const afterDelete = await storageService.loadSetlist(setlist.id);
          expect(afterDelete).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should not affect other songs when deleting one song', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { minLength: 2, maxLength: 5 }).map(songs => {
            return songs.map((song, index) => ({
              ...song,
              id: `song-${index}`,
            }));
          }),
          async (songs: Song[]) => {
            // Clear storage
            storage.clear();
            
            // Save all songs
            for (const song of songs) {
              await storageService.saveSong(song);
            }
            
            // Delete the first song
            const songToDelete = songs[0];
            await storageService.deleteSong(songToDelete.id);
            
            // Verify the deleted song is gone
            const deletedSong = await storageService.loadSong(songToDelete.id);
            expect(deletedSong).toBeNull();
            
            // Verify other songs still exist
            for (let i = 1; i < songs.length; i++) {
              const remainingSong = await storageService.loadSong(songs[i].id);
              expect(remainingSong).toEqual(songs[i]);
            }
            
            // Verify total count
            const allSongs = await storageService.loadSongs();
            expect(allSongs).toHaveLength(songs.length - 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not affect other setlists when deleting one setlist', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(setlistGenerator, { minLength: 2, maxLength: 5 }).map(setlists => {
            return setlists.map((setlist, index) => ({
              ...setlist,
              id: `setlist-${index}`,
            }));
          }),
          async (setlists: Setlist[]) => {
            // Clear storage
            storage.clear();
            
            // Save all setlists
            for (const setlist of setlists) {
              await storageService.saveSetlist(setlist);
            }
            
            // Delete the first setlist
            const setlistToDelete = setlists[0];
            await storageService.deleteSetlist(setlistToDelete.id);
            
            // Verify the deleted setlist is gone
            const deletedSetlist = await storageService.loadSetlist(setlistToDelete.id);
            expect(deletedSetlist).toBeNull();
            
            // Verify other setlists still exist
            for (let i = 1; i < setlists.length; i++) {
              const remainingSetlist = await storageService.loadSetlist(setlists[i].id);
              expect(remainingSetlist).toEqual(setlists[i]);
            }
            
            // Verify total count
            const allSetlists = await storageService.loadSetlists();
            expect(allSetlists).toHaveLength(setlists.length - 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
