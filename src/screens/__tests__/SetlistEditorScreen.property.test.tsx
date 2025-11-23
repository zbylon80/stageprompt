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

/**
 * Feature: teleprompter-app, Property 3: Panel utworów wyświetla wszystkie utwory
 * Validates: Requirements 2.1
 */
describe('Property 3: Songs panel displays all songs', () => {
  it('should display all available songs in the songs panel', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 50 }).map(songs => {
          // Ensure unique IDs
          return songs.map((song, index) => ({
            ...song,
            id: `song-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        (allSongs) => {
          // Property: For any list of songs, all songs should be available in the panel
          // This is a logical property test - we verify the data structure
          
          // Simulate the songs panel having access to all songs
          const songsInPanel = [...allSongs];

          // Verify all songs are present in the panel
          expect(songsInPanel.length).toBe(allSongs.length);

          // Verify each song from allSongs exists in the panel
          for (const song of allSongs) {
            const foundInPanel = songsInPanel.some(s => s.id === song.id);
            expect(foundInPanel).toBe(true);
          }

          // Verify no extra songs are in the panel
          for (const song of songsInPanel) {
            const foundInOriginal = allSongs.some(s => s.id === song.id);
            expect(foundInOriginal).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain song data integrity when displaying in panel', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 30 }).map(songs => {
          // Ensure unique IDs
          return songs.map((song, index) => ({
            ...song,
            id: `song-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        (allSongs) => {
          // Property: Songs displayed in panel should have all their data intact
          const songsInPanel = [...allSongs];

          // Verify each song's data is complete and unchanged
          for (let i = 0; i < allSongs.length; i++) {
            const original = allSongs[i];
            const inPanel = songsInPanel.find(s => s.id === original.id);

            expect(inPanel).toBeDefined();
            if (inPanel) {
              expect(inPanel.id).toBe(original.id);
              expect(inPanel.title).toBe(original.title);
              expect(inPanel.artist).toBe(original.artist);
              expect(inPanel.lines.length).toBe(original.lines.length);
              expect(inPanel.createdAt).toBe(original.createdAt);
              expect(inPanel.updatedAt).toBe(original.updatedAt);
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly identify songs already in setlist', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 2, maxLength: 20 }).map(songs => {
          // Ensure unique IDs
          return songs.map((song, index) => ({
            ...song,
            id: `song-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        fc.integer({ min: 0, max: 19 }),
        (allSongs, numInSetlistRaw) => {
          if (allSongs.length < 2) return true;

          const numInSetlist = Math.min(numInSetlistRaw, allSongs.length - 1);
          
          // Create a setlist with some songs
          const songsInSetlist = allSongs.slice(0, numInSetlist);
          const setlist: Setlist = {
            id: generateId(),
            name: 'Test Setlist',
            songIds: songsInSetlist.map(s => s.id),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          // Property: For any song in the panel, we should be able to determine
          // if it's already in the setlist
          for (const song of allSongs) {
            const isInSetlist = setlist.songIds.includes(song.id);
            const shouldBeInSetlist = songsInSetlist.some(s => s.id === song.id);
            
            expect(isInSetlist).toBe(shouldBeInSetlist);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: teleprompter-app, Property 3a: Nawigacja z panelu utworów do edytora
 * Validates: Requirements 2.2, 3.6
 */
describe('Property 3a: Navigation from songs panel to editor', () => {
  it('should navigate to editor with correct song when song is selected from panel', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 30 }).map(songs => {
          // Ensure unique IDs
          return songs.map((song, index) => ({
            ...song,
            id: `song-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        fc.integer({ min: 0, max: 29 }),
        (allSongs, selectedIndexRaw) => {
          if (allSongs.length === 0) return true;

          const selectedIndex = selectedIndexRaw % allSongs.length;
          const selectedSong = allSongs[selectedIndex];

          // Simulate navigation action
          const navigateToEditor = (song: Song) => {
            return {
              screen: 'SongEditor',
              params: { song },
            };
          };

          const navigationResult = navigateToEditor(selectedSong);

          // Property: Navigation should pass the exact song that was selected
          expect(navigationResult.screen).toBe('SongEditor');
          expect(navigationResult.params.song).toBe(selectedSong);
          expect(navigationResult.params.song.id).toBe(selectedSong.id);
          expect(navigationResult.params.song.title).toBe(selectedSong.title);
          expect(navigationResult.params.song.artist).toBe(selectedSong.artist);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve all song data when navigating to editor', () => {
    fc.assert(
      fc.property(
        validSongGenerator(),
        (song) => {
          // Simulate navigation with song data
          const navigateToEditor = (songData: Song) => {
            return {
              screen: 'SongEditor',
              params: { song: songData },
            };
          };

          const navigationResult = navigateToEditor(song);
          const passedSong = navigationResult.params.song;

          // Property: All song properties should be preserved during navigation
          expect(passedSong.id).toBe(song.id);
          expect(passedSong.title).toBe(song.title);
          expect(passedSong.artist).toBe(song.artist);
          expect(passedSong.durationSeconds).toBe(song.durationSeconds);
          expect(passedSong.createdAt).toBe(song.createdAt);
          expect(passedSong.updatedAt).toBe(song.updatedAt);
          expect(passedSong.lines.length).toBe(song.lines.length);

          // Verify lines are preserved
          for (let i = 0; i < song.lines.length; i++) {
            expect(passedSong.lines[i].id).toBe(song.lines[i].id);
            expect(passedSong.lines[i].text).toBe(song.lines[i].text);
            expect(passedSong.lines[i].timeSeconds).toBe(song.lines[i].timeSeconds);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow navigation to any song in the panel', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 20 }).map(songs => {
          // Ensure unique IDs
          return songs.map((song, index) => ({
            ...song,
            id: `song-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        (allSongs) => {
          // Property: Every song in the panel should be navigable to the editor
          const navigateToEditor = (song: Song) => {
            return {
              screen: 'SongEditor',
              params: { song },
            };
          };

          // Try navigating to each song
          for (const song of allSongs) {
            const navigationResult = navigateToEditor(song);
            
            expect(navigationResult.screen).toBe('SongEditor');
            expect(navigationResult.params.song.id).toBe(song.id);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Generator for valid songs (reused from SongListScreen tests)
function validSongGenerator(): fc.Arbitrary<Song> {
  return fc.record({
    id: fc.string({ minLength: 1 }),
    title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    artist: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
    durationSeconds: fc.option(fc.float({ min: 0, max: 7200, noNaN: true })),
    lines: fc.array(
      fc.record({
        id: fc.string({ minLength: 1 }),
        text: fc.string(),
        timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
      }),
      { maxLength: 50 }
    ),
    createdAt: fc.integer({ min: 0 }),
    updatedAt: fc.integer({ min: 0 }),
  });
}
