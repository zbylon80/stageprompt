/**
 * Unit tests for PrompterScreen - Edge Cases
 * Validates: Requirements 6.5
 */

import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { PrompterScreen } from '../PrompterScreen';
import { storageService } from '../../services/storageService';
import { Song, Setlist } from '../../types/models';

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
  goBack: mockGoBack,
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  canGoBack: jest.fn(() => true),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  getState: jest.fn(),
  getParent: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  getId: jest.fn(),
} as any;

// Mock storageService
jest.mock('../../services/storageService');

// Mock useSettings hook
jest.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      fontSize: 48,
      textColor: '#ffffff',
      backgroundColor: '#000000',
      marginHorizontal: 40,
      lineHeight: 60,
      anchorYPercent: 0.4,
    },
    saveSettings: jest.fn(),
  }),
}));

describe('PrompterScreen - Edge Case Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Edge Case: Last song in setlist
   * Requirements 6.5: When user is on last song and touches next,
   * system should remain on last song or exit prompter mode
   */
  it('should handle last song in setlist - next button disabled', async () => {
    const songs: Song[] = [
      {
        id: 'song-1',
        title: 'First Song',
        artist: 'Artist 1',
        lines: [
          { id: 'line1', text: 'Line 1', timeSeconds: 0 },
          { id: 'line2', text: 'Line 2', timeSeconds: 5 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'song-2',
        title: 'Second Song',
        artist: 'Artist 2',
        lines: [
          { id: 'line3', text: 'Line 3', timeSeconds: 0 },
          { id: 'line4', text: 'Line 4', timeSeconds: 5 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'song-3',
        title: 'Last Song',
        artist: 'Artist 3',
        lines: [
          { id: 'line5', text: 'Line 5', timeSeconds: 0 },
          { id: 'line6', text: 'Line 6', timeSeconds: 5 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const setlist: Setlist = {
      id: 'test-setlist',
      name: 'Test Setlist',
      songIds: ['song-1', 'song-2', 'song-3'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Mock storage to return test data
    (storageService.loadSongs as jest.Mock).mockResolvedValue(songs);
    (storageService.loadSetlists as jest.Mock).mockResolvedValue([setlist]);

    // Start on the LAST song (index 2)
    const route = {
      key: 'test-key',
      name: 'Prompter' as const,
      params: {
        songId: 'song-3',
        setlistId: 'test-setlist',
      },
    };

    const { getByText, getAllByText } = render(
      <PrompterScreen route={route} navigation={mockNavigation} />
    );

    // Wait for song to load
    await waitFor(() => {
      expect(storageService.loadSongs).toHaveBeenCalled();
      expect(getByText('Last Song')).toBeTruthy();
    });

    // Verify we're on the last song (position 3 / 3)
    await waitFor(() => {
      expect(getByText('3 / 3')).toBeTruthy();
    });

    // Find the next button (second ▶ symbol - first is play/pause)
    const buttons = getAllByText('▶');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    
    // The last button should be the "next song" button
    const nextButton = buttons[buttons.length - 1];
    
    // Try to press next button
    fireEvent.press(nextButton);

    // Verify navigation.replace was NOT called (button should be disabled)
    expect(mockReplace).not.toHaveBeenCalled();
    
    // Verify we're still on the last song
    expect(getByText('Last Song')).toBeTruthy();
    expect(getByText('3 / 3')).toBeTruthy();
  });

  /**
   * Edge Case: First song in setlist
   * Previous button should be disabled
   */
  it('should handle first song in setlist - previous button disabled', async () => {
    const songs: Song[] = [
      {
        id: 'song-1',
        title: 'First Song',
        artist: 'Artist 1',
        lines: [
          { id: 'line1', text: 'Line 1', timeSeconds: 0 },
          { id: 'line2', text: 'Line 2', timeSeconds: 5 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'song-2',
        title: 'Second Song',
        artist: 'Artist 2',
        lines: [
          { id: 'line3', text: 'Line 3', timeSeconds: 0 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const setlist: Setlist = {
      id: 'test-setlist',
      name: 'Test Setlist',
      songIds: ['song-1', 'song-2'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    (storageService.loadSongs as jest.Mock).mockResolvedValue(songs);
    (storageService.loadSetlists as jest.Mock).mockResolvedValue([setlist]);

    // Start on the FIRST song (index 0)
    const route = {
      key: 'test-key',
      name: 'Prompter' as const,
      params: {
        songId: 'song-1',
        setlistId: 'test-setlist',
      },
    };

    const { getByText } = render(
      <PrompterScreen route={route} navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(storageService.loadSongs).toHaveBeenCalled();
      expect(getByText('First Song')).toBeTruthy();
    });

    // Verify we're on the first song (position 1 / 2)
    await waitFor(() => {
      expect(getByText('1 / 2')).toBeTruthy();
    });

    // Find the previous button (◀)
    const prevButton = getByText('◀');
    
    // Try to press previous button
    fireEvent.press(prevButton);

    // Verify navigation.replace was NOT called (button should be disabled)
    expect(mockReplace).not.toHaveBeenCalled();
    
    // Verify we're still on the first song
    expect(getByText('First Song')).toBeTruthy();
    expect(getByText('1 / 2')).toBeTruthy();
  });

  /**
   * Edge Case: Empty setlist (no songs)
   * Should show error message
   */
  it('should handle empty setlist gracefully', async () => {
    (storageService.loadSongs as jest.Mock).mockResolvedValue([]);
    (storageService.loadSetlists as jest.Mock).mockResolvedValue([
      {
        id: 'empty-setlist',
        name: 'Empty Setlist',
        songIds: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);

    const route = {
      key: 'test-key',
      name: 'Prompter' as const,
      params: {
        songId: 'non-existent-song',
        setlistId: 'empty-setlist',
      },
    };

    const { getByText } = render(
      <PrompterScreen route={route} navigation={mockNavigation} />
    );

    // Should show error message
    await waitFor(() => {
      expect(getByText('Song not found')).toBeTruthy();
    });
  });

  /**
   * Edge Case: Song without setlist context
   * Navigation buttons should not appear
   */
  it('should handle single song without setlist - no navigation buttons', async () => {
    const song: Song = {
      id: 'standalone-song',
      title: 'Standalone Song',
      artist: 'Solo Artist',
      lines: [
        { id: 'line1', text: 'Line 1', timeSeconds: 0 },
        { id: 'line2', text: 'Line 2', timeSeconds: 5 },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    (storageService.loadSongs as jest.Mock).mockResolvedValue([song]);
    (storageService.loadSetlists as jest.Mock).mockResolvedValue([]);

    // No setlistId provided
    const route = {
      key: 'test-key',
      name: 'Prompter' as const,
      params: {
        songId: 'standalone-song',
        // No setlistId
      },
    };

    const { getByText, queryByText } = render(
      <PrompterScreen route={route} navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(storageService.loadSongs).toHaveBeenCalled();
      expect(getByText('Standalone Song')).toBeTruthy();
    });

    // Navigation buttons should not be present
    expect(queryByText('◀')).toBeNull();
    
    // Position indicator should not be present
    expect(queryByText(/\d+ \/ \d+/)).toBeNull();
  });

  /**
   * Edge Case: Navigating from last song should stay on last song
   */
  it('should remain on last song when attempting to navigate next', async () => {
    const songs: Song[] = [
      {
        id: 'song-1',
        title: 'Song 1',
        lines: [{ id: 'l1', text: 'Text', timeSeconds: 0 }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'song-2',
        title: 'Song 2',
        lines: [{ id: 'l2', text: 'Text', timeSeconds: 0 }],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    const setlist: Setlist = {
      id: 'setlist-1',
      name: 'Setlist',
      songIds: ['song-1', 'song-2'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    (storageService.loadSongs as jest.Mock).mockResolvedValue(songs);
    (storageService.loadSetlists as jest.Mock).mockResolvedValue([setlist]);

    const route = {
      key: 'test-key',
      name: 'Prompter' as const,
      params: {
        songId: 'song-2', // Last song
        setlistId: 'setlist-1',
      },
    };

    const { getByText, getAllByText } = render(
      <PrompterScreen route={route} navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Song 2')).toBeTruthy();
      expect(getByText('2 / 2')).toBeTruthy();
    });

    // Get next button (last ▶)
    const buttons = getAllByText('▶');
    const nextButton = buttons[buttons.length - 1];
    
    // Press next multiple times
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);
    fireEvent.press(nextButton);

    // Should not navigate (replace not called)
    expect(mockReplace).not.toHaveBeenCalled();
    
    // Should still be on song 2
    expect(getByText('Song 2')).toBeTruthy();
    expect(getByText('2 / 2')).toBeTruthy();
  });
});
