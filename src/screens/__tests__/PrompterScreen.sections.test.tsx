// screens/__tests__/PrompterScreen.sections.test.tsx

import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PrompterScreen } from '../PrompterScreen';
import { storageService } from '../../services/storageService';
import { Song, LyricLine } from '../../types/models';

// Mock the storage service
jest.mock('../../services/storageService');
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

// Mock useSettings hook
jest.mock('../../hooks/useSettings', () => ({
  useSettings: () => ({
    settings: {
      fontSize: 48,
      anchorYPercent: 0.4,
      textColor: '#ffffff',
      backgroundColor: '#000000',
      marginHorizontal: 40,
      lineHeight: 60,
    },
  }),
}));

describe('PrompterScreen - Section Integration', () => {
  const mockNavigation = {
    goBack: jest.fn(),
    replace: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display section marker on first line of a section', async () => {
    const songWithSections: Song = {
      id: 'song-1',
      title: 'Test Song',
      artist: 'Test Artist',
      lines: [
        {
          id: 'line-1',
          text: 'First line of verse',
          timeSeconds: 0,
          section: { type: 'verse', number: 1 },
        },
        {
          id: 'line-2',
          text: 'Second line of verse',
          timeSeconds: 1,
          section: { type: 'verse', number: 1 },
        },
        {
          id: 'line-3',
          text: 'First line of chorus',
          timeSeconds: 2,
          section: { type: 'chorus' },
        },
        {
          id: 'line-4',
          text: 'Second line of chorus',
          timeSeconds: 3,
          section: { type: 'chorus' },
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorageService.loadSongs.mockResolvedValue([songWithSections]);
    mockStorageService.loadSetlists.mockResolvedValue([]);

    const route = {
      params: { songId: 'song-1' },
    } as any;

    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <PrompterScreen route={route} navigation={mockNavigation} />
      </NavigationContainer>
    );

    // Wait for song to load
    await waitFor(() => {
      expect(getByText('First line of verse')).toBeTruthy();
    });

    // Check that section markers are displayed
    const sectionMarkers = getAllByTestId('section-marker');
    
    // Should have 2 section markers (one for verse, one for chorus)
    expect(sectionMarkers).toHaveLength(2);
  });

  it('should not display section marker on non-first lines of a section', async () => {
    const songWithSections: Song = {
      id: 'song-1',
      title: 'Test Song',
      lines: [
        {
          id: 'line-1',
          text: 'First line',
          timeSeconds: 0,
          section: { type: 'verse', number: 1 },
        },
        {
          id: 'line-2',
          text: 'Second line',
          timeSeconds: 1,
          section: { type: 'verse', number: 1 },
        },
        {
          id: 'line-3',
          text: 'Third line',
          timeSeconds: 2,
          section: { type: 'verse', number: 1 },
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorageService.loadSongs.mockResolvedValue([songWithSections]);
    mockStorageService.loadSetlists.mockResolvedValue([]);

    const route = {
      params: { songId: 'song-1' },
    } as any;

    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <PrompterScreen route={route} navigation={mockNavigation} />
      </NavigationContainer>
    );

    // Wait for song to load
    await waitFor(() => {
      expect(getByText('First line')).toBeTruthy();
    });

    // Should have only 1 section marker (for the first line)
    const sectionMarkers = getAllByTestId('section-marker');
    expect(sectionMarkers).toHaveLength(1);
  });

  it('should work correctly with songs without sections', async () => {
    const songWithoutSections: Song = {
      id: 'song-1',
      title: 'Test Song',
      lines: [
        {
          id: 'line-1',
          text: 'Line without section',
          timeSeconds: 0,
        },
        {
          id: 'line-2',
          text: 'Another line',
          timeSeconds: 1,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorageService.loadSongs.mockResolvedValue([songWithoutSections]);
    mockStorageService.loadSetlists.mockResolvedValue([]);

    const route = {
      params: { songId: 'song-1' },
    } as any;

    const { getByText, queryAllByTestId } = render(
      <NavigationContainer>
        <PrompterScreen route={route} navigation={mockNavigation} />
      </NavigationContainer>
    );

    // Wait for song to load
    await waitFor(() => {
      expect(getByText('Line without section')).toBeTruthy();
    });

    // Should have no section markers
    const sectionMarkers = queryAllByTestId('section-marker');
    expect(sectionMarkers).toHaveLength(0);
  });

  it('should display new section marker when section changes', async () => {
    const songWithMultipleSections: Song = {
      id: 'song-1',
      title: 'Test Song',
      lines: [
        {
          id: 'line-1',
          text: 'Verse 1 line 1',
          timeSeconds: 0,
          section: { type: 'verse', number: 1 },
        },
        {
          id: 'line-2',
          text: 'Verse 1 line 2',
          timeSeconds: 1,
          section: { type: 'verse', number: 1 },
        },
        {
          id: 'line-3',
          text: 'Verse 2 line 1',
          timeSeconds: 2,
          section: { type: 'verse', number: 2 },
        },
        {
          id: 'line-4',
          text: 'Chorus line 1',
          timeSeconds: 3,
          section: { type: 'chorus' },
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    mockStorageService.loadSongs.mockResolvedValue([songWithMultipleSections]);
    mockStorageService.loadSetlists.mockResolvedValue([]);

    const route = {
      params: { songId: 'song-1' },
    } as any;

    const { getByText, getAllByTestId } = render(
      <NavigationContainer>
        <PrompterScreen route={route} navigation={mockNavigation} />
      </NavigationContainer>
    );

    // Wait for song to load
    await waitFor(() => {
      expect(getByText('Verse 1 line 1')).toBeTruthy();
    });

    // Should have 3 section markers (Verse 1, Verse 2, Chorus)
    const sectionMarkers = getAllByTestId('section-marker');
    expect(sectionMarkers).toHaveLength(3);
  });
});
