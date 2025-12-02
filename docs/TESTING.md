# Testing Guide

This document explains how to run and write tests for StagePrompt.

## Table of Contents

- [Overview](#overview)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Writing Tests](#writing-tests)
- [Property-Based Testing](#property-based-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Best Practices](#best-practices)

---

## Overview

StagePrompt uses a **dual testing approach**:

1. **Unit Tests** - Test specific examples, edge cases, and error conditions
2. **Property-Based Tests** - Test universal properties across many random inputs

Together, they provide comprehensive coverage:
- Unit tests catch concrete bugs
- Property tests verify general correctness

### Testing Stack

- **Jest** - Test runner and assertion library
- **@testing-library/react-native** - Component testing utilities
- **fast-check** - Property-based testing library
- **MCP Playwright** - End-to-end testing through Model Context Protocol

---

## Running Tests

### Run All Tests

```bash
npm test
```

This runs all tests once and exits.

### Watch Mode

```bash
npm run test:watch
```

Watches for file changes and re-runs affected tests.

### Coverage Report

```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory.

### Run Specific Tests

```bash
# Run tests matching pattern
npm test -- --testPathPattern="SongEditor"

# Run only unit tests
npm test -- --testPathPattern="test.tsx?"

# Run only property tests
npm test -- --testPathPattern="property.test"

# Run single test file
npm test -- src/services/__tests__/scrollAlgorithm.property.test.ts
```

### Debug Tests

```bash
# Run with verbose output
npm test -- --verbose

# Run with coverage
npm test -- --coverage --collectCoverageFrom="src/**/*.{ts,tsx}"

# Clear cache if tests behave strangely
npm test -- --clearCache
```

---

## Test Types

### 1. Unit Tests

Test specific functions and components with concrete examples.

**Location:** `src/**/__tests__/*.test.ts(x)`

**Example:**
```typescript
// src/utils/__tests__/timeFormat.test.ts

describe('parseTimeInput', () => {
  it('should parse MM:SS format', () => {
    expect(parseTimeInput('1:14')).toBe(74);
  });
  
  it('should parse seconds format', () => {
    expect(parseTimeInput('74')).toBe(74);
  });
  
  it('should return null for invalid input', () => {
    expect(parseTimeInput('invalid')).toBeNull();
  });
});
```

**When to use:**
- Testing specific examples
- Testing edge cases (empty input, null, undefined)
- Testing error conditions
- Testing UI interactions

### 2. Property-Based Tests

Test universal properties that should hold for all valid inputs.

**Location:** `src/**/__tests__/*.property.test.ts`

**Example:**
```typescript
// src/services/__tests__/scrollAlgorithm.property.test.ts

import fc from 'fast-check';

/**
 * Feature: StagePrompt, Property 10: Algorytm przewijania - interpolacja liniowa
 */
describe('calculateScrollY - linear interpolation', () => {
  it('should interpolate linearly between two lines', () => {
    fc.assert(
      fc.property(
        // Generate random test data
        fc.array(fc.record({
          id: fc.string(),
          text: fc.string(),
          timeSeconds: fc.float({ min: 0, max: 1000 })
        }), { minLength: 2 }),
        fc.float({ min: 0, max: 100 }),
        fc.float({ min: 0, max: 1000 }),
        (lines, lineHeight, anchorY) => {
          // Sort lines by time
          lines.sort((a, b) => a.timeSeconds - b.timeSeconds);
          
          // Pick two consecutive lines
          const i = Math.floor(Math.random() * (lines.length - 1));
          const t0 = lines[i].timeSeconds;
          const t1 = lines[i + 1].timeSeconds;
          
          if (t1 <= t0) return true; // Skip if equal
          
          // Test midpoint
          const currentTime = t0 + (t1 - t0) * 0.5;
          
          const scrollY = calculateScrollY({
            currentTime,
            lines,
            lineHeight,
            anchorY
          });
          
          // Verify linear interpolation
          const y0 = i * lineHeight;
          const y1 = (i + 1) * lineHeight;
          const expectedY = y0 + (y1 - y0) * 0.5 - anchorY;
          
          return Math.abs(scrollY - expectedY) < 0.01;
        }
      ),
      { numRuns: 100 } // Run 100 random tests
    );
  });
});
```

**When to use:**
- Testing algorithms (scroll calculation, timing interpolation)
- Testing data transformations (export/import, serialization)
- Testing invariants (properties that always hold)
- Testing round-trips (save/load, export/import)

### 3. Integration Tests

Test interactions between multiple components.

**Location:** `src/**/__tests__/*.integration.test.tsx`

**Example:**
```typescript
// src/screens/__tests__/SongEditor.integration.test.tsx

describe('SongEditorScreen integration', () => {
  it('should save song when editing', async () => {
    const { getByPlaceholderText, getByText } = render(
      <SongEditorScreen route={{ params: { songId: 'new' } }} />
    );
    
    // Edit title
    fireEvent.changeText(getByPlaceholderText('Song Title'), 'Test Song');
    
    // Wait for auto-save
    await waitFor(() => {
      expect(storageService.saveSong).toHaveBeenCalled();
    });
  });
});
```

### 4. End-to-End Tests

Test complete user workflows in real browser environment.

**Location:** `e2e/test-cases/*.md`

**See:** [End-to-End Testing](#end-to-end-testing) section below

---

## Writing Tests

### Unit Test Template

```typescript
// src/utils/__tests__/myFunction.test.ts

import { myFunction } from '../myFunction';

describe('myFunction', () => {
  describe('with valid input', () => {
    it('should return expected result', () => {
      const result = myFunction('valid input');
      expect(result).toBe('expected output');
    });
  });
  
  describe('with invalid input', () => {
    it('should handle null', () => {
      expect(myFunction(null)).toBeNull();
    });
    
    it('should handle empty string', () => {
      expect(myFunction('')).toBe('');
    });
  });
  
  describe('edge cases', () => {
    it('should handle very long input', () => {
      const longInput = 'a'.repeat(10000);
      expect(myFunction(longInput)).toBeDefined();
    });
  });
});
```

### Property Test Template

```typescript
// src/utils/__tests__/myFunction.property.test.ts

import fc from 'fast-check';
import { myFunction } from '../myFunction';

/**
 * Feature: StagePrompt, Property X: [Property description]
 */
describe('myFunction properties', () => {
  it('should satisfy property X', () => {
    fc.assert(
      fc.property(
        // Define generators for test data
        fc.string(),
        fc.integer({ min: 0, max: 100 }),
        (input, number) => {
          // Test the property
          const result = myFunction(input, number);
          
          // Assert property holds
          return result.length >= input.length;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Component Test Template

```typescript
// src/components/__tests__/MyComponent.test.tsx

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });
  
  it('should handle button press', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <MyComponent title="Test" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

---

## Property-Based Testing

### What is Property-Based Testing?

Instead of testing specific examples, you define **properties** (rules) that should always be true, and the testing library generates hundreds of random test cases to verify the property.

### Benefits

1. **Finds edge cases** you didn't think of
2. **Tests more thoroughly** than manual examples
3. **Documents behavior** as universal rules
4. **Catches regressions** with random inputs

### Common Property Patterns

#### 1. Round-Trip Properties

Test that encoding/decoding returns to original value.

```typescript
/**
 * Feature: StagePrompt, Property 22: Round-trip persystencji utworu
 */
it('should preserve song through save/load cycle', async () => {
  await fc.assert(
    fc.asyncProperty(
      songGenerator, // Custom generator
      async (song) => {
        await storageService.saveSong(song);
        const loaded = await storageService.loadSong(song.id);
        expect(loaded).toEqual(song);
        return true;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### 2. Invariant Properties

Test that certain properties remain constant.

```typescript
/**
 * Feature: StagePrompt, Property 4: Dodawanie linijki zwiększa liczbę linijek
 */
it('should increase line count when adding line', () => {
  fc.assert(
    fc.property(
      songGenerator,
      (song) => {
        const initialCount = song.lines.length;
        const newLine = { id: 'new', text: 'New line', timeSeconds: 0 };
        const updated = { ...song, lines: [...song.lines, newLine] };
        return updated.lines.length === initialCount + 1;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### 3. Idempotence Properties

Test that doing something twice = doing it once.

```typescript
it('should be idempotent', () => {
  fc.assert(
    fc.property(
      fc.string(),
      (input) => {
        const once = normalize(input);
        const twice = normalize(normalize(input));
        return once === twice;
      }
    ),
    { numRuns: 100 }
  );
});
```

#### 4. Metamorphic Properties

Test relationships between inputs and outputs.

```typescript
it('should maintain order relationship', () => {
  fc.assert(
    fc.property(
      fc.array(fc.integer()),
      (arr) => {
        const sorted = sortArray(arr);
        // Check that sorted array is actually sorted
        for (let i = 0; i < sorted.length - 1; i++) {
          if (sorted[i] > sorted[i + 1]) return false;
        }
        return true;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Custom Generators

Create smart generators that produce valid test data:

```typescript
// test/generators.ts

import fc from 'fast-check';

// Generate valid songs
export const songGenerator = fc.record({
  id: fc.string(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  artist: fc.option(fc.string({ maxLength: 100 })),
  durationSeconds: fc.option(fc.float({ min: 0, max: 3600 })),
  lines: fc.array(
    fc.record({
      id: fc.string(),
      text: fc.string({ maxLength: 200 }),
      timeSeconds: fc.float({ min: 0, max: 3600 })
    })
  ).map(lines => 
    // Ensure lines are sorted by time
    lines.sort((a, b) => a.timeSeconds - b.timeSeconds)
  ),
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 })
});

// Generate valid setlists
export const setlistGenerator = fc.record({
  id: fc.string(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  songIds: fc.array(fc.string()),
  createdAt: fc.integer({ min: 0 }),
  updatedAt: fc.integer({ min: 0 })
});

// Use in tests
it('should work with any valid song', () => {
  fc.assert(
    fc.property(songGenerator, (song) => {
      // Test with generated song
      return validateSong(song).length === 0;
    }),
    { numRuns: 100 }
  );
});
```

### Configuration

```typescript
fc.assert(
  fc.property(...),
  {
    numRuns: 100,        // Number of test cases (default: 100)
    seed: 42,            // Seed for reproducibility
    verbose: true,       // Show all test cases
    endOnFailure: false  // Continue after first failure
  }
);
```

---

## End-to-End Testing

### MCP Playwright Setup

StagePrompt uses MCP (Model Context Protocol) Playwright for E2E testing, which allows interactive testing through Kiro IDE.

#### Configuration

File: `.kiro/settings/mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "uvx",
      "args": ["mcp-playwright"],
      "env": {
        "PLAYWRIGHT_BROWSER": "chromium"
      },
      "disabled": false,
      "autoApprove": [
        "mcp_playwright_browser_navigate",
        "mcp_playwright_browser_snapshot",
        "mcp_playwright_browser_take_screenshot"
      ]
    }
  }
}
```

### Running E2E Tests

1. **Start the app:**
   ```bash
   npm run web
   ```

2. **Open Kiro IDE** and use MCP Playwright tools

3. **Follow test cases** in `e2e/test-cases/`

### Test Case Format

Each test case is documented in markdown:

```markdown
## Test Case: TC-001 - Create and Edit Song

**Prerequisites:**
- App running at http://localhost:8081
- No existing songs

**Steps:**
1. Navigate to http://localhost:8081
2. Snapshot: Verify empty state message
3. Click: "New Song" button
4. Type: Title = "Test Song"
5. Type: Artist = "Test Artist"
6. Click: "Add Line" button
7. Fill form: text="First line", time="0"
8. Screenshot: song-editor-with-line.png
9. Navigate back
10. Snapshot: Verify song appears in list

**Expected Result:**
- Song "Test Song" visible in list
- Artist "Test Artist" displayed
- One line saved with text and timing

**Validates:** Requirements 2.1, 2.2, 2.3
```

### MCP Playwright Tools

**Navigation:**
- `mcp_playwright_browser_navigate({ url })`
- `mcp_playwright_browser_navigate_back()`
- `mcp_playwright_browser_navigate_forward()`

**Interaction:**
- `mcp_playwright_browser_click({ element, ref })`
- `mcp_playwright_browser_type({ element, ref, text })`
- `mcp_playwright_browser_fill_form({ fields })`
- `mcp_playwright_browser_press_key({ key })`

**Verification:**
- `mcp_playwright_browser_snapshot()` - Accessibility tree
- `mcp_playwright_browser_take_screenshot({ filename })`
- `mcp_playwright_browser_console_messages()`
- `mcp_playwright_browser_evaluate({ function })`

### Example Test Session

```typescript
// 1. Navigate to app
mcp_playwright_browser_navigate({ url: "http://localhost:8081" })

// 2. Verify empty state
mcp_playwright_browser_snapshot()
// Should show: "Create your first song"

// 3. Create new song
mcp_playwright_browser_click({ element: "New Song button", ref: "..." })

// 4. Fill in details
mcp_playwright_browser_type({ element: "Title input", ref: "...", text: "My Song" })
mcp_playwright_browser_type({ element: "Artist input", ref: "...", text: "Artist" })

// 5. Add line
mcp_playwright_browser_click({ element: "Add Line button", ref: "..." })
mcp_playwright_browser_fill_form({
  fields: [
    { name: "text", type: "textbox", ref: "...", value: "First line" },
    { name: "time", type: "textbox", ref: "...", value: "0" }
  ]
})

// 6. Take screenshot
mcp_playwright_browser_take_screenshot({ filename: "song-created.png" })

// 7. Go back and verify
mcp_playwright_browser_navigate_back()
mcp_playwright_browser_snapshot()
// Should show: Song in list with title and artist
```

### Test Documentation

All E2E tests are documented in `e2e/test-cases/`:

- `TC-001-song-list-empty.md` - Empty state
- `TC-002-song-creation-basic.md` - Create song
- `TC-003-song-editor-metadata.md` - Edit metadata
- `TC-004-song-editor-lyrics.md` - Edit lyrics
- `TC-005-song-editor-timing.md` - Set timings
- `TC-006-setlist-creation.md` - Create setlist
- `TC-007-setlist-management.md` - Manage setlist
- `TC-008-setlist-reorder.md` - Reorder songs

See `e2e/README.md` for complete E2E testing guide.

---

## Best Practices

### General

1. **Test behavior, not implementation**
   - ❌ Test internal state
   - ✅ Test observable behavior

2. **Keep tests simple and focused**
   - One assertion per test (when possible)
   - Clear test names that describe what's being tested

3. **Use descriptive test names**
   ```typescript
   // ❌ Bad
   it('works', () => { ... });
   
   // ✅ Good
   it('should return null when input is empty string', () => { ... });
   ```

4. **Arrange-Act-Assert pattern**
   ```typescript
   it('should add line to song', () => {
     // Arrange
     const song = createTestSong();
     const newLine = createTestLine();
     
     // Act
     const result = addLine(song, newLine);
     
     // Assert
     expect(result.lines).toHaveLength(song.lines.length + 1);
   });
   ```

### Property-Based Testing

1. **Use smart generators** that produce valid data
2. **Run at least 100 iterations** (`numRuns: 100`)
3. **Tag tests with property number** from design doc
4. **Test one property per test** for clarity

### Component Testing

1. **Test user interactions**, not implementation details
2. **Use accessible queries** (getByText, getByRole)
3. **Wait for async updates** with `waitFor`
4. **Mock external dependencies** (storage, navigation)

### Coverage Goals

- **Critical logic**: 100% coverage (scroll algorithm, storage)
- **Business logic**: 80%+ coverage (hooks, services)
- **UI components**: 60%+ coverage (screens, components)
- **Utilities**: 90%+ coverage (validation, formatting)

### When Tests Fail

1. **Read the error message** carefully
2. **Check if test is correct** - maybe the test is wrong
3. **Check if code is correct** - maybe there's a bug
4. **Check if spec is correct** - maybe requirements changed
5. **Use debugger** to step through code
6. **Simplify** - create minimal reproduction

### Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Every pull request (CI pipeline)
- Before deployment (release process)

---

## Troubleshooting

### Tests Won't Run

```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install

# Check Node version
node --version  # Should be v18+
```

### Tests Timeout

```typescript
// Increase timeout for slow tests
it('should handle large dataset', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Mock Issues

```typescript
// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn()
}));
```

### Property Test Failures

When a property test fails, fast-check shows the failing example:

```
Property failed after 23 tests
{ seed: 1234567890, path: "23", endOnFailure: true }
Counterexample: ["test", 42]
```

To reproduce:
```typescript
fc.assert(
  fc.property(...),
  { seed: 1234567890 } // Use seed from failure
);
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro)
- [fast-check Documentation](https://github.com/dubzzz/fast-check)
- [MCP Playwright](https://github.com/executeautomation/mcp-playwright)

---

For more information:
- [API Documentation](./API.md)
- [E2E Testing Guide](../e2e/README.md)
- [Main README](../README.md)
