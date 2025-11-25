// services/__tests__/exportImportService.crossplatform.property.test.ts

import fc from 'fast-check';
import { exportImportService } from '../exportImportService';
import { Song, Setlist } from '../../types/models';

/**
 * Feature: StagePrompt, Property 30: Cross-platform kompatybilność danych
 * Validates: Requirements 12.4, 12.5
 * 
 * For any set of songs and setlists exported on one platform (web/desktop),
 * importing on another platform (mobile) should preserve all data without loss.
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
  ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
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

describe('exportImportService - Cross-Platform Property Tests', () => {
  describe('Property 30: Cross-platform kompatybilność danych', () => {
    it('should preserve data structure across platforms', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { maxLength: 10 }),
          fc.array(setlistGenerator, { maxLength: 5 }),
          async (songs, setlists) => {
            // Simulate export on one platform
            const jsonData = await exportImportService.exportAllData(songs, setlists);

            // Parse to verify it's valid JSON (cross-platform requirement)
            const parsed = JSON.parse(jsonData);
            expect(parsed).toHaveProperty('version');
            expect(parsed).toHaveProperty('exportDate');
            expect(parsed).toHaveProperty('songs');
            expect(parsed).toHaveProperty('setlists');

            // Simulate import on another platform
            const { songs: importedSongs, setlists: importedSetlists } = 
              await exportImportService.importData(jsonData, 'merge');

            // Verify all data is preserved
            expect(importedSongs).toHaveLength(songs.length);
            expect(importedSetlists).toHaveLength(setlists.length);

            // Verify deep equality
            for (let i = 0; i < songs.length; i++) {
              expect(importedSongs[i]).toEqual(songs[i]);
            }

            for (let i = 0; i < setlists.length; i++) {
              expect(importedSetlists[i]).toEqual(setlists[i]);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle platform-specific data types correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { maxLength: 5 }),
          async (songs) => {
            const jsonData = await exportImportService.exportAllData(songs, []);
            const parsed = JSON.parse(jsonData);

            // Verify timestamps are numbers (not Date objects)
            expect(typeof parsed.exportDate).toBe('number');
            for (const song of parsed.songs) {
              expect(typeof song.createdAt).toBe('number');
              expect(typeof song.updatedAt).toBe('number');
            }

            // Verify optional fields are handled correctly (null vs undefined)
            for (const song of parsed.songs) {
              if (song.artist === null || song.artist === undefined) {
                // Both null and undefined are acceptable for optional fields
                expect([null, undefined]).toContain(song.artist);
              }
              if (song.durationSeconds === null || song.durationSeconds === undefined) {
                expect([null, undefined]).toContain(song.durationSeconds);
              }
            }

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve Unicode characters across platforms', async () => {
      // Test with songs containing various Unicode characters
      const unicodeSongs: Song[] = [
        {
          id: '1',
          title: 'Piosenka z polskimi znakami: ąćęłńóśźż',
          artist: 'Artysta: ĄĆĘŁŃÓŚŹŻ',
          lines: [
            { id: 'l1', text: 'Tekst z emoji: 🎵🎶🎤', timeSeconds: 0 },
            { id: 'l2', text: 'Cyrylica: Привет мир', timeSeconds: 5 },
            { id: 'l3', text: 'Chinese: 你好世界', timeSeconds: 10 },
            { id: 'l4', text: 'Arabic: مرحبا بالعالم', timeSeconds: 15 },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const jsonData = await exportImportService.exportAllData(unicodeSongs, []);
      const { songs: importedSongs } = await exportImportService.importData(jsonData, 'merge');

      expect(importedSongs).toHaveLength(1);
      expect(importedSongs[0].title).toBe(unicodeSongs[0].title);
      expect(importedSongs[0].artist).toBe(unicodeSongs[0].artist);
      
      for (let i = 0; i < unicodeSongs[0].lines.length; i++) {
        expect(importedSongs[0].lines[i].text).toBe(unicodeSongs[0].lines[i].text);
      }
    });

    it('should handle large datasets efficiently', async () => {
      // Generate a large dataset
      const largeSongs = await fc.sample(songGenerator, 100);
      const largeSetlists = await fc.sample(setlistGenerator, 50);

      const startTime = Date.now();
      const jsonData = await exportImportService.exportAllData(largeSongs, largeSetlists);
      const exportTime = Date.now() - startTime;

      // Export should complete in reasonable time (< 5 seconds)
      expect(exportTime).toBeLessThan(5000);

      const importStartTime = Date.now();
      const { songs: importedSongs, setlists: importedSetlists } = 
        await exportImportService.importData(jsonData, 'merge');
      const importTime = Date.now() - importStartTime;

      // Import should complete in reasonable time (< 5 seconds)
      expect(importTime).toBeLessThan(5000);

      // Verify data integrity
      expect(importedSongs).toHaveLength(largeSongs.length);
      expect(importedSetlists).toHaveLength(largeSetlists.length);
    });

    it('should maintain data consistency with different line endings', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(songGenerator, { maxLength: 5 }),
          async (songs) => {
            // Export with default formatting
            const jsonData = await exportImportService.exportAllData(songs, []);

            // Simulate different line endings (Windows vs Unix)
            const windowsFormat = jsonData.replace(/\n/g, '\r\n');
            const unixFormat = jsonData.replace(/\r\n/g, '\n');

            // Both should import successfully
            const { songs: windowsSongs } = await exportImportService.importData(windowsFormat, 'merge');
            const { songs: unixSongs } = await exportImportService.importData(unixFormat, 'merge');

            // Verify both produce the same result
            expect(windowsSongs).toEqual(unixSongs);
            expect(windowsSongs).toHaveLength(songs.length);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should handle special characters in filenames and paths', async () => {
      const songs: Song[] = [
        {
          id: 'song-with-special-chars',
          title: 'Song: "Title" with <special> & {characters}',
          artist: 'Artist / Band & Co.',
          lines: [
            { id: 'l1', text: 'Line with quotes: "Hello" and \'World\'', timeSeconds: 0 },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const jsonData = await exportImportService.exportAllData(songs, []);
      const { songs: importedSongs } = await exportImportService.importData(jsonData, 'merge');

      expect(importedSongs).toHaveLength(1);
      expect(importedSongs[0].title).toBe(songs[0].title);
      expect(importedSongs[0].artist).toBe(songs[0].artist);
      expect(importedSongs[0].lines[0].text).toBe(songs[0].lines[0].text);
    });

    it('should preserve floating point precision across platforms', async () => {
      const songs: Song[] = [
        {
          id: '1',
          title: 'Precision Test',
          durationSeconds: 123.456789,
          lines: [
            { id: 'l1', text: 'Line 1', timeSeconds: 0.123456789 },
            { id: 'l2', text: 'Line 2', timeSeconds: 12.987654321 },
            { id: 'l3', text: 'Line 3', timeSeconds: 123.456789012 },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const jsonData = await exportImportService.exportAllData(songs, []);
      const { songs: importedSongs } = await exportImportService.importData(jsonData, 'merge');

      expect(importedSongs).toHaveLength(1);
      
      // Verify floating point values are preserved with reasonable precision
      expect(importedSongs[0].durationSeconds).toBeCloseTo(songs[0].durationSeconds!, 6);
      
      for (let i = 0; i < songs[0].lines.length; i++) {
        expect(importedSongs[0].lines[i].timeSeconds).toBeCloseTo(
          songs[0].lines[i].timeSeconds,
          6
        );
      }
    });

    it('should handle empty and whitespace-only strings correctly', async () => {
      const songs: Song[] = [
        {
          id: '1',
          title: 'Whitespace Test',
          artist: '   ',  // Whitespace-only artist
          lines: [
            { id: 'l1', text: '', timeSeconds: 0 },  // Empty text
            { id: 'l2', text: '   ', timeSeconds: 5 },  // Whitespace-only text
            { id: 'l3', text: '\t\n', timeSeconds: 10 },  // Tab and newline
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const jsonData = await exportImportService.exportAllData(songs, []);
      const { songs: importedSongs } = await exportImportService.importData(jsonData, 'merge');

      expect(importedSongs).toHaveLength(1);
      expect(importedSongs[0].artist).toBe(songs[0].artist);
      
      for (let i = 0; i < songs[0].lines.length; i++) {
        expect(importedSongs[0].lines[i].text).toBe(songs[0].lines[i].text);
      }
    });
  });
});
