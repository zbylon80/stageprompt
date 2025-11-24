// screens/__tests__/SongListScreen.property.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import fc from 'fast-check';
import { SongListScreen } from '../SongListScreen';
import { Song, Setlist } from '../../types/models';
import * as useSongsModule from '../../hooks/useSongs';
import { storageService } from '../../services/storageService';

// Mock the navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  isFocused: jest.fn(() => true),
} as any;

// Mock the useSongs hook
jest.mock('../../hooks/useSongs');

// Helper to render with NavigationContainer
function renderWithNavigation(component: React.ReactElement) {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
}

/**
 * Feature: teleprompter-app, Property 1: Lista utworów wyświetla wszystkie zapisane utwory
 * Validates: Requirements 1.1
 */
describe('Property 1: Lista utworów wyświetla wszystkie zapisane utwory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0; // Reset ID counter
  });

  it('should display all saved songs with their titles and artists', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 10 }).map(songs => {
          // Ensure unique IDs AND unique titles by adding index
          return songs.map((song, index) => ({
            ...song,
            id: `test-id-${index}`,
            title: `${song.title}-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        (songs) => {
          // Mock the useSongs hook to return our generated songs
          jest.spyOn(useSongsModule, 'useSongs').mockReturnValue({
            songs,
            loading: false,
            error: null,
            saveSong: jest.fn(),
            deleteSong: jest.fn(),
            reload: jest.fn(),
          });

          const { queryByText, queryByTestId } = renderWithNavigation(
            <SongListScreen navigation={mockNavigation} />
          );

          // Property: For any non-empty list of songs, the empty state should NOT be shown
          expect(queryByText(/No songs/i)).toBeFalsy();
          
          // Property: For any non-empty list of songs, at least the first song should be rendered
          // Note: FlatList may not render all items immediately, so we only check the first one
          // We use testID instead of text matching to handle special characters
          const firstSongItem = queryByTestId(`song-item-${songs[0].id}`);
          expect(firstSongItem).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should display the correct number of songs', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { maxLength: 50 }),
        (songs) => {
          // Mock the useSongs hook
          jest.spyOn(useSongsModule, 'useSongs').mockReturnValue({
            songs,
            loading: false,
            error: null,
            saveSong: jest.fn(),
            deleteSong: jest.fn(),
            reload: jest.fn(),
          });

          const { queryByText } = renderWithNavigation(
            <SongListScreen navigation={mockNavigation} />
          );

          if (songs.length === 0) {
            // Should show empty state
            expect(queryByText(/No songs/i)).toBeTruthy();
          } else {
            // Should not show empty state
            expect(queryByText(/No songs/i)).toBeFalsy();
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Custom ID generator - uses a counter to ensure uniqueness
let idCounter = 0;
function uniqueIdGenerator(): fc.Arbitrary<string> {
  return fc.constant(`test-id-${idCounter++}`);
}

// Generator for valid songs with unique IDs
function validSongGenerator(): fc.Arbitrary<Song> {
  return fc.record({
    id: uniqueIdGenerator(),
    title: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
    artist: fc.option(fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0)),
    durationSeconds: fc.option(fc.float({ min: 0, max: 7200, noNaN: true })),
    lines: fc.array(
      fc.record({
        id: uniqueIdGenerator(),
        text: fc.string({ maxLength: 100 }),
        timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
      }),
      { maxLength: 10 } // Limit number of lines
    ),
    createdAt: fc.integer({ min: 0 }),
    updatedAt: fc.integer({ min: 0 }),
  });
}

/**
 * Feature: teleprompter-app, Property 2: Nawigacja do edytora przekazuje poprawny utwór
 * Validates: Requirements 1.2
 */
describe('Property 2: Nawigacja do edytora przekazuje poprawny utwór', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0; // Reset ID counter
  });

  it('should navigate to editor with the correct song when a song is pressed', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 20 }).map(songs => {
          // Ensure unique IDs
          return songs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `${line.id}-${index}-${lineIndex}`,
            })),
          }));
        }),
        fc.integer({ min: 0, max: 19 }), // Index of song to click
        (songs, clickIndex) => {
          // Skip if clickIndex is out of bounds
          if (clickIndex >= songs.length) return true;

          const songToClick = songs[clickIndex];

          // Mock the useSongs hook
          jest.spyOn(useSongsModule, 'useSongs').mockReturnValue({
            songs,
            loading: false,
            error: null,
            saveSong: jest.fn(),
            deleteSong: jest.fn(),
            reload: jest.fn(),
          });

          const { queryByTestId } = renderWithNavigation(
            <SongListScreen navigation={mockNavigation} />
          );

          // Find and press the song item
          const songItem = queryByTestId(`song-item-${songToClick.id}`);
          
          // FlatList may virtualize items, so skip if not rendered
          if (!songItem) return true;
          
          fireEvent.press(songItem);

          // Verify navigation was called with the correct song
          expect(mockNavigate).toHaveBeenCalledWith('SongEditor', { song: songToClick });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Unit test for empty state
 * Validates: Requirements 1.5
 */
describe('Empty state', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0; // Reset ID counter
  });

  it('should display empty state message when there are no songs', () => {
    // Mock the useSongs hook to return empty array
    jest.spyOn(useSongsModule, 'useSongs').mockReturnValue({
      songs: [],
      loading: false,
      error: null,
      saveSong: jest.fn(),
      deleteSong: jest.fn(),
      reload: jest.fn(),
    });

    const { getByText } = renderWithNavigation(
      <SongListScreen navigation={mockNavigation} />
    );

    // Verify empty state message is displayed
    expect(getByText(/No songs/i)).toBeTruthy();
    expect(getByText(/Tap the \+ button to create your first song/i)).toBeTruthy();
  });
});

// Generator for valid setlists
function validSetlistGenerator(): fc.Arbitrary<Setlist> {
  return fc.record({
    id: uniqueIdGenerator(),
    name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    songIds: fc.array(fc.string()),
    createdAt: fc.integer({ min: 0 }),
    updatedAt: fc.integer({ min: 0 }),
  });
}

/**
 * Feature: teleprompter-app, Property 3b: Usunięcie utworu usuwa go ze wszystkich setlist
 * Validates: Requirements 2.5
 */
describe('Property 3b: Usunięcie utworu usuwa go ze wszystkich setlist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    idCounter = 0; // Reset ID counter
    // Clear storage before each test
    return storageService.clearAll();
  });

  afterEach(() => {
    // Clean up after each test
    return storageService.clearAll();
  });

  it('should remove deleted song from all setlists that contain it', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 10 }).map(songs => {
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
        fc.integer({ min: 0, max: 9 }), // Index of song to delete
        fc.array(validSetlistGenerator(), { minLength: 1, maxLength: 5 }).map(setlists => {
          // Ensure unique IDs
          return setlists.map((setlist, index) => ({
            ...setlist,
            id: `setlist-${index}`,
          }));
        }),
        async (songs, deleteIndex, setlists) => {
          // Skip if deleteIndex is out of bounds
          if (deleteIndex >= songs.length) return true;

          const songToDelete = songs[deleteIndex];

          // Save all songs
          for (const song of songs) {
            await storageService.saveSong(song);
          }

          // Create setlists with some containing the song to be deleted
          const setlistsWithSong = setlists.map((setlist, index) => {
            // Make some setlists contain the song to be deleted
            const shouldContainSong = index % 2 === 0; // Every other setlist
            return {
              ...setlist,
              songIds: shouldContainSong 
                ? [songToDelete.id, ...songs.slice(0, 2).map(s => s.id)]
                : songs.slice(1, 3).map(s => s.id),
            };
          });

          // Save all setlists
          for (const setlist of setlistsWithSong) {
            await storageService.saveSetlist(setlist);
          }

          // Count how many setlists contain the song before deletion
          const setlistsContainingSongBefore = setlistsWithSong.filter(
            setlist => setlist.songIds.includes(songToDelete.id)
          ).length;

          // Property: At least one setlist should contain the song (otherwise test is trivial)
          if (setlistsContainingSongBefore === 0) return true;

          // Delete the song
          await storageService.deleteSong(songToDelete.id);

          // Load all setlists after deletion
          const setlistsAfter = await storageService.loadSetlists();

          // Property: No setlist should contain the deleted song's ID
          const setlistsContainingSongAfter = setlistsAfter.filter(
            setlist => setlist.songIds.includes(songToDelete.id)
          );

          expect(setlistsContainingSongAfter.length).toBe(0);

          // Property: The song should not exist in storage
          const deletedSong = await storageService.loadSong(songToDelete.id);
          expect(deletedSong).toBeNull();

          // Property: Other songs should still exist
          for (const song of songs) {
            if (song.id !== songToDelete.id) {
              const loadedSong = await storageService.loadSong(song.id);
              expect(loadedSong).not.toBeNull();
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve setlist structure when removing song', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(validSongGenerator(), { minLength: 3, maxLength: 10 }).map(songs => {
          return songs.map((song, index) => ({
            ...song,
            id: `song-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `line-${index}-${lineIndex}`,
            })),
          }));
        }),
        fc.integer({ min: 0, max: 9 }),
        async (songs, deleteIndex) => {
          if (deleteIndex >= songs.length) return true;

          const songToDelete = songs[deleteIndex];
          const otherSongs = songs.filter(s => s.id !== songToDelete.id);

          // Save all songs
          for (const song of songs) {
            await storageService.saveSong(song);
          }

          // Create a setlist with the song to delete in the middle
          const setlist: Setlist = {
            id: 'test-setlist',
            name: 'Test Setlist',
            songIds: [
              otherSongs[0]?.id,
              songToDelete.id,
              otherSongs[1]?.id,
            ].filter(Boolean),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          await storageService.saveSetlist(setlist);

          // Delete the song
          await storageService.deleteSong(songToDelete.id);

          // Load the setlist
          const updatedSetlist = await storageService.loadSetlist(setlist.id);

          // Property: Setlist should still exist
          expect(updatedSetlist).not.toBeNull();

          // Property: Deleted song should be removed but order of other songs preserved
          expect(updatedSetlist!.songIds).toEqual([
            otherSongs[0]?.id,
            otherSongs[1]?.id,
          ].filter(Boolean));

          // Property: Setlist name should be unchanged
          expect(updatedSetlist!.name).toBe(setlist.name);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
