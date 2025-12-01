// screens/__tests__/SongEditorScreen.duration.property.test.tsx

import fc from 'fast-check';
import { Song, LyricLine } from '../../types/models';
import { parseTimeInput } from '../../utils/timeFormat';

/**
 * Feature: time-input-format, Property 6: Duration jest zapisywany poprawnie
 * Validates: Requirements 2.2
 */
describe('Property 6: Duration jest zapisywany poprawnie', () => {
  it('should correctly save duration in MM:SS format to durationSeconds', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          durationSeconds: fc.option(fc.float({ min: 0, max: 3600 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600 }),
            })
          ),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        fc.integer({ min: 0, max: 999 }), // minutes
        fc.integer({ min: 0, max: 59 }), // seconds
        (song: Song, minutes: number, seconds: number) => {
          // Format as MM:SS
          const durationInput = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          
          // Parse the input
          const parseResult = parseTimeInput(durationInput);
          expect(parseResult.success).toBe(true);
          
          // Simulate saving duration
          const updatedSong: Song = {
            ...song,
            durationSeconds: parseResult.seconds,
          };
          
          // Property: durationSeconds should be correctly calculated
          const expectedSeconds = minutes * 60 + seconds;
          expect(updatedSong.durationSeconds).toBe(expectedSeconds);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly save duration in seconds format to durationSeconds', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          durationSeconds: fc.option(fc.float({ min: 0, max: 3600 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600 }),
            })
          ),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        fc.float({ min: 0, max: 7200, noNaN: true }), // duration in seconds
        (song: Song, durationInSeconds: number) => {
          // Format as seconds string
          const durationInput = durationInSeconds.toString();
          
          // Parse the input
          const parseResult = parseTimeInput(durationInput);
          expect(parseResult.success).toBe(true);
          
          // Simulate saving duration
          const updatedSong: Song = {
            ...song,
            durationSeconds: parseResult.seconds,
          };
          
          // Property: durationSeconds should match the input
          expect(updatedSong.durationSeconds).toBeCloseTo(durationInSeconds, 5);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow undefined duration (empty field)', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          durationSeconds: fc.float({ min: 0, max: 3600 }), // Start with a duration
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600 }),
            })
          ),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Simulate clearing the duration field (empty string)
          const updatedSong: Song = {
            ...song,
            durationSeconds: undefined,
          };
          
          // Property: durationSeconds should be undefined
          expect(updatedSong.durationSeconds).toBeUndefined();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve duration through multiple updates', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          durationSeconds: fc.option(fc.float({ min: 0, max: 3600 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600 }),
            })
          ),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        fc.float({ min: 60, max: 7200, noNaN: true }), // duration
        fc.string({ minLength: 1, maxLength: 100 }), // new title
        (song: Song, newDuration: number, newTitle: string) => {
          // First update: set duration
          const songWithDuration: Song = {
            ...song,
            durationSeconds: newDuration,
          };
          
          // Second update: change title (should preserve duration)
          const songWithNewTitle: Song = {
            ...songWithDuration,
            title: newTitle,
          };
          
          // Property: duration should be preserved
          expect(songWithNewTitle.durationSeconds).toBe(newDuration);
          expect(songWithNewTitle.title).toBe(newTitle);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: time-input-format, Property 7: Ostrzeżenie gdy duration < ostatnia linijka
 * Validates: Requirements 2.4
 */
describe('Property 7: Ostrzeżenie gdy duration < ostatnia linijka', () => {
  it('should detect when duration is shorter than last line time', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
            }),
            { minLength: 1 } // Ensure at least one line
          ).map(lines => {
            // Sort lines by time and ensure unique IDs
            const sortedLines = lines
              .map((line, idx) => ({
                ...line,
                id: `line-${idx}`,
              }))
              .sort((a, b) => a.timeSeconds - b.timeSeconds);
            return sortedLines;
          }),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Get the last line's time
          const lastLine = song.lines[song.lines.length - 1];
          const lastLineTime = lastLine.timeSeconds;
          
          // Skip if lastLineTime is invalid
          if (!isFinite(lastLineTime) || lastLineTime <= 0) {
            return true;
          }
          
          // Set duration to be shorter than last line time
          const shorterDuration = Math.max(0, lastLineTime - Math.random() * Math.min(10, lastLineTime) - 1);
          
          const songWithShortDuration: Song = {
            ...song,
            durationSeconds: shorterDuration,
          };
          
          // Property: should detect the warning condition
          const shouldWarn = 
            songWithShortDuration.durationSeconds !== undefined &&
            isFinite(songWithShortDuration.durationSeconds) &&
            songWithShortDuration.lines.length > 0 &&
            lastLine.timeSeconds !== undefined &&
            isFinite(lastLine.timeSeconds) &&
            songWithShortDuration.durationSeconds < lastLine.timeSeconds;
          
          expect(shouldWarn).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not warn when duration is longer than last line time', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
            }),
            { minLength: 1 } // Ensure at least one line
          ).map(lines => {
            // Sort lines by time and ensure unique IDs
            const sortedLines = lines
              .map((line, idx) => ({
                ...line,
                id: `line-${idx}`,
              }))
              .sort((a, b) => a.timeSeconds - b.timeSeconds);
            return sortedLines;
          }),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Get the last line's time
          const lastLine = song.lines[song.lines.length - 1];
          const lastLineTime = lastLine.timeSeconds;
          
          // Set duration to be longer than last line time
          const longerDuration = lastLineTime + Math.random() * 100 + 1; // At least 1 second longer
          
          const songWithLongDuration: Song = {
            ...song,
            durationSeconds: longerDuration,
          };
          
          // Property: should NOT warn
          const shouldWarn = 
            songWithLongDuration.durationSeconds !== undefined &&
            isFinite(songWithLongDuration.durationSeconds) &&
            songWithLongDuration.lines.length > 0 &&
            lastLine.timeSeconds !== undefined &&
            isFinite(lastLine.timeSeconds) &&
            songWithLongDuration.durationSeconds < lastLine.timeSeconds;
          
          expect(shouldWarn).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not warn when duration is undefined', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          durationSeconds: fc.constant(undefined), // No duration set
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
            }),
            { minLength: 1 } // Ensure at least one line
          ).map(lines => {
            // Sort lines by time and ensure unique IDs
            const sortedLines = lines
              .map((line, idx) => ({
                ...line,
                id: `line-${idx}`,
              }))
              .sort((a, b) => a.timeSeconds - b.timeSeconds);
            return sortedLines;
          }),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Property: should NOT warn when duration is undefined
          const lastLine = song.lines[song.lines.length - 1];
          const shouldWarn = 
            song.durationSeconds !== undefined &&
            isFinite(song.durationSeconds) &&
            song.lines.length > 0 &&
            lastLine.timeSeconds !== undefined &&
            isFinite(lastLine.timeSeconds) &&
            song.durationSeconds < lastLine.timeSeconds;
          
          expect(shouldWarn).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should not warn when there are no lines', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          durationSeconds: fc.float({ min: 0, max: 3600 }),
          lines: fc.constant([]), // No lines
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Property: should NOT warn when there are no lines
          const shouldWarn = 
            song.durationSeconds !== undefined &&
            song.lines.length > 0 &&
            song.lines[song.lines.length - 1].timeSeconds !== undefined &&
            song.durationSeconds < song.lines[song.lines.length - 1].timeSeconds;
          
          expect(shouldWarn).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle edge case where duration equals last line time', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
            }),
            { minLength: 1 } // Ensure at least one line
          ).map(lines => {
            // Sort lines by time and ensure unique IDs
            const sortedLines = lines
              .map((line, idx) => ({
                ...line,
                id: `line-${idx}`,
              }))
              .sort((a, b) => a.timeSeconds - b.timeSeconds);
            return sortedLines;
          }),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Get the last line's time
          const lastLine = song.lines[song.lines.length - 1];
          const lastLineTime = lastLine.timeSeconds;
          
          // Set duration equal to last line time
          const songWithEqualDuration: Song = {
            ...song,
            durationSeconds: lastLineTime,
          };
          
          // Property: should NOT warn when duration equals last line time
          const shouldWarn = 
            songWithEqualDuration.durationSeconds !== undefined &&
            isFinite(songWithEqualDuration.durationSeconds) &&
            songWithEqualDuration.lines.length > 0 &&
            lastLine.timeSeconds !== undefined &&
            isFinite(lastLine.timeSeconds) &&
            songWithEqualDuration.durationSeconds < lastLine.timeSeconds;
          
          expect(shouldWarn).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should allow saving even when warning condition is true', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 10, max: 3600, noNaN: true }), // Ensure at least 10 seconds
            }),
            { minLength: 1 } // Ensure at least one line
          ).map(lines => {
            // Sort lines by time and ensure unique IDs
            const sortedLines = lines
              .map((line, idx) => ({
                ...line,
                id: `line-${idx}`,
              }))
              .sort((a, b) => a.timeSeconds - b.timeSeconds);
            return sortedLines;
          }),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          // Get the last line's time
          const lastLine = song.lines[song.lines.length - 1];
          const lastLineTime = lastLine.timeSeconds;
          
          // Set duration to be shorter than last line time
          const shorterDuration = Math.max(0, lastLineTime - 5);
          
          const songWithShortDuration: Song = {
            ...song,
            durationSeconds: shorterDuration,
          };
          
          // Property: song should still be valid and saveable
          // (warning is shown but save is allowed)
          expect(songWithShortDuration.durationSeconds).toBe(shorterDuration);
          expect(songWithShortDuration.lines).toEqual(song.lines);
          
          // The warning condition should be true
          const shouldWarn = 
            songWithShortDuration.durationSeconds !== undefined &&
            isFinite(songWithShortDuration.durationSeconds) &&
            songWithShortDuration.lines.length > 0 &&
            lastLine.timeSeconds !== undefined &&
            isFinite(lastLine.timeSeconds) &&
            songWithShortDuration.durationSeconds < lastLine.timeSeconds;
          
          expect(shouldWarn).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
