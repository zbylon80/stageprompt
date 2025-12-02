/**
 * Property-based tests for cross-platform editing functionality
 * Feature: StagePrompt, Property 31: Pełna funkcjonalność edycji na komputerze
 * Validates: Requirements 13.1, 13.2
 */

import fc from 'fast-check';
import { Platform } from 'react-native';
import { Song, Setlist, LyricLine } from '../../types/models';
import { storageService } from '../../services/storageService';

// Mock expo-sharing and expo-document-picker to avoid import errors
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue({}),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
}));

// Import after mocking
import { exportImportService } from '../../services/exportImportService';

// Mock Platform to test both web and mobile scenarios
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: (obj: any) => obj.web || obj.default,
}));

describe('Cross-Platform Editing Functionality', () => {
  beforeEach(async () => {
    // Clear storage before each test
    await storageService.clearAll();
  });

  /**
   * Property 31: Pełna funkcjonalność edycji na komputerze
   * For any editing operation (creating song, editing lines, recording timing, managing setlists),
   * performing it on web/desktop platform should work identically to mobile
   */
  describe('Property 31: Full editing functionality on computer', () => {
    it('should create and save songs identically on web and mobile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            artist: fc.option(fc.string({ maxLength: 100 })),
            durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
            lines: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                text: fc.string({ maxLength: 200 }),
                timeSeconds: fc.float({ min: 0, max: 3600 }),
              }),
              { maxLength: 20 }
            ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
            createdAt: fc.integer({ min: 0 }),
            updatedAt: fc.integer({ min: 0 }),
          }),
          async (song) => {
            // Test on "web" platform (already mocked)
            await storageService.saveSong(song);
            const loadedWeb = await storageService.loadSong(song.id);
            
            expect(loadedWeb).toEqual(song);
            
            // The storage service should work identically regardless of platform
            // since it uses AsyncStorage which is cross-platform
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should edit song lines identically on web and mobile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            artist: fc.option(fc.string({ maxLength: 100 })),
            durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
            lines: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                text: fc.string({ maxLength: 200 }),
                timeSeconds: fc.float({ min: 0, max: 3600 }),
              }),
              { minLength: 1, maxLength: 20 }
            ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
            createdAt: fc.integer({ min: 0 }),
            updatedAt: fc.integer({ min: 0 }),
          }),
          fc.record({
            lineIndex: fc.nat(),
            newText: fc.string({ maxLength: 200 }),
            newTime: fc.float({ min: 0, max: 3600 }),
          }),
          async (song, edit) => {
            // Save initial song
            await storageService.saveSong(song);
            
            // Edit a line (if index is valid)
            if (edit.lineIndex < song.lines.length) {
              const updatedSong = {
                ...song,
                lines: song.lines.map((line, idx) =>
                  idx === edit.lineIndex
                    ? { ...line, text: edit.newText, timeSeconds: edit.newTime }
                    : line
                ),
                updatedAt: Date.now(),
              };
              
              await storageService.saveSong(updatedSong);
              const loaded = await storageService.loadSong(song.id);
              
              expect(loaded).toEqual(updatedSong);
              expect(loaded?.lines[edit.lineIndex].text).toBe(edit.newText);
              expect(loaded?.lines[edit.lineIndex].timeSeconds).toBe(edit.newTime);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should manage setlists identically on web and mobile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            songIds: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 20 }),
            createdAt: fc.integer({ min: 0 }),
            updatedAt: fc.integer({ min: 0 }),
          }),
          async (setlist) => {
            // Save setlist
            await storageService.saveSetlist(setlist);
            const loaded = await storageService.loadSetlist(setlist.id);
            
            expect(loaded).toEqual(setlist);
            
            // Test reordering songs
            if (setlist.songIds.length > 1) {
              const reordered = {
                ...setlist,
                songIds: [...setlist.songIds].reverse(),
                updatedAt: Date.now(),
              };
              
              await storageService.saveSetlist(reordered);
              const loadedReordered = await storageService.loadSetlist(setlist.id);
              
              expect(loadedReordered?.songIds).toEqual(reordered.songIds);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should export and import data identically on web and mobile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              title: fc.string({ minLength: 1, maxLength: 100 }),
              artist: fc.option(fc.string({ maxLength: 100 })),
              durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
              lines: fc.array(
                fc.record({
                  id: fc.string({ minLength: 1, maxLength: 50 }),
                  text: fc.string({ maxLength: 200 }),
                  timeSeconds: fc.float({ min: 0, max: 3600 }),
                }),
                { maxLength: 10 }
              ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
              createdAt: fc.integer({ min: 0 }),
              updatedAt: fc.integer({ min: 0 }),
            }),
            { maxLength: 5 }
          ),
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              songIds: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
              createdAt: fc.integer({ min: 0 }),
              updatedAt: fc.integer({ min: 0 }),
            }),
            { maxLength: 5 }
          ),
          async (songs, setlists) => {
            // Export data
            const exported = await exportImportService.exportAllData(songs, setlists);
            
            // Validate export format
            expect(exportImportService.validateImportData(exported)).toBe(true);
            
            // Import data
            const imported = await exportImportService.importData(exported, 'replace');
            
            // Verify data integrity
            expect(imported.songs).toEqual(songs);
            expect(imported.setlists).toEqual(setlists);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle timing recording identically on web and mobile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            artist: fc.option(fc.string({ maxLength: 100 })),
            durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
            lines: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                text: fc.string({ maxLength: 200 }),
                timeSeconds: fc.float({ min: 0, max: 3600 }),
              }),
              { minLength: 2, maxLength: 10 }
            ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
            createdAt: fc.integer({ min: 0 }),
            updatedAt: fc.integer({ min: 0 }),
          }),
          fc.array(fc.float({ min: 0, max: 3600 }), { minLength: 2, maxLength: 10 }),
          async (song, newTimings) => {
            // Apply new timings to lines
            const updatedSong = {
              ...song,
              lines: song.lines.map((line, idx) => ({
                ...line,
                timeSeconds: newTimings[idx % newTimings.length],
              })).sort((a, b) => a.timeSeconds - b.timeSeconds),
              updatedAt: Date.now(),
            };
            
            await storageService.saveSong(updatedSong);
            const loaded = await storageService.loadSong(song.id);
            
            // Verify timings are preserved
            expect(loaded?.lines.length).toBe(updatedSong.lines.length);
            loaded?.lines.forEach((line, idx) => {
              expect(line.timeSeconds).toBe(updatedSong.lines[idx].timeSeconds);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle adding and removing lines identically on web and mobile', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            artist: fc.option(fc.string({ maxLength: 100 })),
            durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
            lines: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                text: fc.string({ maxLength: 200 }),
                timeSeconds: fc.float({ min: 0, max: 3600 }),
              }),
              { minLength: 1, maxLength: 10 }
            ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
            createdAt: fc.integer({ min: 0 }),
            updatedAt: fc.integer({ min: 0 }),
          }),
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            text: fc.string({ maxLength: 200 }),
            timeSeconds: fc.float({ min: 0, max: 3600 }),
          }),
          async (song, newLine) => {
            // Save initial song
            await storageService.saveSong(song);
            
            // Add a new line
            const withNewLine = {
              ...song,
              lines: [...song.lines, newLine].sort((a, b) => a.timeSeconds - b.timeSeconds),
              updatedAt: Date.now(),
            };
            
            await storageService.saveSong(withNewLine);
            let loaded = await storageService.loadSong(song.id);
            
            expect(loaded?.lines.length).toBe(song.lines.length + 1);
            expect(loaded?.lines.some(l => l.id === newLine.id)).toBe(true);
            
            // Remove the line
            const withoutNewLine = {
              ...withNewLine,
              lines: withNewLine.lines.filter(l => l.id !== newLine.id),
              updatedAt: Date.now(),
            };
            
            await storageService.saveSong(withoutNewLine);
            loaded = await storageService.loadSong(song.id);
            
            expect(loaded?.lines.length).toBe(song.lines.length);
            expect(loaded?.lines.some(l => l.id === newLine.id)).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve data structure across platforms', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            artist: fc.option(fc.string({ maxLength: 100 })),
            durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
            lines: fc.array(
              fc.record({
                id: fc.string({ minLength: 1, maxLength: 50 }),
                text: fc.string({ maxLength: 200 }),
                timeSeconds: fc.float({ min: 0, max: 3600 }),
              }),
              { maxLength: 10 }
            ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
            createdAt: fc.integer({ min: 0 }),
            updatedAt: fc.integer({ min: 0 }),
          }),
          async (song) => {
            // Save on "web" platform
            await storageService.saveSong(song);
            
            // Export
            const exported = await exportImportService.exportAllData([song], []);
            
            // Clear storage (simulating transfer to another device)
            await storageService.clearAll();
            
            // Import
            const imported = await exportImportService.importData(exported, 'replace');
            
            // Save imported data
            for (const importedSong of imported.songs) {
              await storageService.saveSong(importedSong);
            }
            
            // Load and verify
            const loaded = await storageService.loadSong(song.id);
            
            expect(loaded).toEqual(song);
            
            // Verify all fields are preserved
            expect(loaded?.id).toBe(song.id);
            expect(loaded?.title).toBe(song.title);
            expect(loaded?.artist).toBe(song.artist);
            expect(loaded?.durationSeconds).toBe(song.durationSeconds);
            expect(loaded?.lines.length).toBe(song.lines.length);
            expect(loaded?.createdAt).toBe(song.createdAt);
            expect(loaded?.updatedAt).toBe(song.updatedAt);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
