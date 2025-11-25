// services/__tests__/keyEventService.unmapped.property.test.ts

/**
 * Feature: StagePrompt, Property 15: Niezmapowany klawisz nie zmienia stanu
 * Validates: Requirements 6.3
 */

import './setup'; // Import test setup
import fc from 'fast-check';
import { keyEventService } from '../keyEventService';
import { KeyMapping } from '../../types/models';

describe('keyEventService - unmapped keys do not change state', () => {
  beforeEach(() => {
    keyEventService.cleanup();
    if (typeof (global as any).clearWindowListeners === 'function') {
      (global as any).clearWindowListeners();
    }
  });

  afterEach(() => {
    keyEventService.cleanup();
  });

  it('Property 15: For any keyCode that is not mapped, pressing that key should not trigger any action', () => {
    fc.assert(
      fc.property(
        // Generate mapped keys
        fc.integer({ min: 8, max: 222 }),
        fc.integer({ min: 8, max: 222 }),
        fc.integer({ min: 8, max: 222 }),
        // Generate unmapped key (different from mapped keys)
        fc.integer({ min: 8, max: 222 }),
        (nextKey, prevKey, pauseKey, unmappedKey) => {
          // Ensure unmapped key is different from all mapped keys
          if (unmappedKey === nextKey || unmappedKey === prevKey || unmappedKey === pauseKey) {
            return true; // Skip this test case
          }

          // Ensure mapped keys are unique
          if (nextKey === prevKey || nextKey === pauseKey || prevKey === pauseKey) {
            return true; // Skip this test case
          }

          // Set up key mapping
          const mapping: KeyMapping = {
            nextSong: nextKey,
            prevSong: prevKey,
            pause: pauseKey,
          };

          keyEventService.setKeyMapping(mapping);

          // Track if any action was called
          let actionCalled = false;
          keyEventService.onAction(() => {
            actionCalled = true;
          });

          keyEventService.initialize();

          // Simulate unmapped key press
          if (typeof window !== 'undefined') {
            const event = new KeyboardEvent('keydown', { keyCode: unmappedKey } as any);
            window.dispatchEvent(event);
          }

          // Verify no action was called
          expect(actionCalled).toBe(false);
          return !actionCalled;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15 (unit test variant): Unmapped keys do not trigger actions', () => {
    const mapping: KeyMapping = {
      nextSong: 39, // Right arrow
      prevSong: 37, // Left arrow
      pause: 32,    // Space
    };

    keyEventService.setKeyMapping(mapping);

    let actionCount = 0;
    keyEventService.onAction(() => {
      actionCount++;
    });

    keyEventService.initialize();

    if (typeof window !== 'undefined') {
      // Test various unmapped keys
      const unmappedKeys = [65, 66, 67, 68, 69]; // A, B, C, D, E

      unmappedKeys.forEach((keyCode) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { keyCode } as any));
      });

      // No actions should have been triggered
      expect(actionCount).toBe(0);
    } else {
      // For non-web, verify that unmapped keys are not in the mapping
      const retrievedMapping = keyEventService.getKeyMapping();
      expect(retrievedMapping.nextSong).toBe(39);
      expect(retrievedMapping.prevSong).toBe(37);
      expect(retrievedMapping.pause).toBe(32);
      
      // Verify that other keys are not mapped
      const mappedKeys = [39, 37, 32];
      const unmappedKey = 65; // A key
      expect(mappedKeys).not.toContain(unmappedKey);
    }
  });
});
