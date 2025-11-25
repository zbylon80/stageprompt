// services/__tests__/exportImportService.property.test.ts

import fc from 'fast-check';
import { exportImportService } from '../exportImportService';
import { Song, Setlist } from '../../types/models';

/**
 * Feature: StagePrompt, Property 28: Round-trip eksportu i importu
 * Validates: Requirements 11.1, 11.3
 * 
 * For any set of songs and setlists, exporting to JSON and then importing
 * should return equivalent data.
 */

// Generator for valid Song objects
const songGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  artist: fc.option(fc.string({ maxLength: 100 })),
  durationSeconds: fc.option(fc.float({ min: 0, max: 3600, noNaN: true })),
  lines: fc.array(
    fc.record({
      id: fc.string({ minLength: 1 }),
      text: fc.string({ maxLength: 200 }),
      timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
      section: fc.option(
        fc.record({
          type: fc.constantFrom('verse', 'chorus', 'bridge', 'intro', 'outro', 'instrumental', 'custom'),
          label: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          number: fc.option(fc.integer({ min: 1, max: 20 })),
          startTime: fc.option(fc.float({ min: 0, max: 3600, noNaN: true })),
          endTime: fc.option(fc.float({ min: 0, max: 3600, noNaN: true })),
        })
      ),
    }),
    { maxLength: 50 }
  ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)), // Ensure sorted
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 }),
}) as fc.Arbitrary<Song>;

// Generator for valid Setlist objects
const setlistGenerator = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  songIds: fc.array(fc.string({ minLength: 1 }), { maxLength: 20 }),
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 }),
}) as fc.Arbitrary<Setlist>;

describe('exportImportService - Property Tests', () => {
  describe('Property 28: Round-trip eksportu i importu', () => {
    it('should preserve all data through export and import cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { maxLength: 10 }),
          fc.array(setlistGenerator, { maxLength: 5 }),
          async (songs, setlists) => {
            // Export data
            const jsonData = await exportImportService.exportAllData(songs, setlists);

            // Validate the export is valid JSON
            expect(() => JSON.parse(jsonData)).not.toThrow();

            // Import data
            const { songs: importedSongs, setlists: importedSetlists } = 
              await exportImportService.importData(jsonData, 'merge');

            // Verify songs are preserved
            expect(importedSongs).toHaveLength(songs.length);
            for (let i = 0; i < songs.length; i++) {
              expect(importedSongs[i]).toEqual(songs[i]);
            }

            // Verify setlists are preserved
            expect(importedSetlists).toHaveLength(setlists.length);
            for (let i = 0; i < setlists.length; i++) {
              expect(importedSetlists[i]).toEqual(setlists[i]);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate export data structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { maxLength: 10 }),
          fc.array(setlistGenerator, { maxLength: 5 }),
          async (songs, setlists) => {
            // Export data
            const jsonData = await exportImportService.exportAllData(songs, setlists);

            // Validate the structure
            const isValid = exportImportService.validateImportData(jsonData);
            expect(isValid).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid import data', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid json'),
            fc.constant('{}'),
            fc.constant('{"version": "1.0"}'),
            fc.constant('{"version": "1.0", "exportDate": 123}'),
            fc.constant('{"version": "1.0", "exportDate": 123, "songs": "not an array"}'),
          ),
          (invalidData) => {
            const isValid = exportImportService.validateImportData(invalidData);
            expect(isValid).toBe(false);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle empty data sets', async () => {
      const jsonData = await exportImportService.exportAllData([], []);
      const { songs, setlists } = await exportImportService.importData(jsonData, 'merge');

      expect(songs).toEqual([]);
      expect(setlists).toEqual([]);
    });

    it('should preserve song sections through round-trip', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              title: fc.string({ minLength: 1 }),
              artist: fc.option(fc.string()),
              durationSeconds: fc.option(fc.float({ min: 0, max: 3600, noNaN: true })),
              lines: fc.array(
                fc.record({
                  id: fc.string({ minLength: 1 }),
                  text: fc.string(),
                  timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
                  section: fc.record({
                    type: fc.constantFrom('verse', 'chorus', 'bridge'),
                    label: fc.option(fc.string({ minLength: 1 })),
                    number: fc.option(fc.integer({ min: 1, max: 10 })),
                  }),
                }),
                { minLength: 1, maxLength: 10 }
              ),
              createdAt: fc.integer({ min: 0 }),
              updatedAt: fc.integer({ min: 0 }),
            }) as fc.Arbitrary<Song>,
            { minLength: 1, maxLength: 5 }
          ),
          async (songs) => {
            const jsonData = await exportImportService.exportAllData(songs, []);
            const { songs: importedSongs } = await exportImportService.importData(jsonData, 'merge');

            // Verify sections are preserved
            for (let i = 0; i < songs.length; i++) {
              expect(importedSongs[i].lines).toHaveLength(songs[i].lines.length);
              for (let j = 0; j < songs[i].lines.length; j++) {
                expect(importedSongs[i].lines[j].section).toEqual(songs[i].lines[j].section);
              }
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
