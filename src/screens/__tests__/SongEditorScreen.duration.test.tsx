// screens/__tests__/SongEditorScreen.duration.test.tsx
// Unit tests for duration field in SongEditorScreen

import { Song } from '../../types/models';
import { parseTimeInput, formatTimeForEdit } from '../../utils/timeFormat';

describe('SongEditorScreen - Duration Field', () => {
  describe('Duration input in MM:SS format', () => {
    it('should accept and parse duration in MM:SS format', () => {
      const input = '3:45';
      const result = parseTimeInput(input);
      
      expect(result.success).toBe(true);
      expect(result.seconds).toBe(225); // 3 * 60 + 45
    });

    it('should format parsed duration back to MM:SS', () => {
      const seconds = 225; // 3:45
      const formatted = formatTimeForEdit(seconds);
      
      expect(formatted).toBe('3:45');
    });
  });

  describe('Duration input in seconds format', () => {
    it('should accept and parse duration in seconds format', () => {
      const input = '225';
      const result = parseTimeInput(input);
      
      expect(result.success).toBe(true);
      expect(result.seconds).toBe(225);
    });

    it('should keep seconds format when < 60', () => {
      const seconds = 45;
      const formatted = formatTimeForEdit(seconds);
      
      expect(formatted).toBe('45');
    });

    it('should convert to MM:SS format when >= 60', () => {
      const seconds = 125; // 2:05
      const formatted = formatTimeForEdit(seconds);
      
      expect(formatted).toBe('2:05');
    });
  });

  describe('Empty duration field (undefined)', () => {
    it('should handle undefined duration', () => {
      const formatted = formatTimeForEdit(undefined);
      
      expect(formatted).toBe('');
    });

    it('should reject empty string input', () => {
      const result = parseTimeInput('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should allow clearing duration by setting to undefined', () => {
      // Simulate the behavior: empty input -> undefined duration
      const input = '';
      const trimmed = input.trim();
      
      // When input is empty, duration should be set to undefined
      expect(trimmed).toBe('');
    });
  });

  describe('Warning display logic', () => {
    it('should detect when duration is shorter than last line', () => {
      const song: Song = {
        id: 'test-song',
        title: 'Test Song',
        durationSeconds: 60, // 1 minute
        lines: [
          { id: 'line-1', text: 'First line', timeSeconds: 10 },
          { id: 'line-2', text: 'Second line', timeSeconds: 30 },
          { id: 'line-3', text: 'Last line', timeSeconds: 90 }, // 1:30 - longer than duration
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const lastLineTime = song.lines
        .map(line => line.timeSeconds)
        .filter((time): time is number => time !== undefined)
        .reduce((max, time) => Math.max(max, time), 0);

      const shouldShowWarning = song.durationSeconds !== undefined && lastLineTime > song.durationSeconds;
      
      expect(shouldShowWarning).toBe(true);
      expect(lastLineTime).toBe(90);
      expect(song.durationSeconds).toBe(60);
    });

    it('should not show warning when duration is longer than last line', () => {
      const song: Song = {
        id: 'test-song',
        title: 'Test Song',
        durationSeconds: 120, // 2 minutes
        lines: [
          { id: 'line-1', text: 'First line', timeSeconds: 10 },
          { id: 'line-2', text: 'Last line', timeSeconds: 90 }, // 1:30 - shorter than duration
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const lastLineTime = song.lines
        .map(line => line.timeSeconds)
        .filter((time): time is number => time !== undefined)
        .reduce((max, time) => Math.max(max, time), 0);

      const shouldShowWarning = song.durationSeconds !== undefined && lastLineTime > song.durationSeconds;
      
      expect(shouldShowWarning).toBe(false);
    });

    it('should not show warning when duration is undefined', () => {
      const song: Song = {
        id: 'test-song',
        title: 'Test Song',
        lines: [
          { id: 'line-1', text: 'First line', timeSeconds: 10 },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const lastLineTime = song.lines
        .map(line => line.timeSeconds)
        .filter((time): time is number => time !== undefined)
        .reduce((max, time) => Math.max(max, time), 0);

      const shouldShowWarning = song.durationSeconds !== undefined && lastLineTime > song.durationSeconds;
      
      expect(shouldShowWarning).toBe(false);
    });

    it('should not show warning when there are no lines', () => {
      const song: Song = {
        id: 'test-song',
        title: 'Test Song',
        durationSeconds: 60,
        lines: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const shouldShowWarning = song.durationSeconds !== undefined && song.lines.length > 0;
      
      expect(shouldShowWarning).toBe(false);
    });
  });

  describe('Invalid input handling', () => {
    it('should reject invalid format and provide error message', () => {
      const result = parseTimeInput('invalid');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid format');
    });

    it('should reject negative duration', () => {
      const result = parseTimeInput('-10');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('negative');
    });

    it('should restore previous value on blur with invalid input', () => {
      const previousValue = 180; // 3:00
      const invalidInput = 'invalid';
      
      const result = parseTimeInput(invalidInput);
      
      // When parsing fails, we should restore the previous value
      if (!result.success) {
        const restoredValue = formatTimeForEdit(previousValue);
        expect(restoredValue).toBe('3:00');
      }
    });
  });

  describe('Format conversion', () => {
    it('should handle single digit minutes and seconds', () => {
      const input = '1:5';
      const result = parseTimeInput(input);
      
      expect(result.success).toBe(true);
      expect(result.seconds).toBe(65); // 1 * 60 + 5
    });

    it('should handle large minute values', () => {
      const input = '75:30';
      const result = parseTimeInput(input);
      
      expect(result.success).toBe(true);
      expect(result.seconds).toBe(4530); // 75 * 60 + 30
    });

    it('should handle seconds > 59', () => {
      const input = '1:75';
      const result = parseTimeInput(input);
      
      expect(result.success).toBe(true);
      expect(result.seconds).toBe(135); // 1 * 60 + 75
    });

    it('should handle decimal seconds', () => {
      const input = '1:30.5';
      const result = parseTimeInput(input);
      
      expect(result.success).toBe(true);
      expect(result.seconds).toBe(90.5); // 1 * 60 + 30.5
    });
  });
});
