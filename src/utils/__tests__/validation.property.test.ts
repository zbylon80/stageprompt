// utils/__tests__/validation.property.test.ts

import fc from 'fast-check';
import { validateImportData, ExportData } from '../validation';
import { Song, Setlist, LyricLine } from '../../types/models';

/**
 * Feature: teleprompter-app, Property 29: Walidacja odrzuca niepoprawne dane importu
 * Validates: Requirements 12.2, 12.4
 */
describe('Property 29: Walidacja odrzuca niepoprawne dane importu', () => {
  describe('validateImportData - rejects invalid data', () => {
    it('should reject data with missing version field', () => {
      fc.assert(
        fc.property(
          fc.record({
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(validSongGenerator()),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with missing exportDate field', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            songs: fc.array(validSongGenerator()),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with missing songs field', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with missing setlists field', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(validSongGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with invalid song structure (missing id)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(
              fc.record({
                title: fc.string({ minLength: 1 }),
                lines: fc.array(validLyricLineGenerator()),
                createdAt: fc.integer({ min: 0 }),
                updatedAt: fc.integer({ min: 0 }),
              }),
              { minLength: 1 } // Ensure at least one invalid song
            ),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with invalid song structure (missing title)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                lines: fc.array(validLyricLineGenerator()),
                createdAt: fc.integer({ min: 0 }),
                updatedAt: fc.integer({ min: 0 }),
              }),
              { minLength: 1 } // Ensure at least one invalid song
            ),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with invalid lyric line structure (missing id)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                title: fc.string({ minLength: 1 }),
                lines: fc.array(
                  fc.record({
                    text: fc.string(),
                    timeSeconds: fc.float({ min: 0, max: 3600 }),
                  }),
                  { minLength: 1 } // Ensure at least one invalid line
                ),
                createdAt: fc.integer({ min: 0 }),
                updatedAt: fc.integer({ min: 0 }),
              }),
              { minLength: 1 } // Ensure at least one song with invalid lines
            ),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with invalid setlist structure (missing id)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(validSongGenerator()),
            setlists: fc.array(
              fc.record({
                name: fc.string({ minLength: 1 }),
                songIds: fc.array(fc.string()),
                createdAt: fc.integer({ min: 0 }),
                updatedAt: fc.integer({ min: 0 }),
              }),
              { minLength: 1 } // Ensure at least one invalid setlist
            ),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with invalid setlist structure (missing name)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(validSongGenerator()),
            setlists: fc.array(
              fc.record({
                id: fc.string({ minLength: 1 }),
                songIds: fc.array(fc.string()),
                createdAt: fc.integer({ min: 0 }),
                updatedAt: fc.integer({ min: 0 }),
              }),
              { minLength: 1 } // Ensure at least one invalid setlist
            ),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with wrong type for version (number instead of string)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.integer(),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(validSongGenerator()),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with wrong type for exportDate (string instead of number)', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.string(),
            songs: fc.array(validSongGenerator()),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with songs as non-array', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.string(),
            setlists: fc.array(validSetlistGenerator()),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject data with setlists as non-array', () => {
      fc.assert(
        fc.property(
          fc.record({
            version: fc.string({ minLength: 1 }),
            exportDate: fc.integer({ min: 0 }),
            songs: fc.array(validSongGenerator()),
            setlists: fc.string(),
          }),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject null or undefined data', () => {
      expect(validateImportData(null)).toBe(false);
      expect(validateImportData(undefined)).toBe(false);
    });

    it('should reject non-object data', () => {
      expect(validateImportData('string')).toBe(false);
      expect(validateImportData(123)).toBe(false);
      expect(validateImportData(true)).toBe(false);
      expect(validateImportData([])).toBe(false);
    });

    it('should accept valid import data', () => {
      fc.assert(
        fc.property(
          validExportDataGenerator(),
          (data) => {
            const result = validateImportData(data);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// Generators for valid data structures
function validLyricLineGenerator(): fc.Arbitrary<LyricLine> {
  return fc.record({
    id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    text: fc.string(),
    timeSeconds: fc.float({ min: 0, max: 3600, noNaN: true }),
  });
}

function validSongGenerator(): fc.Arbitrary<Song> {
  return fc.record({
    id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    title: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    artist: fc.option(fc.string()),
    durationSeconds: fc.option(fc.float({ min: 0, max: 7200, noNaN: true })),
    lines: fc.array(validLyricLineGenerator()),
    createdAt: fc.integer({ min: 0 }),
    updatedAt: fc.integer({ min: 0 }),
  });
}

function validSetlistGenerator(): fc.Arbitrary<Setlist> {
  return fc.record({
    id: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    name: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    songIds: fc.array(fc.string()),
    createdAt: fc.integer({ min: 0 }),
    updatedAt: fc.integer({ min: 0 }),
  });
}

function validExportDataGenerator(): fc.Arbitrary<ExportData> {
  return fc.record({
    version: fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
    exportDate: fc.integer({ min: 0 }),
    songs: fc.array(validSongGenerator()),
    setlists: fc.array(validSetlistGenerator()),
  });
}
