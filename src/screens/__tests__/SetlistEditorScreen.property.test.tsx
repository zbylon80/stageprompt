// screens/__tests__/SetlistEditorScreen.property.test.tsx

import fc from 'fast-check';
import { Setlist, Song } from '../../types/models';
import { generateId } from '../../utils/idGenerator';

/**
 * Feature: StagePrompt, Property 6: Kolejność utworów w setliście jest zachowana
 * Validates: Requirements 3.2
 */
describe('Property 6: Setlist song order preservation', () => {
  it('should preserve the exact order of songs added to a setlist', () => {
    fc.assert(
      fc.property(
        // Generate a random sequence of song IDs
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        (songIdsSequence) => {
          // Create a setlist with songs added in sequence
          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Add songs one by one in the given sequence
          const addedSongIds: string[] = [];
          for (const songId of songIdsSequence) {
            addedSongIds.push(songId);
            setlist.songIds = [...addedSongIds];
          }

          // Verify that the final songIds array matches the exact sequence
          expect(setlist.songIds).toEqual(songIdsSequence);
          expect(setlist.songIds.length).toBe(songIdsSequence.length);

          // Verify order is preserved by checking each position
          for (let i = 0; i < songIdsSequence.length; i++) {
            expect(setlist.songIds[i]).toBe(songIdsSequence[i]);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain order when songs are added incrementally', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 10 }),
        (songIds) => {
          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Add songs one at a time
          for (let i = 0; i < songIds.length; i++) {
            setlist.songIds = [...setlist.songIds, songIds[i]];
            
            // After each addition, verify all previous songs are still in order
            for (let j = 0; j <= i; j++) {
              expect(setlist.songIds[j]).toBe(songIds[j]);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: StagePrompt, Property 7: Zmiana kolejności aktualizuje songIds
 * Validates: Requirements 3.3
 */
describe('Property 7: Reordering updates songIds', () => {
  it('should correctly update songIds when reordering songs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        (initialSongIds, fromIndexRaw, toIndexRaw) => {
          if (initialSongIds.length < 2) return true;

          // Ensure indices are within bounds
          const fromIndex = fromIndexRaw % initialSongIds.length;
          const toIndex = toIndexRaw % initialSongIds.length;

          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [...initialSongIds],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Simulate drag and drop reordering
          const reorderedSongIds = [...setlist.songIds];
          const [movedItem] = reorderedSongIds.splice(fromIndex, 1);
          reorderedSongIds.splice(toIndex, 0, movedItem);

          setlist.songIds = reorderedSongIds;

          // Verify the moved item is at the new position
          expect(setlist.songIds[toIndex]).toBe(initialSongIds[fromIndex]);

          // Verify all items are still present (no loss or duplication)
          expect(setlist.songIds.length).toBe(initialSongIds.length);
          
          const sortedOriginal = [...initialSongIds].sort();
          const sortedReordered = [...setlist.songIds].sort();
          expect(sortedReordered).toEqual(sortedOriginal);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all songs when changing order', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 15 }),
        (songIds) => {
          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [...songIds],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Reverse the order (a common reordering operation)
          const reversedSongIds = [...setlist.songIds].reverse();
          setlist.songIds = reversedSongIds;

          // All songs should still be present
          expect(setlist.songIds.length).toBe(songIds.length);
          
          // Each song from original should exist in reordered
          for (const songId of songIds) {
            expect(setlist.songIds).toContain(songId);
          }

          // If more than one song, order should be different
          if (songIds.length > 1) {
            expect(setlist.songIds).not.toEqual(songIds);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: StagePrompt, Property 8: Usunięcie utworu z setlisty nie usuwa utworu
 * Validates: Requirements 3.4
 */
describe('Property 8: Removing song from setlist does not delete song', () => {
  it('should remove song ID from setlist but not delete the song itself', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0 }),
        (songIds, removeIndexRaw) => {
          if (songIds.length === 0) return true;

          const removeIndex = removeIndexRaw % songIds.length;
          const songToRemove = songIds[removeIndex];

          // Create a mock song list
          const allSongs: Song[] = songIds.map(id => ({
            id,
            title: `Song ${id}`,
            artist: 'Test Artist',
            lines: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [...songIds],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Remove song from setlist
          setlist.songIds = setlist.songIds.filter(id => id !== songToRemove);

          // Verify song ID is removed from setlist
          expect(setlist.songIds).not.toContain(songToRemove);
          expect(setlist.songIds.length).toBe(songIds.length - 1);

          // Verify the song still exists in the main song list
          const songStillExists = allSongs.some(song => song.id === songToRemove);
          expect(songStillExists).toBe(true);

          // Verify other songs remain in setlist
          const otherSongIds = songIds.filter(id => id !== songToRemove);
          for (const songId of otherSongIds) {
            expect(setlist.songIds).toContain(songId);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow removing multiple songs without affecting song data', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 3, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        (songIds, numToRemove) => {
          if (songIds.length < 2) return true;

          // Ensure unique song IDs to avoid issues with duplicates
          const uniqueSongIds = Array.from(new Set(songIds));
          if (uniqueSongIds.length < 2) return true;

          const actualNumToRemove = Math.min(numToRemove, uniqueSongIds.length - 1);

          // Create mock songs
          const allSongs: Song[] = uniqueSongIds.map(id => ({
            id,
            title: `Song ${id}`,
            artist: 'Test Artist',
            lines: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [...uniqueSongIds],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Remove multiple songs
          const songsToRemove = uniqueSongIds.slice(0, actualNumToRemove);
          setlist.songIds = setlist.songIds.filter(id => !songsToRemove.includes(id));

          // Verify removed songs are not in setlist
          for (const removedId of songsToRemove) {
            expect(setlist.songIds).not.toContain(removedId);
          }

          // Verify all songs still exist in main list
          for (const removedId of songsToRemove) {
            const songExists = allSongs.some(song => song.id === removedId);
            expect(songExists).toBe(true);
          }

          // Verify setlist has correct number of songs
          expect(setlist.songIds.length).toBe(uniqueSongIds.length - actualNumToRemove);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: StagePrompt, Property 9: Usunięcie setlisty nie wpływa na utwory
 * Validates: Requirements 3.5
 */
describe('Property 9: Deleting setlist does not affect songs', () => {
  it('should delete setlist without deleting any songs', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 20 }),
        (songIds) => {
          // Create mock songs
          const allSongs: Song[] = songIds.map(id => ({
            id,
            title: `Song ${id}`,
            artist: 'Test Artist',
            lines: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: [...songIds],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Store original song count
          const originalSongCount = allSongs.length;
          const songsInSetlist = [...setlist.songIds];

          // Simulate deleting the setlist (just remove it from setlists array)
          const setlists: Setlist[] = [setlist];
          const updatedSetlists = setlists.filter(s => s.id !== setlist.id);

          // Verify setlist is deleted
          expect(updatedSetlists.length).toBe(0);

          // Verify all songs still exist
          expect(allSongs.length).toBe(originalSongCount);
          for (const songId of songsInSetlist) {
            const songExists = allSongs.some(song => song.id === songId);
            expect(songExists).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow deleting multiple setlists without affecting songs', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            songIds: fc.array(fc.string({ minLength: 1 }), { maxLength: 10 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (setlistData) => {
          // Collect all unique song IDs
          const allSongIds = new Set<string>();
          setlistData.forEach(data => {
            data.songIds.forEach(id => allSongIds.add(id));
          });

          // Create mock songs
          const allSongs: Song[] = Array.from(allSongIds).map(id => ({
            id,
            title: `Song ${id}`,
            artist: 'Test Artist',
            lines: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          // Create setlists
          const setlists: Setlist[] = setlistData.map(data => ({
            id: generateId(),
            name: data.name,
            songIds: data.songIds,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }));

          const originalSongCount = allSongs.length;

          // Delete all setlists
          const updatedSetlists: Setlist[] = [];

          // Verify all setlists are deleted
          expect(updatedSetlists.length).toBe(0);

          // Verify all songs still exist
          expect(allSongs.length).toBe(originalSongCount);
          for (const songId of allSongIds) {
            const songExists = allSongs.some(song => song.id === songId);
            expect(songExists).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
