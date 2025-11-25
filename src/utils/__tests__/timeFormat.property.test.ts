// utils/__tests__/timeFormat.property.test.ts

import fc from 'fast-check';
import { parseTimeInput, formatTimeDisplay, formatTimeForEdit } from '../timeFormat';

/**
 * Feature: time-input-format, Property 1: Konwersja MM:SS na sekundy jest poprawna
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 5.1
 */
describe('Property 1: Konwersja MM:SS na sekundy jest poprawna', () => {
  it('should correctly convert MM:SS format to seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }), // minutes
        fc.integer({ min: 0, max: 999 }), // seconds (can be > 59)
        (minutes, seconds) => {
          const input = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(minutes * 60 + seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly convert MM:SS format with single digit seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }), // minutes
        fc.integer({ min: 0, max: 9 }), // single digit seconds
        (minutes, seconds) => {
          const input = `${minutes}:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(minutes * 60 + seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly convert MM:SS format with decimal seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }), // minutes
        fc.float({ min: 0, max: 999, noNaN: true }), // seconds with decimals
        (minutes, seconds) => {
          const input = `${minutes}:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBeCloseTo(minutes * 60 + seconds, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle minutes > 59 correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 60, max: 999 }), // minutes > 59
        fc.integer({ min: 0, max: 59 }), // seconds
        (minutes, seconds) => {
          const input = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(minutes * 60 + seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle seconds > 59 correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }), // minutes
        fc.integer({ min: 60, max: 999 }), // seconds > 59
        (minutes, seconds) => {
          const input = `${minutes}:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(minutes * 60 + seconds);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: time-input-format, Property 3: Round-trip konwersji zachowuje wartość
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 5.1
 */
describe('Property 3: Round-trip konwersji zachowuje wartość', () => {
  it('should preserve value through format -> parse -> format cycle for values >= 60', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 60, max: 7200, noNaN: true }), // seconds >= 60
        (seconds) => {
          // Format to MM:SS
          const formatted = formatTimeForEdit(seconds);
          
          // Parse back to seconds
          const parsed = parseTimeInput(formatted);
          
          expect(parsed.success).toBe(true);
          expect(parsed.seconds).toBeCloseTo(seconds, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve value through format -> parse -> format cycle for values < 60', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(59.99), noNaN: true }), // seconds < 60
        (seconds) => {
          // Format to seconds string
          const formatted = formatTimeForEdit(seconds);
          
          // Parse back to seconds
          const parsed = parseTimeInput(formatted);
          
          expect(parsed.success).toBe(true);
          expect(parsed.seconds).toBeCloseTo(seconds, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve integer values through parse -> format -> parse cycle', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }), // minutes
        fc.integer({ min: 0, max: 59 }), // seconds
        (minutes, seconds) => {
          const input = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          
          // Parse to seconds
          const parsed1 = parseTimeInput(input);
          expect(parsed1.success).toBe(true);
          
          // Format back to string
          const formatted = formatTimeForEdit(parsed1.seconds!);
          
          // Parse again
          const parsed2 = parseTimeInput(formatted);
          expect(parsed2.success).toBe(true);
          
          // Should be the same
          expect(parsed2.seconds).toBe(parsed1.seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle display format round-trip with rounding for integer seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7200 }), // integer seconds
        (seconds) => {
          // Format for display (rounds to nearest second)
          const displayed = formatTimeDisplay(seconds);
          
          // Parse back
          const parsed = parseTimeInput(displayed);
          
          expect(parsed.success).toBe(true);
          expect(parsed.seconds).toBe(seconds);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: time-input-format, Property 4: Parser akceptuje format sekund
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5, 3.1, 3.2, 5.1
 */
describe('Property 4: Parser akceptuje format sekund', () => {
  it('should accept integer seconds format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7200 }),
        (seconds) => {
          const input = seconds.toString();
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept decimal seconds format', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 7200, noNaN: true }),
        (seconds) => {
          const input = seconds.toString();
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBeCloseTo(seconds, 5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept seconds format with leading/trailing whitespace', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 7200 }),
        fc.string({ maxLength: 5 }).filter(s => /^\s*$/.test(s)), // whitespace only
        fc.string({ maxLength: 5 }).filter(s => /^\s*$/.test(s)), // whitespace only
        (seconds, leadingWs, trailingWs) => {
          const input = `${leadingWs}${seconds}${trailingWs}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept MM:SS format with leading/trailing whitespace', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999 }),
        fc.integer({ min: 0, max: 59 }),
        fc.string({ maxLength: 5 }).filter(s => /^\s*$/.test(s)), // whitespace only
        fc.string({ maxLength: 5 }).filter(s => /^\s*$/.test(s)), // whitespace only
        (minutes, seconds, leadingWs, trailingWs) => {
          const timeStr = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
          const input = `${leadingWs}${timeStr}${trailingWs}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(minutes * 60 + seconds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle zero correctly in both formats', () => {
    expect(parseTimeInput('0')).toEqual({ success: true, seconds: 0 });
    expect(parseTimeInput('0:0')).toEqual({ success: true, seconds: 0 });
    expect(parseTimeInput('0:00')).toEqual({ success: true, seconds: 0 });
  });

  it('should handle very large values correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 9999 }),
        (seconds) => {
          const input = seconds.toString();
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(true);
          expect(result.seconds).toBe(seconds);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Feature: time-input-format, Property 5: Parser odrzuca niepoprawne formaty
 * Validates: Requirements 1.4, 4.1, 4.2
 */
describe('Property 5: Parser odrzuca niepoprawne formaty', () => {
  it('should reject empty strings', () => {
    const result = parseTimeInput('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should reject whitespace-only strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^\s+$/.test(s)),
        (whitespace) => {
          const result = parseTimeInput(whitespace);
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject HH:MM:SS format (more than 2 parts)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }), // hours
        fc.integer({ min: 0, max: 59 }), // minutes
        fc.integer({ min: 0, max: 59 }), // seconds
        (hours, minutes, seconds) => {
          const input = `${hours}:${minutes}:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('Invalid format');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject formats with more than 3 colons', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 99 }), { minLength: 4, maxLength: 6 }),
        (parts) => {
          const input = parts.join(':');
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('Invalid format');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject non-numeric strings', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => s.trim() !== '' && isNaN(parseFloat(s)) && !s.includes(':')),
        (invalidString) => {
          const result = parseTimeInput(invalidString);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('Invalid format');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject MM:SS with non-numeric minutes', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 })
          .filter(s => s.trim() !== '' && isNaN(parseFloat(s))),
        fc.integer({ min: 0, max: 59 }),
        (invalidMinutes, seconds) => {
          const input = `${invalidMinutes}:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('Invalid format');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject MM:SS with non-numeric seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.string({ minLength: 1, maxLength: 10 })
          .filter(s => s.trim() !== '' && isNaN(parseFloat(s))),
        (minutes, invalidSeconds) => {
          const input = `${minutes}:${invalidSeconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('Invalid format');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject negative seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -9999, max: -1 }),
        (negativeSeconds) => {
          const input = negativeSeconds.toString();
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('negative');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject negative minutes in MM:SS format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -99, max: -1 }),
        fc.integer({ min: 0, max: 59 }),
        (negativeMinutes, seconds) => {
          const input = `${negativeMinutes}:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('negative');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject negative seconds in MM:SS format', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        fc.integer({ min: -59, max: -1 }),
        (minutes, negativeSeconds) => {
          const input = `${minutes}:${negativeSeconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('negative');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject both negative minutes and seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -99, max: -1 }),
        fc.integer({ min: -59, max: -1 }),
        (negativeMinutes, negativeSeconds) => {
          const input = `${negativeMinutes}:${negativeSeconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toContain('negative');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject incomplete MM:SS format (trailing colon)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 99 }),
        (minutes) => {
          const input = `${minutes}:`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject incomplete MM:SS format (leading colon)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 59 }),
        (seconds) => {
          const input = `:${seconds}`;
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject pure alphabetic strings', () => {
    const invalidChars = ['abc', 'test', 'hello', 'world', 'xyz'];
    
    invalidChars.forEach(input => {
      const result = parseTimeInput(input);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it('should reject strings starting with non-numeric characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 5 })
          .filter(s => /^[a-zA-Z]/.test(s) && !/^\d/.test(s)), // starts with letter, not digit
        (letters) => {
          const result = parseTimeInput(letters);
          
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject truly NaN-producing inputs', () => {
    // Note: 'Infinity' and '-Infinity' are actually valid numbers in JavaScript
    // We test inputs that parseFloat cannot convert to a number
    const nanInputs = ['NaN', 'undefined', 'null', 'notanumber', 'xyz'];
    
    nanInputs.forEach(input => {
      const result = parseTimeInput(input);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it('should reject multiple colons in a row', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 5 }),
        (colonCount) => {
          const input = ':'.repeat(colonCount);
          const result = parseTimeInput(input);
          
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should provide meaningful error messages for all invalid formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),
          fc.constant('abc'),
          fc.constant('1:2:3'),
          fc.constant('-5'),
          fc.constant('1:'),
          fc.constant(':30')
        ),
        (invalidInput) => {
          const result = parseTimeInput(invalidInput);
          
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
          expect(result.error!.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
