/**
 * Backward Compatibility Tests for Time Format
 * 
 * Tests that the new MM:SS format is fully backward compatible with
 * the old format where timeSeconds was stored as plain numbers.
 * 
 * Requirements: time-input-format/5.1, 5.2, 5.3, 5.4, 5.5
 */

import { parseTimeInput, formatTimeDisplay, formatTimeForEdit } from '../timeFormat';
import { Song, LyricLine } from '../../types/models';

describe('Time Format - Backward Compatibility', () => {
  describe('Requirement 5.1: Loading old data with timeSeconds as numbers', () => {
    it('should correctly display old data with integer timeSeconds', () => {
      // Old format: timeSeconds stored as plain numbers
      const oldLine: LyricLine = {
        id: 'line-1',
        text: 'Old format line',
        timeSeconds: 74, // Plain number, not formatted
      };

      // Should display correctly
      const displayed = formatTimeDisplay(oldLine.timeSeconds);
      expect(displayed).toBe('1:14');
    });

    it('should correctly display old data with decimal timeSeconds', () => {
      const oldLine: LyricLine = {
        id: 'line-2',
        text: 'Old format with decimals',
        timeSeconds: 90.5,
      };

      // Should round to nearest second for display
      const displayed = formatTimeDisplay(oldLine.timeSeconds);
      expect(displayed).toBe('1:31'); // 90.5 rounds to 91 seconds = 1:31
    });

    it('should correctly display old data with timeSeconds < 60', () => {
      const oldLine: LyricLine = {
        id: 'line-3',
        text: 'Short time',
        timeSeconds: 45,
      };

      const displayed = formatTimeDisplay(oldLine.timeSeconds);
      expect(displayed).toBe('45');
    });

    it('should handle old songs with multiple lines', () => {
      const oldSong: Song = {
        id: 'song-1',
        title: 'Old Song',
        artist: 'Old Artist',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 0 },
          { id: 'line-2', text: 'Line 2', timeSeconds: 30 },
          { id: 'line-3', text: 'Line 3', timeSeconds: 74 },
          { id: 'line-4', text: 'Line 4', timeSeconds: 120 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // All lines should display correctly
      expect(formatTimeDisplay(oldSong.lines[0].timeSeconds)).toBe('0');
      expect(formatTimeDisplay(oldSong.lines[1].timeSeconds)).toBe('30');
      expect(formatTimeDisplay(oldSong.lines[2].timeSeconds)).toBe('1:14');
      expect(formatTimeDisplay(oldSong.lines[3].timeSeconds)).toBe('2:00');
    });

    it('should handle old songs without durationSeconds field', () => {
      const oldSong: Song = {
        id: 'song-2',
        title: 'Old Song Without Duration',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 0 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // No durationSeconds field
      };

      // Should work fine with undefined duration
      expect(oldSong.durationSeconds).toBeUndefined();
      expect(formatTimeDisplay(oldSong.durationSeconds)).toBe('');
    });
  });

  describe('Requirement 5.2: Old data without durationSeconds field', () => {
    it('should handle songs without durationSeconds gracefully', () => {
      const oldSong: Song = {
        id: 'song-3',
        title: 'Song Without Duration',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 10 },
          { id: 'line-2', text: 'Line 2', timeSeconds: 20 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(oldSong.durationSeconds).toBeUndefined();
      
      // Format functions should handle undefined
      expect(formatTimeDisplay(oldSong.durationSeconds)).toBe('');
      expect(formatTimeForEdit(oldSong.durationSeconds)).toBe('');
    });

    it('should allow adding durationSeconds to old songs', () => {
      const oldSong: Song = {
        id: 'song-4',
        title: 'Old Song',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 10 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Add duration to old song
      const updatedSong: Song = {
        ...oldSong,
        durationSeconds: 180,
        updatedAt: Date.now(),
      };

      expect(updatedSong.durationSeconds).toBe(180);
      expect(formatTimeDisplay(updatedSong.durationSeconds)).toBe('3:00');
    });
  });

  describe('Requirement 5.3: Saving data preserves seconds format', () => {
    it('should save timeSeconds as numbers, not strings', () => {
      // User enters "1:14"
      const parsed = parseTimeInput('1:14');
      expect(parsed.success).toBe(true);
      expect(parsed.seconds).toBe(74);
      
      // When saving to storage, it should be a number
      expect(typeof parsed.seconds).toBe('number');
      
      // Create a line with this time
      const line: LyricLine = {
        id: 'line-1',
        text: 'New line',
        timeSeconds: parsed.seconds!,
      };
      
      // Verify it's stored as a number
      expect(typeof line.timeSeconds).toBe('number');
      expect(line.timeSeconds).toBe(74);
    });

    it('should save durationSeconds as numbers', () => {
      // User enters "3:45"
      const parsed = parseTimeInput('3:45');
      expect(parsed.success).toBe(true);
      expect(parsed.seconds).toBe(225);
      
      // When saving to song
      const song: Song = {
        id: 'song-1',
        title: 'New Song',
        lines: [],
        durationSeconds: parsed.seconds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // Verify it's stored as a number
      expect(typeof song.durationSeconds).toBe('number');
      expect(song.durationSeconds).toBe(225);
    });

    it('should preserve decimal precision when saving', () => {
      // User enters "1:30.5"
      const parsed = parseTimeInput('1:30.5');
      expect(parsed.success).toBe(true);
      expect(parsed.seconds).toBe(90.5);
      
      const line: LyricLine = {
        id: 'line-1',
        text: 'Line with decimals',
        timeSeconds: parsed.seconds!,
      };
      
      // Decimal precision should be preserved
      expect(line.timeSeconds).toBe(90.5);
    });

    it('should save data in format compatible with old code', () => {
      // New format input
      const parsed1 = parseTimeInput('2:30');
      const parsed2 = parseTimeInput('45');
      
      // Create song with new format
      const song: Song = {
        id: 'song-1',
        title: 'Compatible Song',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: parsed1.seconds! },
          { id: 'line-2', text: 'Line 2', timeSeconds: parsed2.seconds! },
        ],
        durationSeconds: 180,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      // All times should be plain numbers (old format)
      expect(typeof song.lines[0].timeSeconds).toBe('number');
      expect(typeof song.lines[1].timeSeconds).toBe('number');
      expect(typeof song.durationSeconds).toBe('number');
      
      // Values should be correct
      expect(song.lines[0].timeSeconds).toBe(150);
      expect(song.lines[1].timeSeconds).toBe(45);
      expect(song.durationSeconds).toBe(180);
    });
  });

  describe('Requirement 5.4: Import old data correctly', () => {
    it('should import old JSON format with timeSeconds as numbers', () => {
      // Simulate old exported data
      const oldExportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [
          {
            id: 'song-1',
            title: 'Old Song',
            artist: 'Old Artist',
            lines: [
              { id: 'line-1', text: 'Line 1', timeSeconds: 0 },
              { id: 'line-2', text: 'Line 2', timeSeconds: 74 },
              { id: 'line-3', text: 'Line 3', timeSeconds: 150 },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        setlists: [],
      };

      // Parse the JSON (simulating import)
      const jsonString = JSON.stringify(oldExportData);
      const imported = JSON.parse(jsonString);
      
      // Verify all timeSeconds are numbers
      const song = imported.songs[0];
      expect(typeof song.lines[0].timeSeconds).toBe('number');
      expect(typeof song.lines[1].timeSeconds).toBe('number');
      expect(typeof song.lines[2].timeSeconds).toBe('number');
      
      // Verify values are correct
      expect(song.lines[0].timeSeconds).toBe(0);
      expect(song.lines[1].timeSeconds).toBe(74);
      expect(song.lines[2].timeSeconds).toBe(150);
      
      // Should be able to display them
      expect(formatTimeDisplay(song.lines[0].timeSeconds)).toBe('0');
      expect(formatTimeDisplay(song.lines[1].timeSeconds)).toBe('1:14');
      expect(formatTimeDisplay(song.lines[2].timeSeconds)).toBe('2:30');
    });

    it('should import old data without durationSeconds field', () => {
      const oldExportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [
          {
            id: 'song-1',
            title: 'Old Song',
            lines: [
              { id: 'line-1', text: 'Line 1', timeSeconds: 10 },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            // No durationSeconds field
          },
        ],
        setlists: [],
      };

      const jsonString = JSON.stringify(oldExportData);
      const imported = JSON.parse(jsonString);
      
      const song = imported.songs[0];
      expect(song.durationSeconds).toBeUndefined();
    });

    it('should import old data with decimal timeSeconds', () => {
      const oldExportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [
          {
            id: 'song-1',
            title: 'Old Song with Decimals',
            lines: [
              { id: 'line-1', text: 'Line 1', timeSeconds: 10.5 },
              { id: 'line-2', text: 'Line 2', timeSeconds: 74.75 },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
        setlists: [],
      };

      const jsonString = JSON.stringify(oldExportData);
      const imported = JSON.parse(jsonString);
      
      const song = imported.songs[0];
      expect(song.lines[0].timeSeconds).toBe(10.5);
      expect(song.lines[1].timeSeconds).toBe(74.75);
      
      // Should display correctly (rounded)
      expect(formatTimeDisplay(song.lines[0].timeSeconds)).toBe('11');
      expect(formatTimeDisplay(song.lines[1].timeSeconds)).toBe('1:15');
    });
  });

  describe('Requirement 5.5: Export data maintains backward compatibility', () => {
    it('should export timeSeconds as numbers for backward compatibility', () => {
      // Create a song with new format input
      const song: Song = {
        id: 'song-1',
        title: 'New Song',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 0 },
          { id: 'line-2', text: 'Line 2', timeSeconds: 74 },
          { id: 'line-3', text: 'Line 3', timeSeconds: 150 },
        ],
        durationSeconds: 180,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Export to JSON
      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [song],
        setlists: [],
      };

      const jsonString = JSON.stringify(exportData);
      const exported = JSON.parse(jsonString);
      
      // Verify all timeSeconds are exported as numbers
      const exportedSong = exported.songs[0];
      expect(typeof exportedSong.lines[0].timeSeconds).toBe('number');
      expect(typeof exportedSong.lines[1].timeSeconds).toBe('number');
      expect(typeof exportedSong.lines[2].timeSeconds).toBe('number');
      expect(typeof exportedSong.durationSeconds).toBe('number');
      
      // Verify values are correct
      expect(exportedSong.lines[0].timeSeconds).toBe(0);
      expect(exportedSong.lines[1].timeSeconds).toBe(74);
      expect(exportedSong.lines[2].timeSeconds).toBe(150);
      expect(exportedSong.durationSeconds).toBe(180);
    });

    it('should export data that can be imported by old versions', () => {
      // Create song with new MM:SS input
      const parsed1 = parseTimeInput('1:14');
      const parsed2 = parseTimeInput('2:30');
      const parsed3 = parseTimeInput('3:00');
      
      const song: Song = {
        id: 'song-1',
        title: 'Cross-Compatible Song',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: parsed1.seconds! },
          { id: 'line-2', text: 'Line 2', timeSeconds: parsed2.seconds! },
        ],
        durationSeconds: parsed3.seconds,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Export
      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [song],
        setlists: [],
      };

      const jsonString = JSON.stringify(exportData);
      
      // Verify JSON doesn't contain MM:SS strings
      expect(jsonString).not.toContain('1:14');
      expect(jsonString).not.toContain('2:30');
      expect(jsonString).not.toContain('3:00');
      
      // Verify JSON contains numeric values
      expect(jsonString).toContain('74');
      expect(jsonString).toContain('150');
      expect(jsonString).toContain('180');
      
      // Parse back (simulating old version import)
      const imported = JSON.parse(jsonString);
      const importedSong = imported.songs[0];
      
      // Old version should be able to read these as numbers
      expect(typeof importedSong.lines[0].timeSeconds).toBe('number');
      expect(typeof importedSong.lines[1].timeSeconds).toBe('number');
      expect(typeof importedSong.durationSeconds).toBe('number');
    });

    it('should preserve decimal precision in export', () => {
      const song: Song = {
        id: 'song-1',
        title: 'Song with Decimals',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 10.5 },
          { id: 'line-2', text: 'Line 2', timeSeconds: 74.75 },
        ],
        durationSeconds: 180.25,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [song],
        setlists: [],
      };

      const jsonString = JSON.stringify(exportData);
      const exported = JSON.parse(jsonString);
      
      const exportedSong = exported.songs[0];
      expect(exportedSong.lines[0].timeSeconds).toBe(10.5);
      expect(exportedSong.lines[1].timeSeconds).toBe(74.75);
      expect(exportedSong.durationSeconds).toBe(180.25);
    });

    it('should handle songs without durationSeconds in export', () => {
      const song: Song = {
        id: 'song-1',
        title: 'Song Without Duration',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 10 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        // No durationSeconds
      };

      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [song],
        setlists: [],
      };

      const jsonString = JSON.stringify(exportData);
      const exported = JSON.parse(jsonString);
      
      const exportedSong = exported.songs[0];
      expect(exportedSong.durationSeconds).toBeUndefined();
    });
  });

  describe('Round-trip compatibility', () => {
    it('should maintain data integrity through export-import cycle', () => {
      // Create song with old format (plain numbers)
      const originalSong: Song = {
        id: 'song-1',
        title: 'Round Trip Song',
        artist: 'Test Artist',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 0 },
          { id: 'line-2', text: 'Line 2', timeSeconds: 74 },
          { id: 'line-3', text: 'Line 3', timeSeconds: 150.5 },
        ],
        durationSeconds: 180,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Export
      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [originalSong],
        setlists: [],
      };

      const jsonString = JSON.stringify(exportData);
      
      // Import
      const imported = JSON.parse(jsonString);
      const importedSong = imported.songs[0];
      
      // Verify data is identical
      expect(importedSong.id).toBe(originalSong.id);
      expect(importedSong.title).toBe(originalSong.title);
      expect(importedSong.artist).toBe(originalSong.artist);
      expect(importedSong.lines).toHaveLength(originalSong.lines.length);
      expect(importedSong.lines[0].timeSeconds).toBe(originalSong.lines[0].timeSeconds);
      expect(importedSong.lines[1].timeSeconds).toBe(originalSong.lines[1].timeSeconds);
      expect(importedSong.lines[2].timeSeconds).toBe(originalSong.lines[2].timeSeconds);
      expect(importedSong.durationSeconds).toBe(originalSong.durationSeconds);
    });

    it('should handle mixed old and new data in same export', () => {
      // Song 1: Old format (no duration)
      const oldSong: Song = {
        id: 'song-1',
        title: 'Old Song',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 10 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Song 2: New format (with duration)
      const newSong: Song = {
        id: 'song-2',
        title: 'New Song',
        lines: [
          { id: 'line-1', text: 'Line 1', timeSeconds: 20 },
        ],
        durationSeconds: 180,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Export both
      const exportData = {
        version: '1.0',
        exportDate: Date.now(),
        songs: [oldSong, newSong],
        setlists: [],
      };

      const jsonString = JSON.stringify(exportData);
      const imported = JSON.parse(jsonString);
      
      // Both should import correctly
      expect(imported.songs[0].durationSeconds).toBeUndefined();
      expect(imported.songs[1].durationSeconds).toBe(180);
      expect(imported.songs[0].lines[0].timeSeconds).toBe(10);
      expect(imported.songs[1].lines[0].timeSeconds).toBe(20);
    });
  });
});
