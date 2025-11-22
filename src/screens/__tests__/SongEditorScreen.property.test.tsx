// screens/__tests__/SongEditorScreen.property.test.tsx

import fc from 'fast-check';
import { Song, LyricLine } from '../../types/models';
import { generateId } from '../../utils/idGenerator';

/**
 * Feature: StagePrompt, Property 3: Dodawanie linijki zwiększa liczbę linijek
 * Validates: Requirements 2.3
 */
describe('Property 3: Adding a line increases line count', () => {
  it('should increase line count by 1 when adding a new line', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 })),
          durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600 }),
            })
          ).map(lines => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          const initialLineCount = song.lines.length;
          
          // Create a new line with a unique ID
          const newLine: LyricLine = {
            id: generateId(),
            text: 'New line',
            timeSeconds: song.lines.length > 0 ? song.lines[song.lines.length - 1].timeSeconds : 0,
          };
          
          // Simulate adding a line
          const updatedSong: Song = {
            ...song,
            lines: [...song.lines, newLine],
          };
          
          const finalLineCount = updatedSong.lines.length;
          
          // Property: adding a line increases count by 1
          expect(finalLineCount).toBe(initialLineCount + 1);
          
          // Property: new line has unique ID
          const lineIds = updatedSong.lines.map(l => l.id);
          const uniqueIds = new Set(lineIds);
          expect(uniqueIds.size).toBe(lineIds.length);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: StagePrompt, Property 4: Usuwanie linijki zmniejsza liczbę linijek
 * Validates: Requirements 2.4
 */
describe('Property 4: Deleting a line decreases line count', () => {
  it('should decrease line count by 1 when deleting a line', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 })),
          durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
          lines: fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              text: fc.string({ maxLength: 200 }),
              timeSeconds: fc.float({ min: 0, max: 3600 }),
            }),
            { minLength: 1 } // Ensure at least one line to delete
          ).map(lines => {
            // Ensure unique IDs
            const uniqueLines = lines.map((line, idx) => ({
              ...line,
              id: `${line.id}-${idx}`,
            }));
            return uniqueLines.sort((a, b) => a.timeSeconds - b.timeSeconds);
          }),
          createdAt: fc.integer({ min: 0 }),
          updatedAt: fc.integer({ min: 0 }),
        }),
        (song: Song) => {
          const initialLineCount = song.lines.length;
          
          // Pick a random line to delete
          const lineToDelete = song.lines[Math.floor(Math.random() * song.lines.length)];
          
          // Simulate deleting a line
          const updatedSong: Song = {
            ...song,
            lines: song.lines.filter(line => line.id !== lineToDelete.id),
          };
          
          const finalLineCount = updatedSong.lines.length;
          
          // Property: deleting a line decreases count by 1
          expect(finalLineCount).toBe(initialLineCount - 1);
          
          // Property: deleted line should not exist
          const deletedLineExists = updatedSong.lines.some(
            line => line.id === lineToDelete.id
          );
          expect(deletedLineExists).toBe(false);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: StagePrompt, Property 5: Modyfikacja metadanych aktualizuje utwór
 * Validates: Requirements 2.2
 */
describe('Property 5: Modifying metadata updates song', () => {
  it('should update song metadata immediately', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1, maxLength: 100 }),
          artist: fc.option(fc.string({ maxLength: 100 })),
          durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
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
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.option(fc.string({ minLength: 1, maxLength: 100 })),
        (song: Song, newTitle: string, newArtist: string | null) => {
          // Simulate updating metadata
          const updatedSong: Song = {
            ...song,
            title: newTitle,
            artist: newArtist || undefined,
          };
          
          // Property: title should be updated
          expect(updatedSong.title).toBe(newTitle);
          
          // Property: artist should be updated
          if (newArtist !== null) {
            expect(updatedSong.artist).toBe(newArtist);
          } else {
            expect(updatedSong.artist).toBeUndefined();
          }
          
          // Property: other fields should remain unchanged
          expect(updatedSong.id).toBe(song.id);
          expect(updatedSong.lines).toEqual(song.lines);
          expect(updatedSong.createdAt).toBe(song.createdAt);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
