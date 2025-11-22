import fc from 'fast-check';
import { calculateScrollY } from '../scrollAlgorithm';
import { LyricLine } from '../../types/models';

/**
 * Feature: teleprompter-app, Property 10: Algorytm przewijania - interpolacja liniowa
 * Validates: Requirements 5.6
 */
describe('calculateScrollY - linear interpolation property', () => {
  it('should interpolate linearly between two consecutive lines', () => {
    fc.assert(
      fc.property(
        // Generate array of lines with sorted times
        fc
          .array(
            fc.record({
              id: fc.string(),
              text: fc.string(),
              timeSeconds: fc.float({ min: 0, max: 1000, noNaN: true }),
            }),
            { minLength: 2, maxLength: 20 }
          )
          .map((lines) => {
            // Sort by time and ensure unique times
            const sorted = lines.sort((a, b) => a.timeSeconds - b.timeSeconds);
            // Make times unique by adding small increments
            return sorted.map((line, idx) => ({
              ...line,
              timeSeconds: line.timeSeconds + idx * 0.01,
            }));
          }),
        fc.float({ min: 10, max: 100, noNaN: true }), // lineHeight
        fc.float({ min: 0, max: 1000, noNaN: true }), // anchorY
        (lines, lineHeight, anchorY) => {
          // Skip if we don't have at least 2 lines
          if (lines.length < 2) return true;

          // Pick two consecutive lines
          const i = Math.floor(Math.random() * (lines.length - 1));
          const t0 = lines[i].timeSeconds;
          const t1 = lines[i + 1].timeSeconds;

          // Skip if times are too close or equal
          if (t1 - t0 < 0.001) return true;

          // Test at midpoint between the two lines
          const currentTime = t0 + (t1 - t0) * 0.5;

          const scrollY = calculateScrollY({
            currentTime,
            lines,
            lineHeight,
            anchorY,
          });

          // Calculate expected Y position
          const y0 = i * lineHeight;
          const y1 = (i + 1) * lineHeight;
          const expectedY = y0 + (y1 - y0) * 0.5 - anchorY;

          // Allow small floating point error
          return Math.abs(scrollY - expectedY) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should position first line at anchor when time is before first line', () => {
    fc.assert(
      fc.property(
        fc
          .array(
            fc.record({
              id: fc.string(),
              text: fc.string(),
              timeSeconds: fc.float({ min: 10, max: 1000, noNaN: true }),
            }),
            { minLength: 1, maxLength: 20 }
          )
          .map((lines) => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
        fc.float({ min: 10, max: 100, noNaN: true }), // lineHeight
        fc.float({ min: 0, max: 1000, noNaN: true }), // anchorY
        (lines, lineHeight, anchorY) => {
          if (lines.length === 0) return true;

          // Time before first line
          const currentTime = lines[0].timeSeconds - 5;

          const scrollY = calculateScrollY({
            currentTime,
            lines,
            lineHeight,
            anchorY,
          });

          // First line (index 0) should be at anchor
          const expectedY = 0 * lineHeight - anchorY;

          return Math.abs(scrollY - expectedY) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should position last line at anchor when time is after last line', () => {
    fc.assert(
      fc.property(
        fc
          .array(
            fc.record({
              id: fc.string(),
              text: fc.string(),
              timeSeconds: fc.float({ min: 0, max: 1000, noNaN: true }),
            }),
            { minLength: 1, maxLength: 20 }
          )
          .map((lines) => lines.sort((a, b) => a.timeSeconds - b.timeSeconds)),
        fc.float({ min: 10, max: 100, noNaN: true }), // lineHeight
        fc.float({ min: 0, max: 1000, noNaN: true }), // anchorY
        (lines, lineHeight, anchorY) => {
          if (lines.length === 0) return true;

          // Time after last line
          const currentTime = lines[lines.length - 1].timeSeconds + 5;

          const scrollY = calculateScrollY({
            currentTime,
            lines,
            lineHeight,
            anchorY,
          });

          // Last line should be at anchor
          const lastIndex = lines.length - 1;
          const expectedY = lastIndex * lineHeight - anchorY;

          return Math.abs(scrollY - expectedY) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle empty lines array', () => {
    const scrollY = calculateScrollY({
      currentTime: 10,
      lines: [],
      lineHeight: 60,
      anchorY: 200,
    });

    expect(scrollY).toBe(0);
  });

  it('should interpolate correctly at various fractions between lines', () => {
    fc.assert(
      fc.property(
        fc
          .array(
            fc.record({
              id: fc.string(),
              text: fc.string(),
              timeSeconds: fc.float({ min: 0, max: 1000, noNaN: true }),
            }),
            { minLength: 2, maxLength: 20 }
          )
          .map((lines) => {
            const sorted = lines.sort((a, b) => a.timeSeconds - b.timeSeconds);
            return sorted.map((line, idx) => ({
              ...line,
              timeSeconds: line.timeSeconds + idx * 0.1,
            }));
          }),
        fc.float({ min: 10, max: 100, noNaN: true }), // lineHeight
        fc.float({ min: 0, max: 1000, noNaN: true }), // anchorY
        fc.float({ min: 0, max: 1, noNaN: true }), // fraction
        (lines, lineHeight, anchorY, fraction) => {
          if (lines.length < 2) return true;

          const i = Math.floor(Math.random() * (lines.length - 1));
          const t0 = lines[i].timeSeconds;
          const t1 = lines[i + 1].timeSeconds;

          if (t1 - t0 < 0.001) return true;

          // Test at specific fraction
          const currentTime = t0 + (t1 - t0) * fraction;

          const scrollY = calculateScrollY({
            currentTime,
            lines,
            lineHeight,
            anchorY,
          });

          // Calculate expected Y position
          const y0 = i * lineHeight;
          const y1 = (i + 1) * lineHeight;
          const expectedY = y0 + (y1 - y0) * fraction - anchorY;

          return Math.abs(scrollY - expectedY) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });
});
