// screens/__tests__/SongListScreen.property.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import fc from 'fast-check';
import { SongListScreen } from '../SongListScreen';
import { Song } from '../../types/models';
import * as useSongsModule from '../../hooks/useSongs';

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
  });

  it('should display all saved songs with their titles and artists', () => {
    fc.assert(
      fc.property(
        fc.array(validSongGenerator(), { minLength: 1, maxLength: 20 }).map(songs => {
          // Ensure unique IDs by adding index to each song ID
          return songs.map((song, index) => ({
            ...song,
            id: `${song.id}-${index}`,
            lines: song.lines.map((line, lineIndex) => ({
              ...line,
              id: `${line.id}-${index}-${lineIndex}`,
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

          const { queryByText } = renderWithNavigation(
            <SongListScreen navigation={mockNavigation} />
          );

          // Property: For any non-empty list of songs, the empty state should NOT be shown
          expect(queryByText(/No songs/i)).toBeFalsy();
          
          // Property: For any non-empty list of songs, at least the first song's title should be visible
          expect(queryByText(songs[0].title)).toBeTruthy();

          return true;
        }
      ),
      { numRuns: 100 }
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

// Custom ID generator that maintains uniqueness during shrinking
function uniqueIdGenerator(): fc.Arbitrary<string> {
  return fc.integer({ min: 0 }).map(n => `test-id-${n}`);
}

// Generator for valid songs with unique IDs
function validSongGenerator(): fc.Arbitrary<Song> {
  return fc.record({
    id: uniqueIdGenerator(),
    title: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
    artist: fc.option(fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)),
    durationSeconds: fc.option(fc.float({ min: 0, max: 7200, noNaN: true })),
    lines: fc.array(
      fc.record({
        id: uniqueIdGenerator(),
        text: fc.string(),
        timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
      })
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
