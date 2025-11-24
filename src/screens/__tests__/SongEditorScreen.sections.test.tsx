// screens/__tests__/SongEditorScreen.sections.test.tsx
// Integration test to verify section functionality in SongEditorScreen

import { Song, LyricLine } from '../../types/models';
import { storageService } from '../../services/storageService';
import { getNextVerseNumber } from '../../utils/sectionLabels';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  let storage = new Map<string, string>();
  
  return {
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    getItem: jest.fn((key: string) => {
      return Promise.resolve(storage.get(key) || null);
    }),
    removeItem: jest.fn((key: string) => {
      storage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('SongEditorScreen - Section Integration', () => {
  beforeEach(() => {
    // Clear storage before each test
    (AsyncStorage.clear as jest.Mock)();
  });

  it('should preserve sections when saving and loading songs', async () => {
    const lineWithSection: LyricLine = {
      id: 'line-1',
      text: 'Test line',
      timeSeconds: 0,
      section: { type: 'verse', number: 1, label: 'Verse 1' },
    };

    const song: Song = {
      id: 'test-song',
      title: 'Test Song',
      lines: [lineWithSection],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save the song
    await storageService.saveSong(song);

    // Load it back
    const loaded = await storageService.loadSong(song.id);

    // Verify the section is preserved
    expect(loaded).toBeTruthy();
    expect(loaded?.lines[0].section).toEqual(lineWithSection.section);
  });

  it('should preserve optional section field when undefined', async () => {
    const lineWithoutSection: LyricLine = {
      id: 'line-1',
      text: 'Test line without section',
      timeSeconds: 0,
    };

    const song: Song = {
      id: 'test-song-2',
      title: 'Test Song 2',
      lines: [lineWithoutSection],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save the song
    await storageService.saveSong(song);

    // Load it back
    const loaded = await storageService.loadSong(song.id);

    // Verify the line has no section
    expect(loaded).toBeTruthy();
    expect(loaded?.lines[0].section).toBeUndefined();
  });

  it('should calculate nextVerseNumber correctly', () => {
    const lines: LyricLine[] = [
      {
        id: 'line-1',
        text: 'Verse 1',
        timeSeconds: 0,
        section: { type: 'verse', number: 1 },
      },
      {
        id: 'line-2',
        text: 'Chorus',
        timeSeconds: 5,
        section: { type: 'chorus' },
      },
      {
        id: 'line-3',
        text: 'Verse 2',
        timeSeconds: 10,
        section: { type: 'verse', number: 2 },
      },
    ];

    const nextNumber = getNextVerseNumber(lines);
    expect(nextNumber).toBe(3);
  });

  it('should return 1 for nextVerseNumber when no verses exist', () => {
    const lines: LyricLine[] = [
      {
        id: 'line-1',
        text: 'Chorus',
        timeSeconds: 0,
        section: { type: 'chorus' },
      },
    ];

    const nextNumber = getNextVerseNumber(lines);
    expect(nextNumber).toBe(1);
  });

  it('should handle mixed lines with and without sections', async () => {
    const song: Song = {
      id: 'test-song-3',
      title: 'Mixed Song',
      lines: [
        {
          id: 'line-1',
          text: 'Intro',
          timeSeconds: 0,
          section: { type: 'intro' },
        },
        {
          id: 'line-2',
          text: 'Regular line',
          timeSeconds: 5,
        },
        {
          id: 'line-3',
          text: 'Verse 1',
          timeSeconds: 10,
          section: { type: 'verse', number: 1 },
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save and load
    await storageService.saveSong(song);
    const loaded = await storageService.loadSong(song.id);

    // Verify all lines are preserved correctly
    expect(loaded).toBeTruthy();
    expect(loaded?.lines).toHaveLength(3);
    expect(loaded?.lines[0].section).toEqual({ type: 'intro' });
    expect(loaded?.lines[1].section).toBeUndefined();
    expect(loaded?.lines[2].section).toEqual({ type: 'verse', number: 1 });
  });
});
